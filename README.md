
# RippleChat - A Next.js Chat Application

This is a real-time chat application built with Next.js, Firebase, and Tailwind CSS, featuring a GenAI-powered profanity filter.

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   A Firebase project

### Setup

1.  **Clone the repository (or use this as a starting point in Firebase Studio).**

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Firebase:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   In your Firebase project, go to Project settings > General.
    *   Register a new web app.
    *   Copy the Firebase configuration object.
    *   Enable Authentication: Go to Authentication > Sign-in method, and enable "Email/Password" and "Google" providers.
    *   Enable Firestore: Go to Firestore Database > Create database. Start in **test mode** for easy setup, but configure security rules for production. A basic rule set for authenticated users is:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allow users to read/write their own user profile
            match /users/{userId} {
              allow read: if true; // Or more restrictive
              allow write: if request.auth != null && request.auth.uid == userId;
            }
            // Allow authenticated users to read messages and write their own
            match /messages/{messageId} {
              allow read: if request.auth != null;
              allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
              // Add update/delete rules as needed
            }
          }
        }
        ```

4.  **Configure Environment Variables:**
    Create a file named `.env.local` in the root of your project and add your Firebase configuration details:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```
    Replace `your_...` with your actual Firebase project values.

    If you are using the Genkit AI features (like the profanity filter) which might require Google AI Studio API keys, ensure those are also set up as per Genkit documentation (e.g., `GOOGLE_API_KEY` if `gemini-pro` model is used directly or via Google AI plugin).

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application should be running at `http://localhost:9002`.

    To run Genkit flows locally (if you need to test/develop them separately):
    ```bash
    npm run genkit:dev
    ```

### Building for Production
    ```bash
    npm run build
    npm run start
    ```

## Core Features

*   **User Authentication**: Sign up and log in using email/password or Google.
*   **Real-Time Chat**: Send and receive messages instantly in a global chat room.
*   **Profanity Filter**: Messages are checked for profanity before being displayed.
*   **Message Persistence**: Conversations are stored in Firestore.

## Tech Stack

*   Next.js (App Router)
*   React
*   TypeScript
*   Firebase (Authentication, Firestore)
*   Tailwind CSS
*   ShadCN UI Components
*   Genkit (for AI features)
*   Lucide React (Icons)
*   React Hook Form & Zod (Form validation)
*   TanStack Query (Data fetching/caching - though primarily using Firestore real-time updates)

## Project Structure (Key Files)

*   `src/app/`: Next.js App Router pages and layouts.
    *   `layout.tsx`: Root layout, includes global providers.
    *   `page.tsx`: Entry point, redirects to `/login` or `/chat`.
    *   `login/page.tsx`: Authentication page.
    *   `chat/page.tsx`: Main chat interface.
    *   `chat/actions.ts`: Server Action for sending messages (includes profanity check).
*   `src/components/`: Reusable UI components.
    *   `auth/`: Authentication related components.
    *   `chat/`: Chat interface components (`ChatMessages`, `MessageItem`, `MessageForm`).
    *   `layout/`: Layout components like `Navbar`.
    *   `ui/`: ShadCN UI components.
*   `src/lib/`: Utility functions and Firebase configuration.
    *   `firebase/config.ts`: Firebase app initialization.
    *   `firebase/firestore.ts`: Functions for Firestore interactions.
*   `src/contexts/`: React context providers (e.g., `AuthContext.tsx`).
*   `src/hooks/`: Custom React hooks (e.g., `useAuth.ts`).
*   `src/types/`: TypeScript type definitions.
*   `src/ai/`: Genkit AI flow definitions.
    *   `flows/profanity-filter.ts`: The profanity filter logic.
*   `public/`: Static assets.
*   `globals.css`: Global styles and Tailwind CSS theme customization.

This provides a foundation for RippleChat. You can now run `npm install` (or `yarn install`) to get the new dependencies (`next-themes`, `date-fns`) and then `npm run dev` to start the application. Remember to set up your Firebase project and `.env.local` file!
