
import { GoogleGenAI } from "@google/genai";
import type { StockAsset } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const buildPrompt = (filename: string, marketplace: string): string => {
  return `
Generate metadata for a stock asset to be listed on ${marketplace}.
Filename: ${filename}

The asset is a standard stock photo/video. Do not describe the filename itself, but infer the likely subject matter from the filename for generating the metadata.

Return:
- A concise, descriptive Title (max 70 characters) that is highly relevant.
- A compelling Description (max 250 characters) detailing the asset's content and potential uses.
- Exactly 40 SEO-optimized keywords, comma-separated, ordered from most to least important.

Strictly follow this format:
Title: [Your Title Here]
Description: [Your Description Here]
Keywords: [Your Keywords Here]
`;
};

const parseGeminiResponse = (text: string): Omit<StockAsset, 'id' | 'file' | 'marketplace' | 'status'> => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  let title = '';
  let description = '';
  let keywords = '';

  lines.forEach(line => {
    if (line.toLowerCase().startsWith('title:')) {
      title = line.substring('Title:'.length).trim();
    } else if (line.toLowerCase().startsWith('description:')) {
      description = line.substring('Description:'.length).trim();
    } else if (line.toLowerCase().startsWith('keywords:')) {
      keywords = line.substring('Keywords:'.length).trim();
    }
  });

  if (!title || !description || !keywords) {
    // Fallback to regex if line splitting fails
    title = text.match(/Title:(.*)/i)?.[1]?.trim() || "";
    description = text.match(/Description:(.*)/i)?.[1]?.trim() || "";
    keywords = text.match(/Keywords:(.*)/i)?.[1]?.trim() || "";
  }
  
  if (!title && !description && !keywords) {
    throw new Error("Failed to parse the response from the AI. The format might be incorrect.");
  }

  return { title, description, keywords };
};

export const generateMetadata = async (filename: string, marketplace: string): Promise<Omit<StockAsset, 'id' | 'file' | 'marketplace' | 'status'>> => {
  const prompt = buildPrompt(filename, marketplace);
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const text = response.text;
    if (!text) {
      throw new Error("Received an empty response from the AI.");
    }
    
    return parseGeminiResponse(text);
  } catch (error) {
    console.error("Error generating metadata:", error);
    if (error instanceof Error) {
        throw new Error(`AI generation failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during AI generation.");
  }
};
