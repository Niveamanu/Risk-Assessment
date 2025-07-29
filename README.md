# Risk Assessment App

A modern web application with Azure Entra ID (formerly Azure AD) authentication built with Vite, React, and TypeScript.

## Features

- 🔐 Azure Entra ID authentication
- 🎨 Modern, responsive UI with glassmorphism design
- 📱 Mobile-friendly interface
- 🚀 Fast development with Vite
- 🔒 Secure authentication flow

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Azure Entra ID tenant with configured app registration

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Azure Entra ID Configuration:**
   
   Your Azure Entra ID configuration is already set up with:
   - Client ID: `b7fb9a3b-efe3-418d-8fa8-243487a42530`
   - Tenant ID: `b8869792-ee44-4a05-a4fb-b6323a34ca35`
   - Redirect URI: `http://localhost:5173/`

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## Azure Entra ID Setup

If you need to configure Azure Entra ID for this application:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Create a new registration or use existing one
4. Set the redirect URI to `http://localhost:5173/`
5. Update the client ID and tenant ID in `src/authConfig.ts`

## Project Structure

```
src/
├── components/
│   ├── LoginPage.tsx      # Login page component
│   ├── LoginPage.css      # Login page styles
│   ├── HomePage.tsx       # Home page component
│   └── HomePage.css       # Home page styles
├── authConfig.ts          # Azure authentication configuration
├── App.tsx               # Main app component
├── App.css               # App styles
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## Authentication Flow

1. User visits the application
2. Login page is displayed with "Sign in with Microsoft" button
3. User clicks the button and is redirected to Azure Entra ID
4. After successful authentication, user is redirected back to the app
5. Home page is displayed with user information and dashboard

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **Vite** - Fast build tool and development server
- **React** - UI library
- **TypeScript** - Type safety
- **MSAL.js** - Microsoft Authentication Library
- **CSS** - Raw CSS for styling (no frameworks)

## Security Notes

- The application uses popup authentication for better UX
- Session storage is used for token caching
- All authentication is handled by Azure Entra ID
- No sensitive data is stored locally

## Troubleshooting

If you encounter authentication issues:

1. Verify your Azure Entra ID configuration
2. Check that the redirect URI matches exactly
3. Ensure the client ID and tenant ID are correct
4. Check browser console for any errors
5. Verify that popup blockers are disabled for localhost 