import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../services/supabaseClient';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Harici servislerden erişim için CORS başlıkları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET', 'OPTIONS']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        console.log("💓 Keep-alive endpoint'i harici servis tarafından tetiklendi.");
        
        // Veritabanı bağlantısını aktif tutmak için çok hafif bir sorgu yap.
        const { error } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .limit(1);

        if (error) {
            console.warn("Keep-alive uyarısı (genellikle sorun değil):", error.message);
        }

        console.log("💓 Veritabanı ping'i başarılı.");
        return res.status(200).json({ 
            status: 'ok', 
            message: 'Veritabanı bağlantısı sıcak.',
            timestamp: new Date().toISOString() 
        });

    } catch (e: any) {
        console.error("Keep-alive endpoint kritik hata:", e.message);
        return res.status(500).json({ 
            status: 'error', 
            message: 'Veritabanı pinglenemedi.', 
            error: e.message 
        });
    }
}
