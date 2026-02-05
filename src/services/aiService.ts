import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
// Use environment variables (expo-constants) or a backend proxy.
// For this MVP prototype, we will use a placeholder variable.
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const generatePixarImage = async (imageUri: string, templatePrompt: string): Promise<string> => {
    try {
        // Convert Image to Base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
        });

        // Skip text description - do direct image-to-image style transfer
        console.log("🎨 Starting direct Pixar style transformation...");

        // 4. Use Gemini 2.5 Flash Image (working model)
        try {
            console.log("📡 Calling Gemini 2.5 Flash Image API...");
            const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`;
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

            // generateContent returns different response format
            const base64Image = imagenResponse.data?.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData?.data;

            if (base64Image) {
                console.log("✅ Gemini 2.5 Flash Image succeeded!");
                return `data:image/png;base64,${base64Image}`;
            } else {
                console.error("❌ No base64Image found in response");
            }
        } catch (imagenError: any) {
            console.error("⚠️ Gemini API Error:", imagenError.message);
            console.error("⚠️ Full error:", JSON.stringify(imagenError.response?.data || imagenError, null, 2));
        }


        // No fallback - return error image if Gemini fails
        console.error("Image transformation failed");
        return 'https://img.freepik.com/free-photo/3d-illustration-cute-boy-with-glasses_1142-41408.jpg';

    } catch (error) {
        console.error("AI Generation Error:", error);
        // Fallback image if everything fails
        return 'https://img.freepik.com/free-photo/3d-illustration-cute-boy-with-glasses_1142-41408.jpg';
    }
};

async function analyzeImageWithGemini(base64Image: string): Promise<string | null> {
    // If no API key is set, return a generic description
    if (!GEMINI_API_KEY) {
        console.warn("⚠️ No Gemini API Key set. Using generic description.");
        return "a person with glasses and dark hair";
    }

    // Use the latest supported model: gemini-2.0-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
        contents: [
            {
                parts: [
                    { text: "Analyze this person's photo and describe their physical features in detail. Include: face shape (round/oval/square/heart), skin tone, estimated age range, hair style and color, facial hair (if any), glasses style and color, clothing color, facial expression, and any distinctive features like eyebrows, nose shape, or smile. Provide 10-15 descriptive keywords or short phrases, separated by commas. Be specific and detailed." },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image
                        }
                    }
                ]
            }
        ]
    };

    try {
        const response = await axios.post(url, body, {
            timeout: 10000, // 10 second timeout
        });
        // Extract the text
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return text ? text.trim() : null;
    } catch (error: any) {
        console.error("Gemini API Error Detail:", JSON.stringify(error.response?.data || error.message, null, 2));
        // Return null instead of throwing so we can use fallback
        return null;
    }
}
