import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Deployment trigger: 2026-02-08T11:25:00
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { contents, generationConfig } = req.body;
    // Check both standard and Expo-prefixed keys for maximum compatibility
    const API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!API_KEY) {
        console.error('❌ API Key missing in environment variables');
        return res.status(500).json({ error: 'API Key not configured on server' });
    }

    try {
        // Use gemini-2.5-flash-image (Optimized for image-to-image as requested)
        const MODEL_NAME = 'gemini-2.5-flash-image';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        console.log(`📡 Server Proxy: Calling Gemini API for model ${MODEL_NAME}`);

        const response = await axios.post(url, {
            contents,
            generationConfig
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
        });

        // 3. Return the exact response from Gemini to the client
        return res.status(200).json(response.data);

    } catch (error: any) {
        console.error('❌ Server Proxy Error:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    }
}
