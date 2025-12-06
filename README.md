# NFP-Compass

NFP-Compass is an intelligent, AI-powered application designed to guide users through the complex process of forming a Non-Profit Organization (NFP) in Texas.

Powered by **Google's Gemini 3**, the application features "Gemma," a warm and professional AI consultant that walks users through every step of the journey—from defining a mission statement to filing for tax-exempt status.

## 🚀 Features

-   **AI Consultant (Gemma):** A specialized AI persona that acts as a guide, not just a chatbot. Gemma validates mission statements with data, provides encouragement, and ensures compliance with Texas regulations.
-   **Step-by-Step Workflow:** Tracks progress through the 7 critical steps of NFP formation:
    1.  Mission & Name Definition
    2.  Board of Directors Formation
    3.  State Incorporation (Texas Form 202)
    4.  EIN Issuance
    5.  Bylaws & Conflict of Interest Policy
    6.  Federal 501(c)(3) Status (Form 1023-EZ)
    7.  State Tax Exemption (AP-204)
-   **Dynamic Branding:** The AI analyzes the organization's mission to generate custom color palettes and branding themes (e.g., "Growth" for environmental NFPs, "Empathy" for humanitarian causes).
-   **Interactive UI:**
    -   **Chat Interface:** Real-time conversation with the AI consultant.
    -   **Browser Simulation:** Integrated view for previewing forms and external resources.
    -   **Progress Tracking:** Visual indicators of the current stage in the formation process.
    -   **Organization Switcher:** Manage multiple NFP profiles (includes mock data for demonstration).

## 🛠️ Tech Stack

-   **Frontend:** [React 19](https://react.dev/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **AI Model:** [Google Gemini 3](https://deepmind.google/technologies/gemini/) (via `@google/genai`)
-   **Icons:** [Lucide React](https://lucide.dev/)

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yveshughes/NFP-Compass.git
    cd NFP-Compass
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```
    *Note: The application expects the API key to be available to the client-side code. Ensure your build configuration supports this (e.g., using `VITE_` prefix if using standard Vite env handling, though the current code uses `process.env.API_KEY` which might require specific Vite config).*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Build for production:**
    ```bash
    npm run build
    ```

## 📝 Usage

1.  Launch the application.
2.  Click "Start Your Journey" on the landing page.
3.  Chat with Gemma to begin defining your non-profit's mission.
4.  Follow the guided steps to complete your incorporation and tax-exemption filings.

## 📄 License

[MIT](LICENSE)
