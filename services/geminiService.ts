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
          },
          {
            name: "generate_branded_letter",
            description: "Generates an AI image using gemini-3-pro-image-preview of a person receiving a letter with the organization's branding. Call this after user finalizes their color palette and logo style selection.",
            parameters: {
              type: "OBJECT",
              properties: {
                orgName: { type: "STRING", description: "The nonprofit organization name" },
                primaryColor: { type: "STRING", description: "Primary brand color hex code (e.g., #FF6B6B)" },
                logoStyle: { type: "STRING", description: "Logo style: Modern Minimal, Classic Serif, Friendly Round, or Tech Mono" }
              },
              required: ["orgName", "primaryColor", "logoStyle"]
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
  onSetOrgName?: (name: string) => void,
  onGenerateBrandedLetter?: (imageUrl: string) => Promise<void>
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

            if (call && call.name === 'generate_branded_letter') {
                const orgName = call.args?.orgName as string;
                const primaryColor = call.args?.primaryColor as string;
                const logoStyle = call.args?.logoStyle as string;
                console.log(`Generating branded letter for: ${orgName}, Color: ${primaryColor}, Style: ${logoStyle}`);

                const prompt = `Professional photo of a smiling person opening a beautifully designed letter from "${orgName}" nonprofit. The envelope and letterhead feature elegant branding with ${primaryColor} as the primary color and ${logoStyle} typography style. The scene is warm and inviting, with soft natural lighting. The person looks happy and engaged. High quality, photorealistic, 4k.`;

                // Generate image using gemini-3-pro-image-preview
                const imageUrl = await generateBrandedLetterImage(prompt);

                // Send image URL via callback
                if (onGenerateBrandedLetter && imageUrl) {
                    await onGenerateBrandedLetter(imageUrl);
                }

                toolResponses.push({
                    functionResponse: {
                        name: 'generate_branded_letter',
                        response: {
                            result: imageUrl ? `Generated branded letter image for "${orgName}" with ${logoStyle} style.` : 'Failed to generate image.'
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

  try {
    // Using gemini-3-pro-image-preview for high-quality logo generation
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: prompt
    });

    // Check for inline data (base64 image)
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Logo generation error:", error);
    return null;
  }
};

export const generateBrandedLetterImage = async (prompt: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Using gemini-3-pro-image-preview for high-fidelity image generation with reasoning
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: prompt
    });

    // Check for inline data (base64 image)
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Branded letter image generation error:", error);
    return null;
  }
};

export const analyzePdfForQuotes = async (base64Data: string): Promise<string[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Using gemini-3-pro-preview with proper API
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Analyze this document and extract EXACTLY 4 short, impactful quotes or statistics that would be perfect for social media posts. Each quote should be concise (under 100 characters), emotionally compelling, and shareable. Return ONLY a JSON array of 4 strings, e.g., [\"Quote 1\", \"Quote 2\", \"Quote 3\", \"Quote 4\"]." },
            { inlineData: { mimeType: 'application/pdf', data: base64Data } }
          ]
        }
      ]
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
        const quotes = JSON.parse(jsonMatch[0]);
        return quotes.slice(0, 4); // Ensure exactly 4 quotes
    }
    return [];
  } catch (error) {
    console.error("PDF analysis error:", error);
    return ["Error analyzing PDF. Please try again."];
  }
};

export const generateSocialImageWithQuote = async (quote: string, orgName: string, brandColors: string[]): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Generate image with quote overlay using gemini-3-pro-image-preview
    const prompt = `Create a stunning Instagram post background image with the quote "${quote}" prominently displayed in elegant, bold typography. The text should be the main focus, clearly readable, and beautifully integrated into the composition. Style: Modern, inspiring, professional. Use colors from this palette: ${brandColors.join(', ')}. The overall design should be eye-catching and shareable on social media. Include "${orgName}" subtly at the bottom. High quality, photorealistic or clean illustration.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: prompt
    });

    // Check for inline data (base64 image)
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Social image generation error:", error);
    return null;
  }
};

// Legacy function for backwards compatibility
export const generateSocialImage = async (prompt: string): Promise<string | null> => {
    return generateLogo(prompt);
};
