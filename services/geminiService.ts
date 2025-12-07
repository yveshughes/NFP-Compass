import { GoogleGenAI, Chat, GenerateContentResponse, FunctionCall } from "@google/genai";
import { INITIAL_SYSTEM_PROMPT } from "../constants";
import { createSteelSession, navigateSteelSession, SteelSession, searchLinkedIn } from "./steelService";
import { BoardMember } from "../types";

let chatSession: Chat | null = null;
let steelSession: SteelSession | null = null;

export const initializeChat = (): Chat => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: INITIAL_SYSTEM_PROMPT,
      temperature: 0.7,
      tools: [{
        functionDeclarations: [
          {
            name: "navigate_browser",
            description: "Navigates the browser to a specific URL to help the user fill out forms or view resources.",
            parameters: {
              type: "OBJECT",
              properties: {
                url: { type: "STRING", description: "The fully qualified URL to navigate to." }
              },
              required: ["url"]
            }
          },
          {
            name: "add_board_member",
            description: "Adds a board member to the organization with their name and title. Their LinkedIn profile will be automatically looked up.",
            parameters: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING", description: "Full name of the board member" },
                title: {
                  type: "STRING",
                  description: "Board title: President, Secretary, Treasurer, or Director",
                  enum: ["President", "Secretary", "Treasurer", "Director"]
                }
              },
              required: ["name", "title"]
            }
          },
          {
            name: "set_org_name",
            description: "Sets the organization name when the user provides it. This updates the UI to show the org name instead of 'TBD'.",
            parameters: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING", description: "The full name of the nonprofit organization" }
              },
              required: ["name"]
            }
          }
        ]
      }]
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (
  message: string,
  onNavigate?: (url: string) => void,
  imageData?: string,
  onAddBoardMember?: (member: BoardMember) => void,
  onSetOrgName?: (name: string) => void
): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session");
  }

  try {
    // Build message content
    let messageContent: any = message;

    // If image data is provided, send as multimodal message
    if (imageData) {
      // Extract base64 data (remove data:image/png;base64, prefix)
      const base64Data = imageData.split(',')[1];
      messageContent = {
        parts: [
          { text: message },
          { inlineData: { mimeType: 'image/png', data: base64Data } }
        ]
      };
    }

    let response: GenerateContentResponse = await chatSession.sendMessage({
      message: messageContent
    });
    
    // Handle Tool Calls
    const candidate = response.candidates?.[0];
    const functionCalls = candidate?.content?.parts?.filter(part => part.functionCall).map(part => part.functionCall);

    if (functionCalls && functionCalls.length > 0) {
        const toolResponses = [];
        
        for (const call of functionCalls) {
            if (call && call.name === 'navigate_browser') {
                const url = call.args?.url as string;
                console.log("Gemini requested navigation to:", url);

                let resultMsg = `Navigated to ${url}`;

                // Simply navigate to the URL directly
                if (onNavigate) onNavigate(url);

                toolResponses.push({
                    functionResponse: {
                        name: 'navigate_browser',
                        response: { result: resultMsg }
                    }
                });
            }

            if (call && call.name === 'add_board_member') {
                const name = call.args?.name as string;
                const title = call.args?.title as 'President' | 'Secretary' | 'Treasurer' | 'Director';
                console.log(`Adding board member: ${name} (${title})`);

                // Search LinkedIn for this person
                const linkedInProfile = await searchLinkedIn(name);

                const boardMember: BoardMember = {
                    name,
                    title,
                    photoUrl: linkedInProfile?.photoUrl,
                    linkedInUrl: linkedInProfile?.linkedInUrl,
                    headline: linkedInProfile?.headline
                };

                // Add to state via callback
                if (onAddBoardMember) onAddBoardMember(boardMember);

                toolResponses.push({
                    functionResponse: {
                        name: 'add_board_member',
                        response: {
                            result: `Added ${name} as ${title}. ${linkedInProfile ? 'LinkedIn profile found and displayed in org chart.' : 'Added to org chart.'}`
                        }
                    }
                });
            }

            if (call && call.name === 'set_org_name') {
                const orgName = call.args?.name as string;
                console.log(`Setting organization name: ${orgName}`);

                // Update org name via callback
                if (onSetOrgName) onSetOrgName(orgName);

                toolResponses.push({
                    functionResponse: {
                        name: 'set_org_name',
                        response: {
                            result: `Organization name set to "${orgName}". UI updated.`
                        }
                    }
                });
            }
        }

        // Send tool response back to model to get the final text response
        if (toolResponses.length > 0) {
             response = await chatSession.sendMessage({
                 message: toolResponses
             });
        }
    }

    return response.text || "I'm having trouble connecting to the service right now. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `I encountered an error processing your request: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export const generateLogo = async (prompt: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");

  const ai = new GoogleGenAI({ apiKey });
  // Using the model requested by user context or standard imagen
  const model = ai.getGenerativeModel({ model: "imagen-3.0-generate-001" });

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    // Check for inline data (base64 image)
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && 'inlineData' in part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    
    return null;
  } catch (error) {
    console.error("Logo generation error:", error);
    return null;
  }
};

export const analyzePdfForQuotes = async (base64Data: string): Promise<string[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");

  const ai = new GoogleGenAI({ apiKey });
  // User requested gemini-3-pro-preview for PDF review
  const model = ai.getGenerativeModel({ model: "gemini-3-pro-preview" });

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Analyze this PDF and extract 3-5 short, impactful, and shareable quotes or statistics that would be perfect for an Instagram post. Return ONLY a JSON array of strings, e.g., [\"Quote 1\", \"Quote 2\"]." },
            { inlineData: { mimeType: 'application/pdf', data: base64Data } }
          ]
        }
      ]
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("PDF analysis error:", error);
    return ["Error analyzing PDF. Please try again."];
  }
};

export const generateSocialImage = async (prompt: string): Promise<string | null> => {
    // Re-use the logo generation logic but with a different prompt context if needed
    // or just alias it. The underlying model is the same.
    return generateLogo(prompt);
};
