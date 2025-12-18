
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { activityType, activityTitle, rating, message, email, timestamp } = req.body;

        // LOGGING THE FEEDBACK
        // In a real scenario, this is where you would save to a database (Supabase, MongoDB)
        // or send an email via an API like SendGrid or Resend.
        
        console.log("--- YENİ GERİ BİLDİRİM ALINDI ---");
        console.log("Hedef:", "morimasi@gmail.com");
        console.log("Zaman:", timestamp);
        console.log("Etkinlik:", activityTitle, `(${activityType})`);
        console.log("Puan:", rating);
        console.log("Kimden:", email || "Anonim");
        console.log("Mesaj:", message);
        console.log("---------------------------------");

        return res.status(200).json({ success: true, message: "Geri bildirim günlüğe kaydedildi." });
    } catch (error) {
        console.error("Feedback API Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
