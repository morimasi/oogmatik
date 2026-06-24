import { AppError } from '../utils/AppError';

import { auth, db } from './firebaseClient.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    updateProfile as updateAuthProfile,
    GoogleAuthProvider,
    getAuth,
} from "firebase/auth";
import type { UserCredential } from "firebase/auth";
import * as firestore from "firebase/firestore";
import { User, UserRole, UserStatus, ActivityType } from '../types.js';

import { logInfo, logError } from '../utils/logger.js';
import { activityLogService } from './activityLogService';
const { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, deleteDoc, increment, where } = firestore;

// SUPER ADMIN EMAIL - Ortam değişkeninden alınıyor (Güvenlik)
const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'morimasi@gmail.com';

// Map Firestore doc to App User type
const mapDbUserToAppUser = (docData: Record<string, unknown>, uid: string, email: string): User => {
    const d = docData;
    const role = email === SUPER_ADMIN_EMAIL ? 'superadmin' : ((d.role as string) || 'teacher');
    
    return {
        id: uid,
        email: email,
        name: (d.name as string) || email?.split('@')[0] || 'Kullanıcı',
        role: role,
        avatar: (d.avatar as string) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        createdAt: (d.createdAt as string) || new Date().toISOString(),
        lastLogin: (d.lastLogin as string) || new Date().toISOString(),
        worksheetCount: (d.worksheetCount as number) || 0,
        status: (d.status as string) || 'active',
        subscriptionPlan: (d.subscriptionPlan as string) || 'free',
        favorites: (d.favorites as string[]) || [],
        lastActiveActivity: d.lastActiveActivity as string | undefined,
        profession: (d.profession as string) || '',
        institution: (d.institution as string) || '',
        phone: (d.phone as string) || '',
        bio: (d.bio as string) || '',
        pedagogySettings: d.pedagogySettings as Record<string, unknown> | undefined,
        aiAssistantSettings: d.aiAssistantSettings as Record<string, unknown> | undefined,
        notificationSettings: d.notificationSettings as Record<string, unknown> | undefined
    };
};

