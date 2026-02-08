import axios from 'axios';

// Use environment variables (expo-constants). 
// Note: In web builds, EXPO_PUBLIC_ prefix makes them available in the JS bundle.
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const generatePixarImage = async (imageUri: string, templatePrompt: string): Promise<string> => {
    try {
        console.log("🎨 Starting Direct Pixar generation (v2.3 optimized)...");

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

        // Direct Image-to-Image Generation as requested by user.
        // Restricting key usage via Google Cloud Console Referrer is recommended for security.
        try {
            console.log(`📡 Calling gemini-2.0-flash-exp API directly...`);
            const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

            const genResponse = await axios.post(genUrl, {
                contents: [{
                    parts: [
                        { text: `Turn this person into a 3D Pixar-style character. ${templatePrompt}. Output ONLY the image data.` },
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

            console.error("❌ No image data in response:", JSON.stringify(genResponse.data));
            throw new Error("No image data in response");

        } catch (genError: any) {
            console.error("❌ Direct API Generation failed:", genError.response?.data || genError.message);
            throw genError;
        }

    } catch (error) {
        console.error("🚨 AI Generation Error:", error);
        // Fallback to the default 3D boy image
        return 'https://img.freepik.com/free-photo/3d-illustration-cute-boy-with-glasses_1142-41408.jpg';
    }
};
