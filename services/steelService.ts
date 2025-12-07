import Steel from 'steel-sdk';

const STEEL_API_KEY = process.env.STEEL_API_KEY;

export interface SteelSession {
  id: string;
  debugUrl: string;
  status: string;
}

let steelClient: Steel | null = null;

const getSteelClient = (): Steel => {
  if (!STEEL_API_KEY) {
    throw new Error("Steel API Key is missing");
  }

  if (!steelClient) {
    steelClient = new Steel({
      steelAPIKey: STEEL_API_KEY,
    });
  }

  return steelClient;
};

export const createSteelSession = async (): Promise<SteelSession> => {
  console.log("Creating Steel session...");

  const client = getSteelClient();
  const session = await client.sessions.create();

  console.log('Steel session created:', session.id);
  console.log('View at:', session.sessionViewerUrl);

  return {
    id: session.id,
    debugUrl: session.sessionViewerUrl,
    status: session.status || 'live'
  };
};

export const navigateSteelSession = async (sessionId: string, url: string) => {
  console.log(`Steel session ${sessionId} viewer is ready. User can navigate to: ${url}`);
  // The Steel session viewer provides a full interactive browser
  // Users can navigate directly in the viewer - no programmatic navigation needed
  // The session automatically opens with a blank page ready for user interaction
};

export const releaseSteelSession = async (sessionId: string) => {
  console.log(`Releasing Steel session ${sessionId}`);

  const client = getSteelClient();

  try {
    await client.sessions.release(sessionId);
    console.log('Session released');
  } catch (error) {
    console.error("Failed to release Steel session", error);
  }
};

export interface LinkedInProfile {
  name: string;
  photoUrl?: string;
  headline?: string;
  linkedInUrl?: string;
}

export const searchLinkedIn = async (name: string): Promise<LinkedInProfile | null> => {
  try {
    console.log(`Searching LinkedIn for: ${name}`);

    const client = getSteelClient();
    const session = await client.sessions.create();

    // Navigate to LinkedIn search
    const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}`;

    // Use scrape to get the page content with a selector to extract profile cards
    const result = await client.scrape({
      url: searchUrl,
      sessionId: session.id,
    });

    console.log('LinkedIn scrape result:', result);

    // Extract profile information from the scrape result
    // The result should contain the HTML content - we need to parse it
    let photoUrl: string | undefined;
    let headline: string | undefined;
    let linkedInUrl: string | undefined;

    // Try to extract data from the scraped content
    if (result && typeof result === 'object') {
      // Steel's scrape API returns different formats depending on the content
      // Look for image URLs in the result
      const resultStr = JSON.stringify(result);

      // Try to find LinkedIn profile image URLs (they typically contain 'licdn.com')
      const imageMatch = resultStr.match(/(https:\/\/media\.licdn\.com\/dms\/image\/[^"'\s]+)/);
      if (imageMatch) {
        photoUrl = imageMatch[1];
      }

      // Try to find profile URL
      const profileMatch = resultStr.match(/(https:\/\/www\.linkedin\.com\/in\/[^"'\s]+)/);
      if (profileMatch) {
        linkedInUrl = profileMatch[1];
      }

      // Try to extract headline (common patterns)
      const headlineMatch = resultStr.match(/"headline":"([^"]+)"/);
      if (headlineMatch) {
        headline = headlineMatch[1];
      }
    }

    const profileData: LinkedInProfile = {
      name: name,
      photoUrl,
      headline,
      linkedInUrl
    };

    console.log('Extracted profile data:', profileData);

    // Release the session
    await client.sessions.release(session.id);

    return profileData;
  } catch (error) {
    console.error('LinkedIn search failed:', error);
    return null;
  }
};
