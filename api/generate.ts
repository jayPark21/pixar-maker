import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { contents, generationConfig } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'API Key not configured on server' });
    }

    try {
        // Use gemini-2.0-flash-exp (as requested by user)
        const MODEL_NAME = 'gemini-2.0-flash-exp';
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
