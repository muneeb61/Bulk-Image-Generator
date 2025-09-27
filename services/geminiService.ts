import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts image prompts from a script using a Gemini model.
 * @param script The user-provided script.
 * @returns A promise that resolves to an array of string prompts.
 */
export const extractPromptsFromScript = async (script: string): Promise<string[]> => {
  const model = "gemini-2.5-flash";
  const systemInstruction = `You are an expert script analyst for a film production studio. Your task is to read the provided script and identify distinct, visually compelling scenes or "beats". For each one, create a concise but descriptive prompt suitable for an AI image generation model. Focus on the key visual elements: setting, characters, actions, and mood. The output must be a JSON array of strings, where each string is a self-contained image prompt.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: `Here is the script:\n\n---\n${script}\n---`,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "A concise and descriptive prompt for image generation.",
        },
      },
    },
  });

  try {
    const jsonStr = response.text.trim();
    const prompts = JSON.parse(jsonStr);
    if (Array.isArray(prompts) && prompts.every(p => typeof p === 'string')) {
      return prompts;
    }
    throw new Error("Invalid format received from prompt extraction API.");
  } catch (error) {
    console.error("Failed to parse prompts:", response.text);
    throw new Error("Could not parse the prompts from the script. The AI's response was not valid JSON.");
  }
};

/**
 * Generates images based on a prompt and style using a Gemini model.
 * @param prompt The specific scene prompt.
 * @param style A string describing the overall visual style.
 * @param count The number of images to generate.
 * @param ratio The desired aspect ratio for the images.
 * @returns A promise that resolves to an array of base64 encoded image data URLs.
 */
export const generateImages = async (
  prompt: string,
  style: string,
  count: number,
  ratio: AspectRatio
): Promise<string[]> => {
  const model = 'imagen-4.0-generate-001';
  const fullPrompt = `${prompt}, ${style}`;

  const response = await ai.models.generateImages({
    model: model,
    prompt: fullPrompt,
    config: {
      numberOfImages: count,
      outputMimeType: 'image/jpeg',
      aspectRatio: ratio,
    },
  });

  if (!response.generatedImages || response.generatedImages.length === 0) {
    throw new Error("Image generation failed, no images were returned.");
  }

  return response.generatedImages.map(img => {
    const base64ImageBytes: string = img.image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  });
};
