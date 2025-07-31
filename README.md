# Risk Assessment App

A modern web application with Azure Entra ID (formerly Azure AD) authentication built with Vite, React, and TypeScript.

## Features

- 🔐 Azure Entra ID authentication
- 🎨 Modern, responsive UI with glassmorphism design
- 📱 Mobile-friendly interface
- 🚀 Fast development with Vite
- 🔒 Secure authentication flow
- 🌍 Multi-environment support (Local, Development, UAT)

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Azure Entra ID tenant with configured app registration

## Environment Configuration

This application supports multiple environments with different API endpoints:

### Available Environments

1. **Local Development** (`localhost`)
   - API Base URL: `http://localhost:3000/api/v1`
   - Redirect URI: `http://localhost:5173`
   - Use for local development with local backend

2. **Development** (`development`)
   - API Base URL: `https://riskassessment-dev.flourishresearch.com/api/v1`
   - Redirect URI: `https://riskassessment-dev.flourishresearch.com`
   - Use for development environment

3. **UAT** (`uat`)
   - API Base URL: `https://riskassessment-uat.flourishresearch.com/api/v1`
   - Redirect URI: `https://riskassessment-uat.flourishresearch.com`
   - Use for user acceptance testing

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Azure Entra ID Configuration:**
   
   Your Azure Entra ID configuration is already set up with:
   - Client ID: `f2a40b16-4c92-4bf9-90ab-88815bb51e64`
   - Tenant ID: `3b039a3e-0b01-4b1c-955e-1ddc0c11a314`
   - Redirect URIs are automatically configured based on environment

3. **Start the development server:**

   **For Local Development:**
   ```bash
   npm run dev:localhost
   ```

   **For Development Environment:**
   ```bash
   npm run dev
   ```

   **For UAT Environment:**
   ```bash
   npm run dev:uat
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## Building for Different Environments

To build the application for different environments:

```bash
# Build for local development
npm run build:localhost

# Build for development environment
npm run build:dev

# Build for UAT environment
npm run build:uat

# Build for production (default)
npm run build
```

## Azure Entra ID Setup

If you need to configure Azure Entra ID for this application:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Create a new registration or use existing one
4. Set the redirect URIs for each environment:
   - Local: `http://localhost:5173/`
   - Development: `https://riskassessment-dev.flourishresearch.com/`
   - UAT: `https://riskassessment-uat.flourishresearch.com/`
5. Update the client ID and tenant ID in `src/authConfig.ts`

## Project Structure

```
src/
├── components/
│   ├── LoginPage.tsx      # Login page component
│   ├── LoginPage.css      # Login page styles
│   ├── HomePage.tsx       # Home page component
│   └── HomePage.css       # Home page styles
├── services/
│   └── api.ts            # API service with environment-based configuration
├── types/
│   └── global.d.ts       # Global type declarations
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

- `npm run dev` - Start development server (development environment)
- `npm run dev:localhost` - Start development server (localhost environment)
- `npm run dev:uat` - Start development server (UAT environment)
- `npm run build` - Build for production
- `npm run build:localhost` - Build for localhost environment
- `npm run build:dev` - Build for development environment
- `npm run build:uat` - Build for UAT environment
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

The application automatically configures the following based on the environment:

- `__API_BASE_URL__` - API base URL for backend communication
- `__REDIRECT_URI__` - Azure Entra ID redirect URI
- `__ENVIRONMENT__` - Current environment name

## Technologies Used

- **Vite** - Fast build tool and development server
- **React** - UI library
- **TypeScript** - Type safety
- **MSAL.js** - Microsoft Authentication Library
- **Axios** - HTTP client for API communication
- **CSS** - Raw CSS for styling (no frameworks)

## Security Notes

- The application uses popup authentication for better UX
- Session storage is used for token caching
- All authentication is handled by Azure Entra ID
- No sensitive data is stored locally
- Environment-specific configurations ensure proper API endpoints

## Troubleshooting

If you encounter authentication issues:

1. Verify your Azure Entra ID configuration
2. Check that the redirect URI matches exactly for your environment
3. Ensure the client ID and tenant ID are correct
4. Check browser console for any errors
5. Verify that popup blockers are disabled for localhost
6. Ensure you're using the correct environment mode when running the application 