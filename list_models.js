const axios = require('axios');
require('dotenv').config();

const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY; // Read from .env

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await axios.get(url);
        const models = response.data.models;
        console.log('Available Models:');
        models.forEach(m => {
            console.log(`- ${m.name} (${m.displayName})`);
            console.log(`  Methods: ${JSON.stringify(m.supportedGenerationMethods)}`);
        });
    } catch (error) {
        if (error.response) {
            console.log('Error listing models:', error.response.status);
            console.log(JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
    }
}

listModels();
