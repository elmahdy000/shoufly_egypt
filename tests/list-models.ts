import 'dotenv/config';

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      const supportGenerate = data.models.filter((m: any) => m.supportedGenerationMethods.includes('generateContent'));
      console.log('Models supporting generateContent:');
      supportGenerate.forEach((m: any) => console.log(`- ${m.name}`));
    } else {
      console.log('No models found or error:', data);
    }
  } catch (error) {
    console.error(error);
  }
}

listModels();
