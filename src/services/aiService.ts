import axios from 'axios';

// Note: We now use a secure server proxy (/api/generate) to protect our API Key.


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

        // Secure Proxy Call: Using our Vercel Serverless Function
        try {
            console.log(`📡 Calling secure server proxy (/api/generate)...`);

            // We call our OWN backend, which holds the API Key safely.
            const proxyResponse = await axios.post('/api/generate', {
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

            // Extract image data from Gemini response via Proxy
            const generatedBase64 = proxyResponse.data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;

            if (generatedBase64) {
                console.log("✅ Image Generation Successful (via Proxy)!");
                return `data:image/png;base64,${generatedBase64}`;
            }

            console.error("❌ No image data in response:", JSON.stringify(proxyResponse.data));
            throw new Error("No image data in server response");

        } catch (genError: any) {
            const errorMsg = genError.response?.data?.error?.message || genError.message;
            console.error("❌ Proxy API Generation failed:", errorMsg);
            throw new Error(errorMsg);
        }

    } catch (error) {
        console.error("🚨 AI Generation Error:", error);
        // Fallback to the default 3D boy image
        return 'https://img.freepik.com/free-photo/3d-illustration-cute-boy-with-glasses_1142-41408.jpg';
    }
};
