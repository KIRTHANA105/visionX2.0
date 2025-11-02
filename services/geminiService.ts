import { GoogleGenAI, Type, Part } from "@google/genai";
import { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise summary of the legal document in simple, clear language for a non-lawyer."
    },
    pros: {
      type: Type.ARRAY,
      description: "A list of clauses or aspects of the document that are beneficial or advantageous to the user.",
      items: { type: Type.STRING }
    },
    cons: {
      type: Type.ARRAY,
      description: "A list of clauses or aspects that could be disadvantageous, risky, or impose significant obligations on the user.",
      items: { type: Type.STRING }
    },
    potentialLoopholes: {
      type: Type.ARRAY,
      description: "A list of ambiguous, vague, or potentially exploitable clauses that could lead to disputes.",
      items: { type: Type.STRING }
    },
    potentialChallenges: {
        type: Type.ARRAY,
        description: "A list of potential legal challenges or disputes that could arise from the document's terms.",
        items: { type: Type.STRING }
    }
  },
  required: ["summary", "pros", "cons", "potentialLoopholes", "potentialChallenges"]
};

// Converts a File object to a GoogleGenAI.Part object.
async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}


export const analyzeDocument = async (file: File): Promise<AnalysisResult> => {
  const model = "gemini-2.5-pro";

  const prompt = `You are LexiGem, an expert AI legal analyst. Your task is to analyze the attached legal document (e.g., contract, agreement, NDA, policy). Provide a structured analysis in simple, easy-to-understand language for a non-lawyer.

  Based on the document, provide a detailed analysis covering:
  1.  **Summary:** A brief overview of the document's purpose and key terms.
  2.  **Pros:** What are the benefits for the user in this agreement?
  3.  **Cons:** What are the risks, obligations, or downsides for the user?
  4.  **Potential Loopholes:** Identify any vague, ambiguous, or potentially exploitable clauses.
  5.  **Potential Challenges:** What disputes or legal issues could realistically arise from this document?
  
  Please provide the output in the specified JSON format.`;

  try {
    const filePart = await fileToGenerativePart(file);
    const contents = { parts: [{ text: prompt }, filePart] };

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const cleanedJson = jsonText.replace(/^```json\s*|```$/g, '');
    const parsedResult: AnalysisResult = JSON.parse(cleanedJson);
    return parsedResult;
  } catch (error) {
    console.error("Error analyzing document with Gemini:", error);
    throw new Error("Failed to analyze the document. The AI model could not process the request. Please ensure you've uploaded a clear document (PDF, DOCX, PNG, JPG).");
  }
};