import { GoogleGenAI, Type } from "@google/genai";

export const generateWithSchema = async (prompt: string, schema: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.9,
            },
        });
        const jsonText = response.text;
        if (!jsonText) {
          throw new Error("AI returned an empty response.");
        }
        const parsed = JSON.parse(jsonText);
        return parsed;
    } catch (error) {
        console.error("Error generating content from AI:", error);
        throw new Error("Yapay zeka ile içerik oluşturulurken bir hata oluştu.");
    }
};
