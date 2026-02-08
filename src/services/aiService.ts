import axios from 'axios';

// IMPORTANT: We no longer use EXPO_PUBLIC_GEMINI_API_KEY on the client side for production.
// Instead, we use our secure backend proxy located at /api/generate

export const generatePixarImage = async (imageUri: string, templatePrompt: string): Promise<string> => {
    try {
        console.log("🎨 Starting Pixar generation via Secure Proxy...");

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

        try {
            // Use our own backend API instead of calling Google directly from the browser
            // This keeps the API key hidden on the server.
            console.log("📡 Calling Server Proxy /api/generate...");

            const response = await axios.post('/api/generate', {
                contents: [{
                    parts: [
                        { text: `Turn this person into a 3D Pixar-style character. ${templatePrompt}. Output only the image.` },
                        { inline_data: { mime_type: "image/jpeg", data: base64 } }
                    ]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE"]
                }
            });

            // The proxy returns the same structure as Gemini API
            const base64Image = response.data?.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData?.data;

            if (base64Image) {
                console.log("✅ Secure Image Generation Successful!");
                return `data:image/png;base64,${base64Image}`;
            } else {
                console.error("❌ No image data in proxy response");
                throw new Error("No image data in response");
            }
        } catch (proxyError: any) {
            console.error("⚠️ Proxy Error:", proxyError.response?.data || proxyError.message);
            throw proxyError;
        }

    } catch (error) {
        console.error("🚨 AI Generation Error (Proxy):", error);
        // Fallback image (3D Boy)
        return 'https://img.freepik.com/free-photo/3d-illustration-cute-boy-with-glasses_1142-41408.jpg';
    }
};
