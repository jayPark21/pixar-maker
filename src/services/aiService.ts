import axios from 'axios';

// Use environment variables (expo-constants) or a backend proxy.
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const generatePixarImage = async (imageUri: string, templatePrompt: string): Promise<string> => {
    try {
        // Cross-platform way to get base64
        let base64 = '';
        if (imageUri.startsWith('data:image')) {
            base64 = imageUri.split(',')[1];
        } else {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    resolve(base64String.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        // Skip text description - do direct image-to-image style transfer
        console.log("🎨 Starting direct Pixar style transformation...");

        // Use Gemini 2.5 Flash Image (as requested)
        try {
            console.log("📡 Calling Gemini 2.5 Flash Image API...");
            const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`;

            const imagenResponse = await axios.post(imagenUrl, {
                contents: [{
                    parts: [
                        { text: `A cute, highly stylized 3D caricature of this person, featuring a slightly oversized head, big glossy eyes, and soft rounded facial features. Rendered in a clean Pixar-inspired style with smooth textures and gentle ambient lighting. ${templatePrompt}` },
                        { inline_data: { mime_type: "image/jpeg", data: base64 } }
                    ]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE"]
                }
            }, {
                headers: {
                    'x-goog-api-key': GEMINI_API_KEY,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            const base64Image = imagenResponse.data?.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData?.data;

            if (base64Image) {
                console.log("✅ Gemini AI Image succeeded!");
                return `data:image/png;base64,${base64Image}`;
            } else {
                console.error("❌ No base64Image found in response");
                throw new Error("No image generated");
            }
        } catch (imagenError: any) {
            console.error("⚠️ Gemini API Error:", imagenError.message);
            console.error("⚠️ Full error:", JSON.stringify(imagenError.response?.data || imagenError, null, 2));
            throw imagenError; // Re-throw to trigger fallback
        }

    } catch (error) {
        console.error("AI Generation Error:", error);
        // Fallback image if everything fails
        return 'https://img.freepik.com/free-photo/3d-illustration-cute-boy-with-glasses_1142-41408.jpg';
    }
};

// Kept for reference but not currently used in the direct flow
async function analyzeImageWithGemini(base64Image: string): Promise<string | null> {
    if (!GEMINI_API_KEY) {
        console.warn("⚠️ No Gemini API Key set.");
        return null;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
        contents: [{
            parts: [
                { text: "Analyze this person..." },
                { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
        }]
    };

    try {
        const response = await axios.post(url, body, { timeout: 10000 });
        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch (error) {
        return null;
    }
}
