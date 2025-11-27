import { auth, db } from './firebaseClient';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile as updateAuthProfile } from "firebase/auth";
import * as firestore from "firebase/firestore";
import { User, UserRole, UserStatus } from '../types';

const { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, deleteDoc } = firestore;

const ADMIN_EMAILS = ['morimasi@gmail.com', 'meliksahterdek@gmail.com'];

// Map Firestore doc to App User type
const mapDbUserToAppUser = (docData: any, uid: string, email: string): User => ({
    id: uid,
    email: email,
    name: docData.name || email?.split('@')[0] || 'Kullanıcı',
    role: ADMIN_EMAILS.includes(email) ? 'admin' : (docData.role || 'user'),
    avatar: docData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    createdAt: docData.createdAt || new Date().toISOString(),
    lastLogin: docData.lastLogin || new Date().toISOString(),
    worksheetCount: docData.worksheetCount || 0,
    status: docData.status || 'active',
    subscriptionPlan: docData.subscriptionPlan || 'free'
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
            const newUserProfile = {
                name: name,
                email: email,
                role: ADMIN_EMAILS.includes(email) ? 'admin' : 'user',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                status: 'active',
                subscriptionPlan: 'free',
                worksheetCount: 0
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
                    role: ADMIN_EMAILS.includes(currentUser.email!) ? 'admin' : 'user',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    worksheetCount: 0,
                    status: 'active',
                    subscriptionPlan: 'free'
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

        await updateDoc(userDocRef, dbUpdates);
        
        const updatedSnap = await getDoc(userDocRef);
        return mapDbUserToAppUser(updatedSnap.data(), userId, auth.currentUser?.email || '');
    },

    updatePassword: async (newPassword: string): Promise<void> => {
        const user = auth.currentUser;
        if (user) {
            // Firebase v9 updatePassword from firebase/auth
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
                    // FIX: Cast doc.data() to any to access its properties.
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
        // Firestore pagination requires cursors, for simplicity we fetch a larger limit here
        // or implement proper cursor-based pagination if needed later.
        try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100));
            const querySnapshot = await getDocs(q);
            const users: User[] = [];
            querySnapshot.forEach((doc) => {
                // FIX: Cast doc.data() to any to access its properties.
                const data = doc.data() as any;
                users.push(mapDbUserToAppUser(data, doc.id, data.email));
            });
            return { users: users, count: users.length };
        } catch (error) {
            console.error("Get all users error:", error);
            return { users: [], count: 0 };
        }
    },

    deleteUser: async (userId: string): Promise<void> => {
        await deleteDoc(doc(db, "users", userId));
        // Note: This only deletes the Firestore doc. Deleting Auth user requires Admin SDK.
    },

    toggleUserStatus: async (userId: string, currentStatus: string): Promise<void> => {
        const newStatus: UserStatus = currentStatus === 'active' ? 'suspended' : 'active';
        await updateDoc(doc(db, "users", userId), { status: newStatus });
    },

    updateUserRole: async (userId: string, newRole: UserRole): Promise<void> => {
        await updateDoc(doc(db, "users", userId), { role: newRole });
    }
};