export const authService = {
    login: async (email: string, pass: string): Promise<User> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            // Firestore'dan profil verisini çek
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            const userData = userDocSnap.exists() ? userDocSnap.data() : {};

            // Son giriş tarihini güncelle
            await setDoc(userDocRef, {
                lastLogin: new Date().toISOString(),
                email: user.email // Ensure email is synced
            }, { merge: true });

            const mappedUser = mapDbUserToAppUser(userData, user.uid, user.email!);

            if (mappedUser.status === 'suspended') {
                await signOut(auth);
                throw new AppError('Hesabınız askıya alınmıştır. Lütfen yönetici ile iletişime geçin.', 'INTERNAL_ERROR', 500);
            }

            activityLogService.logActivity(user.uid, 'login', 'Giriş Yapıldı', `E-posta: ${email}`);
            return mappedUser;
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            const errCode = error && typeof error === 'object' && 'code' in error ? String((error as { code: string }).code) : undefined;
            logError("Login error details:", {
                code: errCode,
                message: errMsg,
                email: email
            });
            
            if (errCode === 'auth/operation-not-allowed') {
                throw new AppError("Sistem Hatası: Email/Şifre girişi Firebase Console üzerinden etkinleştirilmemiş. Lütfen 'Authentication > Sign-in method' altından aktif edin.", 'INTERNAL_ERROR', 500);
            }
            if (errCode === 'auth/invalid-credential' || errCode === 'auth/user-not-found' || errCode === 'auth/wrong-password') {
                throw new AppError("Giriş yapılamadı: E-posta adresi veya şifre hatalı.", 'INTERNAL_ERROR', 500);
            }
            throw new AppError(`Giriş hatası: ${errMsg}`, 'INTERNAL_ERROR', 500);
        }
    },

    _handleGoogleUser: async (user: UserCredential['user']): Promise<void> => {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            const newUserProfile = {
                name: user.displayName || 'Google Kullanıcısı',
                email: user.email,
                role: user.email === SUPER_ADMIN_EMAIL ? 'superadmin' : 'teacher',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                status: user.email === SUPER_ADMIN_EMAIL ? 'active' : 'pending',
                subscriptionPlan: 'free',
                worksheetCount: 0,
                favorites: [],
                profession: '',
                institution: '',
                phone: '',
                bio: ''
            };
            await setDoc(userDocRef, newUserProfile);
            activityLogService.logActivity(user.uid, 'login', 'İlk Giriş (Google)', `E-posta: ${user.email}`);
        } else {
            await updateDoc(userDocRef, { lastLogin: new Date().toISOString() });
            activityLogService.logActivity(user.uid, 'login', 'Giriş Yapıldı (Google)', `E-posta: ${user.email}`);
        }
    },

    loginWithGoogle: async (): Promise<void> => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            const { signInWithPopup } = await import("firebase/auth");

            // Sadece Popup kullan (Redirect Vercel'da çerez/domain sorunlarına yol açar)
            const result = await signInWithPopup(auth, provider);
            if (result?.user) {
                await authService._handleGoogleUser(result.user);
            }
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            const errCode = error && typeof error === 'object' && 'code' in error ? String((error as { code: string }).code) : undefined;
            logError("Google login error:", { code: errCode, message: errMsg });
            
            if (errCode === 'auth/popup-closed-by-user' || errCode === 'auth/cancelled') {
                throw new AppError("Giriş işlemi sizin tarafınızdan iptal edildi.", 'CANCELLED', 400);
            }
            
            throw new AppError(`Google ile giriş yapılamadı: ${errMsg}`, 'INTERNAL_ERROR', 500);
        }
    },
    handleRedirectResult: async (): Promise<User | null> => {
        try {
            const { getRedirectResult } = await import("firebase/auth");
            const result = await getRedirectResult(auth);
            
            if (!result) {
                logInfo("No redirect result found.");
                return null;
            }
            
            logInfo(`Redirect result found for user: ${result.user.email || 'unknown'}`);
            const user = result.user;
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                const newUserProfile = {
                    name: user.displayName || 'Google Kullanıcısı',
                    email: user.email,
                    role: user.email === SUPER_ADMIN_EMAIL ? 'superadmin' : 'teacher',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                    status: user.email === SUPER_ADMIN_EMAIL ? 'active' : 'pending',
                    subscriptionPlan: 'free',
                    worksheetCount: 0,
                    favorites: [],
                    profession: '',
                    institution: '',
                    phone: '',
                    bio: ''
                };
                await setDoc(userDocRef, newUserProfile);
                return mapDbUserToAppUser(newUserProfile, user.uid, user.email!);
            } else {
                await updateDoc(userDocRef, {
                    lastLogin: new Date().toISOString()
                });
                return mapDbUserToAppUser(userDocSnap.data(), user.uid, user.email!);
            }
        } catch (error: unknown) {
            logError("Handle redirect result error:", error instanceof Error ? error : String(error));
            return null;
        }
    },

    register: async (email: string, pass: string, name: string): Promise<User> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            // Firebase Auth profilini güncelle (isim)
            await updateAuthProfile(user, { displayName: name });

            // Firestore'da kullanıcı dokümanı oluştur
            // Default role is always 'user' (except superadmin email)
            const newUserProfile = {
                name: name,
                email: email,
                role: email === SUPER_ADMIN_EMAIL ? 'superadmin' : 'teacher',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                status: email === SUPER_ADMIN_EMAIL ? 'active' : 'pending',
                subscriptionPlan: 'free',
                worksheetCount: 0,
                favorites: [],
                profession: '',
                institution: '',
                phone: '',
                bio: ''
            };

            await setDoc(doc(db, "users", user.uid), newUserProfile);

            activityLogService.logActivity(user.uid, 'login', 'Kayıt Olundu', `E-posta: ${email}`);
            return mapDbUserToAppUser(newUserProfile, user.uid, email);
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            const errCode = error && typeof error === 'object' && 'code' in error ? String((error as { code: string }).code) : undefined;
            logError("Register error:", error instanceof Error ? error : String(error));
            if (errCode === 'auth/email-already-in-use') throw new AppError("Bu e-posta adresi zaten kayıtlı.", 'INTERNAL_ERROR', 500);
            throw new AppError("Kayıt hatası: " + errMsg, 'INTERNAL_ERROR', 500);
        }
    },

    logout: async () => {
        await signOut(auth);
    },

    getCurrentUser: async (): Promise<User | null> => {
        const currentUser = auth.currentUser;
        if (!currentUser) return null;

        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                return mapDbUserToAppUser(userDocSnap.data(), currentUser.uid, currentUser.email!);
            } else {
                // Doküman yoksa (manuel silindiyse veya hata olduysa) auth bilgisinden dön
                return {
                    id: currentUser.uid,
                    email: currentUser.email!,
                    name: currentUser.displayName || currentUser.email!.split('@')[0],
                    role: 'teacher', // Default safe fallback
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    worksheetCount: 0,
                    status: 'active',
                    subscriptionPlan: 'free',
                    favorites: [],
                    profession: '',
                    institution: '',
                    phone: '',
                    bio: ''
                };
            }
        } catch (error: unknown) {
            logError("Get current user error:", { detail: String(error) });
            return null;
        }
    },

    updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
        const userDocRef = doc(db, "users", userId);

        const dbUpdates: Partial<User> = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.avatar) dbUpdates.avatar = updates.avatar;
        if (updates.worksheetCount !== undefined) dbUpdates.worksheetCount = updates.worksheetCount;
        if (updates.favorites) dbUpdates.favorites = updates.favorites;
        if (updates.profession !== undefined) dbUpdates.profession = updates.profession;
        if (updates.institution !== undefined) dbUpdates.institution = updates.institution;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
        if (updates.pedagogySettings) dbUpdates.pedagogySettings = updates.pedagogySettings;
        if (updates.aiAssistantSettings) dbUpdates.aiAssistantSettings = updates.aiAssistantSettings;
        if (updates.notificationSettings) dbUpdates.notificationSettings = updates.notificationSettings;

        await updateDoc(userDocRef, dbUpdates as any);

        const updatedSnap = await getDoc(userDocRef);
        const data = updatedSnap.data() as Record<string, unknown>;
        return mapDbUserToAppUser(data, userId, auth.currentUser?.email || '');
    },

    recordActivityGeneration: async (userId: string, activityId: string, activityTitle: string): Promise<void> => {
        try {
            const userDocRef = doc(db, "users", userId);
            await updateDoc(userDocRef, {
                worksheetCount: increment(1),
                lastActiveActivity: {
                    id: activityId,
                    title: activityTitle,
                    date: new Date().toISOString()
                }
            });
        } catch (e: unknown) {
            logError("Failed to record activity generation for user", e instanceof Error ? e : String(e));
        }
    },

    updatePassword: async (newPassword: string): Promise<void> => {
        const user = auth.currentUser;
        if (user) {
            const { updatePassword } = await import("firebase/auth");
            await updatePassword(user, newPassword);
        } else {
            throw new AppError("Kullanıcı oturumu bulunamadı.", 'INTERNAL_ERROR', 500);
        }
    },

    getContacts: async (currentUserId: string): Promise<User[]> => {
        try {
            // Güvenlik Önlemi: Tüm veritabanını çekmek yerine limitli sorgu (FAZ 2)
            // İdeal Senaryo: Yalnızca "onaylı bağlantılar" veya "aynı kurumdaki kullanıcılar"
            const q = query(collection(db, "users"), limit(50));
            const querySnapshot = await getDocs(q);
            const users: User[] = [];
            querySnapshot.forEach((doc: any) => {
                if (doc.id !== currentUserId) {
                    const data = doc.data() as any;
                    // Askıya alınmış veya admin olmayanları gizle (opsiyonel mantık)
                    if (data.status !== 'suspended') {
                        users.push(mapDbUserToAppUser(data, doc.id, data.email));
                    }
                }
            });
            return users;
        } catch (error: unknown) {
            logError("Get contacts error:", error instanceof Error ? error : String(error));
            return [];
        }
    },

    getMultipleUsers: async (userIds: string[]): Promise<User[]> => {
        if (!userIds || userIds.length === 0) return [];
        try {
            // Firestore 'in' operasyonu max 10-30 öğe alabilir. (Genelde 10 veya 30'dur)
            // Biz batch olarak yapalım.
            const batches = [];
            const results: User[] = [];
            
            for (let i = 0; i < userIds.length; i += 10) {
                const batchIds = userIds.slice(i, i + 10);
                const q = query(collection(db, "users"), firestore.where(firestore.documentId(), "in", batchIds));
                batches.push(getDocs(q));
            }
            
            const snapshots = await Promise.all(batches);
            snapshots.forEach((snapshot: firestore.QuerySnapshot<firestore.DocumentData>) => {
                snapshot.forEach((doc: firestore.QueryDocumentSnapshot<firestore.DocumentData>) => {
                    const data = doc.data();
                    results.push(mapDbUserToAppUser(data, doc.id, data.email as string));
                });
            });
            
            return results;
        } catch (error: unknown) {
            logError("Get multiple users error:", error instanceof Error ? error : String(error));
            return [];
        }
    },

    getAllUsers: async (_page: number, _pageSize: number): Promise<{ users: User[], count: number | null }> => {
        try {
            // In a real app, pagination would use startAfter/limit.
            // For this scale, fetching top 100 is acceptable.
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100));
            const querySnapshot = await getDocs(q);
            const users: User[] = [];
            querySnapshot.forEach((doc: firestore.QueryDocumentSnapshot<firestore.DocumentData>) => {
                const data = doc.data() as any;
                users.push(mapDbUserToAppUser(data, doc.id, data.email as string));
            });
            return { users: users, count: users.length };
        } catch (error: unknown) {
            logError("Get all users error:", error instanceof Error ? error : String(error));
            return { users: [], count: 0 };
        }
    },

    // --- ADMIN ACTIONS ---

    deleteUser: async (userId: string, isSelfDelete: boolean = true): Promise<void> => {
        // Firestore dokümanını sil
        await deleteDoc(doc(db, "users", userId));

        // Öğrenci verilerini temizle (KVKK Madde 7)
        const studentsSnap = await getDocs(
            query(collection(db, 'students'), where('teacherId', '==', userId))
        );
        const deletePromises = studentsSnap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);

        // Firebase Auth kaydını sil
        if (isSelfDelete) {
            const authInstance = getAuth();
            if (authInstance.currentUser) {
                await authInstance.currentUser.delete();
            }
        } else {
            // Admin silmesi için Cloud Function gerekli
            // TODO: Call Cloud Function: admin.auth().deleteUser(userId)
        }
    },

    toggleUserStatus: async (userId: string, currentStatus: string): Promise<void> => {
        const newStatus: UserStatus = currentStatus === 'active' ? 'suspended' : 'active';
        await updateDoc(doc(db, "users", userId), { status: newStatus });
    },

    updateUserRole: async (userId: string, newRole: UserRole): Promise<void> => {
        await updateDoc(doc(db, "users", userId), { role: newRole });
    }
};
