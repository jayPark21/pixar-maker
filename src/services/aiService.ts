import axios from 'axios';

// Use environment variables (expo-constants) or a backend proxy.
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

        // 1. First, analyze the face to get a description (using stable 1.5-flash)
        // This ensures we at least get "read" access working.
        let faceDescription = "A person";
        try {
            const analyzeUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            const analyzeResponse = await axios.post(analyzeUrl, {
                contents: [{
                    parts: [
                        { text: "Describe this person's key facial features (hair style/color, glasses, expression, gender, age) in 1 sentence for a caricature artist. Be concise." },
                        { inline_data: { mime_type: "image/jpeg", data: base64 } }
                    ]
                }]
            });
            faceDescription = analyzeResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "A cute person";
            console.log("🔍 Face Analyzed:", faceDescription);
        } catch (e) {
            console.warn("⚠️ Analysis failed, using default description", e);
        }

        // 2. Try to Generate Image with Gemini 2.0 Flash Exp (Experimental)
        // This is the only model currently offering direct image generation via this API pattern in public beta
        try {
            console.log("🎨 Generating Image with Gemini 2.0 Flash Exp...");
            const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

            // Construct a rich prompt combining the analysis and the template
            const fullPrompt = `Create a 3D Pixar-style caricature of: ${faceDescription}. 
            Style: ${templatePrompt}. 
            Render: High quality 3D render, cute, big eyes, soft lighting, 4k.`;

            const genResponse = await axios.post(genUrl, {
                contents: [{
                    parts: [{ text: fullPrompt }]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE"],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } } // Sometimes helps trigger multimodal
                }
            });

            // Extract image data
            const generatedBase64 = genResponse.data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;

            if (generatedBase64) {
                console.log("✅ Image Generation Successful!");
                return `data:image/png;base64,${generatedBase64}`;
            }

            throw new Error("No image data in response");

        } catch (genError: any) {
            console.error("❌ Generation failed:", genError.response?.data || genError.message);
            // Re-throw to hit the outer catch block which returns the fallback 3D boy
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
