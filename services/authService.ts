
import { auth, db } from './firebaseClient';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile as updateAuthProfile } from "firebase/auth";
import * as firestore from "firebase/firestore";
import { User, UserRole, UserStatus, ActivityType } from '../types';

const { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, deleteDoc, increment } = firestore;

// Map Firestore doc to App User type
const mapDbUserToAppUser = (docData: any, uid: string, email: string): User => ({
    id: uid,
    email: email,
    name: docData.name || email?.split('@')[0] || 'Kullanıcı',
    // ROLE IS NOW SOLELY DETERMINED BY DATABASE
    role: docData.role || 'user', 
    avatar: docData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    createdAt: docData.createdAt || new Date().toISOString(),
    lastLogin: docData.lastLogin || new Date().toISOString(),
    worksheetCount: docData.worksheetCount || 0,
    status: docData.status || 'active',
    subscriptionPlan: docData.subscriptionPlan || 'free',
    favorites: docData.favorites || [],
    lastActiveActivity: docData.lastActiveActivity || undefined
});

export const authService = {
    login: async (email: string, pass: string): Promise<User> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            // Firestore'dan profil verisini çek
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            let userData = userDocSnap.exists() ? userDocSnap.data() : {};

            // Son giriş tarihini güncelle
            await setDoc(userDocRef, { 
                lastLogin: new Date().toISOString(),
                email: user.email // Ensure email is synced
            }, { merge: true });

            const mappedUser = mapDbUserToAppUser(userData, user.uid, user.email!);

            if (mappedUser.status === 'suspended') {
                await signOut(auth);
                throw new Error('Hesabınız askıya alınmıştır. Lütfen yönetici ile iletişime geçin.');
            }

            return mappedUser;
        } catch (error: any) {
            console.error("Login error:", error);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                throw new Error("Giriş yapılamadı: E-posta adresi veya şifre hatalı.");
            }
            throw new Error(`Giriş hatası: ${error.message}`);
        }
    },

    register: async (email: string, pass: string, name: string): Promise<User> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            // Firebase Auth profilini güncelle (isim)
            await updateAuthProfile(user, { displayName: name });

            // Firestore'da kullanıcı dokümanı oluştur
            // Default role is always 'user'. Admin role must be set manually in DB console or by another admin.
            const newUserProfile = {
                name: name,
                email: email,
                role: 'user', 
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                status: 'active',
                subscriptionPlan: 'free',
                worksheetCount: 0,
                favorites: []
            };

            await setDoc(doc(db, "users", user.uid), newUserProfile);

            return mapDbUserToAppUser(newUserProfile, user.uid, email);
        } catch (error: any) {
            console.error("Register error:", error);
            if (error.code === 'auth/email-already-in-use') throw new Error("Bu e-posta adresi zaten kayıtlı.");
            throw new Error("Kayıt hatası: " + error.message);
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
                    favorites: []
                };
            }
        } catch (error) {
            console.error("Get current user error:", error);
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

        await updateDoc(userDocRef, dbUpdates);
        
        const updatedSnap = await getDoc(userDocRef);
        return mapDbUserToAppUser(updatedSnap.data(), userId, auth.currentUser?.email || '');
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
        } catch (e) {
            console.error("Failed to record activity generation for user", e);
        }
    },

    updatePassword: async (newPassword: string): Promise<void> => {
        const user = auth.currentUser;
        if (user) {
            const { updatePassword } = await import("firebase/auth");
            await updatePassword(user, newPassword);
        } else {
            throw new Error("Kullanıcı oturumu bulunamadı.");
        }
    },

    getContacts: async (currentUserId: string): Promise<User[]> => {
        try {
            const q = query(collection(db, "users"), limit(50));
            const querySnapshot = await getDocs(q);
            const users: User[] = [];
            querySnapshot.forEach((doc) => {
                if (doc.id !== currentUserId) {
                    const data = doc.data() as any;
                    if (data.status !== 'suspended') {
                        users.push(mapDbUserToAppUser(data, doc.id, data.email));
                    }
                }
            });
            return users;
        } catch (error) {
            console.error("Get contacts error:", error);
            return [];
        }
    },

    getAllUsers: async (page: number, pageSize: number): Promise<{ users: User[], count: number | null }> => {
        try {
            // In a real app, pagination would use startAfter/limit.
            // For this scale, fetching top 100 is acceptable.
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100));
            const querySnapshot = await getDocs(q);
            const users: User[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                users.push(mapDbUserToAppUser(data, doc.id, data.email));
            });
            return { users: users, count: users.length };
        } catch (error) {
            console.error("Get all users error:", error);
            return { users: [], count: 0 };
        }
    },

    // --- ADMIN ACTIONS ---

    deleteUser: async (userId: string): Promise<void> => {
        // Note: Deleting user from Auth requires Cloud Functions or Admin SDK.
        // Here we just delete the Firestore document.
        await deleteDoc(doc(db, "users", userId));
    },

    toggleUserStatus: async (userId: string, currentStatus: string): Promise<void> => {
        const newStatus: UserStatus = currentStatus === 'active' ? 'suspended' : 'active';
        await updateDoc(doc(db, "users", userId), { status: newStatus });
    },

    updateUserRole: async (userId: string, newRole: UserRole): Promise<void> => {
        await updateDoc(doc(db, "users", userId), { role: newRole });
    }
};
