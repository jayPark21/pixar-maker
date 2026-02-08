import axios from 'axios';

// Use environment variables (expo-constants) or a backend proxy.
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const generatePixarImage = async (imageUri: string, templatePrompt: string): Promise<string> => {
    try {
        console.log("🎨 Starting Pixar generation...");

        let base64 = '';
        if (imageUri.startsWith('data:image')) {
            base64 = imageUri.split(',')[1];
        } else {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        // Direct Image-to-Image Generation (as requested by user)
        // Using 'gemini-2.0-flash-exp' which supports direct image generation.
        const MODEL_NAME = 'gemini-2.0-flash-exp';

        try {
            console.log(`📡 Calling ${MODEL_NAME} API for direct image generation...`);
            const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

            const genResponse = await axios.post(genUrl, {
                contents: [{
                    parts: [
                        { text: `Turn this person into a 3D Pixar-style character. ${templatePrompt}. Output only the image.` },
                        { inline_data: { mime_type: "image/jpeg", data: base64 } }
                    ]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE"]
                }
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });

            // Extract image data
            const generatedBase64 = genResponse.data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;

            if (generatedBase64) {
                console.log("✅ Image Generation Successful!");
                return `data:image/png;base64,${generatedBase64}`;
            }

            console.error("❌ No image data in Gemini response:", JSON.stringify(genResponse.data));
            throw new Error("No image data in response");

        } catch (genError: any) {
            console.error("❌ Generation failed:", genError.response?.data || genError.message);
            throw genError;
        }

    } catch (error) {
        console.error("🚨 Final Fallback Triggered:", error);
        // Fallback image (3D Boy)
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
