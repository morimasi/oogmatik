import { AppError } from '../utils/AppError';

import { auth, db } from './firebaseClient.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    updateProfile as updateAuthProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import * as firestore from "firebase/firestore";
import { User, UserRole, UserStatus, ActivityType } from '../types.js';

import { logInfo, logError, logWarn } from '../utils/logger.js';
const { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, deleteDoc, increment } = firestore;

// SUPER ADMIN EMAIL - Hardcoded for security
const SUPER_ADMIN_EMAIL = 'morimasi@gmail.com';

// Map Firestore doc to App User type
const mapDbUserToAppUser = (docData: any, uid: string, email: string): User => {
    // Force superadmin role for specific email
    const role = email === SUPER_ADMIN_EMAIL ? 'superadmin' : (docData.role || 'user');
    
    return {
        id: uid,
        email: email,
        name: docData.name || email?.split('@')[0] || 'Kullanıcı',
        role: role,
        avatar: docData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        createdAt: docData.createdAt || new Date().toISOString(),
        lastLogin: docData.lastLogin || new Date().toISOString(),
        worksheetCount: docData.worksheetCount || 0,
        status: docData.status || 'active',
        subscriptionPlan: docData.subscriptionPlan || 'free',
        favorites: docData.favorites || [],
        lastActiveActivity: docData.lastActiveActivity || undefined,
        profession: docData.profession || '',
        institution: docData.institution || '',
        phone: docData.phone || '',
        bio: docData.bio || ''
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

            return mappedUser;
        } catch (error: any) {
            logError("Login error details:", {
                code: error.code,
                message: error.message,
                email: email
            });
            
            if (error.code === 'auth/operation-not-allowed') {
                throw new AppError("Sistem Hatası: Email/Şifre girişi Firebase Console üzerinden etkinleştirilmemiş. Lütfen 'Authentication > Sign-in method' altından aktif edin.", 'INTERNAL_ERROR', 500);
            }
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                throw new AppError("Giriş yapılamadı: E-posta adresi veya şifre hatalı.", 'INTERNAL_ERROR', 500);
            }
            throw new AppError(`Giriş hatası: ${error.message}`, 'INTERNAL_ERROR', 500);
        }
    },

    loginWithGoogle: async (): Promise<void> => {
        try {
            const provider = new GoogleAuthProvider();
            // Google hesabını seçmesi için zorla (isteğe bağlı)
            provider.setCustomParameters({ prompt: 'select_account' });
            
            // Redirect yerine Popup kullanıyoruz
            // Popup yöntemi, yönlendirme sonrası durum kayıplarını (Zustand) önler
            const { signInWithPopup } = await import("firebase/auth");
            logInfo("Starting Google Login Popup...");
            
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                const newUserProfile = {
                    name: user.displayName || 'Google Kullanıcısı',
                    email: user.email,
                    role: user.email === SUPER_ADMIN_EMAIL ? 'superadmin' : 'user',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                    status: 'active',
                    subscriptionPlan: 'free',
                    worksheetCount: 0,
                    favorites: [],
                    profession: '',
                    institution: '',
                    phone: '',
                    bio: ''
                };
                await setDoc(userDocRef, newUserProfile);
            } else {
                await updateDoc(userDocRef, {
                    lastLogin: new Date().toISOString()
                });
            }
        } catch (error: any) {
            // Filter COOP warnings - they don't affect functionality
            if (error.code === 'auth/popup-closed-by-user' || 
                error.code === 'auth/cancelled' ||
                error.message?.includes('Cross-Origin-Opener-Policy')) {
                logInfo('Google login popup closed or COOP warning');
                return;
            }
            
            logError("Google login popup error details:", {
                code: error.code,
                message: error.message
            });
            throw new AppError(`Google ile giriş başlatılamadı: ${error.message}`, 'INTERNAL_ERROR', 500);
        }
    },

    // Yönlendirme sonrası sonucu işlemek için yeni metod
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
                    role: user.email === SUPER_ADMIN_EMAIL ? 'superadmin' : 'user',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                    status: 'active',
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
        } catch (error: any) {
            logError("Handle redirect result error:", error);
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
                role: email === SUPER_ADMIN_EMAIL ? 'superadmin' : 'user',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                status: 'active',
                subscriptionPlan: 'free',
                worksheetCount: 0,
                favorites: [],
                profession: '',
                institution: '',
                phone: '',
                bio: ''
            };

            await setDoc(doc(db, "users", user.uid), newUserProfile);

            return mapDbUserToAppUser(newUserProfile, user.uid, email);
        } catch (error: any) {
            logError("Register error:", error);
            if (error.code === 'auth/email-already-in-use') throw new AppError("Bu e-posta adresi zaten kayıtlı.", 'INTERNAL_ERROR', 500);
            throw new AppError("Kayıt hatası: " + error.message, 'INTERNAL_ERROR', 500);
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
                    role: 'user', // Default safe fallback
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
        } catch (error: any) {
            logError("Get current user error:", error);
            return null;
        }
    },

    updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
        const userDocRef = doc(db, "users", userId);

        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.avatar) dbUpdates.avatar = updates.avatar;
        if (updates.worksheetCount !== undefined) dbUpdates.worksheetCount = updates.worksheetCount;
        if (updates.favorites) dbUpdates.favorites = updates.favorites;
        if (updates.profession !== undefined) dbUpdates.profession = updates.profession;
        if (updates.institution !== undefined) dbUpdates.institution = updates.institution;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;

        await updateDoc(userDocRef, dbUpdates);

        const updatedSnap = await getDoc(userDocRef);
        const data = updatedSnap.data() as Record<string, any>;
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
        } catch (e: any) {
            logError("Failed to record activity generation for user", e);
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
        } catch (error: any) {
            logError("Get contacts error:", error);
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
            querySnapshot.forEach((doc: any) => {
                const data = doc.data() as any;
                users.push(mapDbUserToAppUser(data, doc.id, data.email));
            });
            return { users: users, count: users.length };
        } catch (error: any) {
            logError("Get all users error:", error);
            return { users: [], count: 0 };
        }
    },

    // --- ADMIN ACTIONS ---

    deleteUser: async (userId: string): Promise<void> => {
        // Güvenlik Uyarısı (FAZ 2)
        // Client-side SDK üzerinden başka bir kullanıcının Auth kaydı SİLİNEMEZ.
        // Şimdilik sadece firestore belgesini siliyoruz. 
        // DOĞRU YÖNTEM: Firebase Cloud Functions `httpsCallable` ile backend'de admin.auth().deleteUser(uid) çağırmak.

        await deleteDoc(doc(db, "users", userId));

        /* Örnek Cloud Function Entegrasyonu:
        import { getFunctions, httpsCallable } from 'firebase/functions';
        const functions = getFunctions(app, 'europe-west1');
        const deleteAuthUser = httpsCallable(functions, 'deleteAuthUser');
        await deleteAuthUser({ uid: userId });
        */
    },

    toggleUserStatus: async (userId: string, currentStatus: string): Promise<void> => {
        const newStatus: UserStatus = currentStatus === 'active' ? 'suspended' : 'active';
        await updateDoc(doc(db, "users", userId), { status: newStatus });
    },

    updateUserRole: async (userId: string, newRole: UserRole): Promise<void> => {
        await updateDoc(doc(db, "users", userId), { role: newRole });
    }
};
