import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react"; 

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Define environment-specific configurations
  const getEnvironmentConfig = () => {
    switch (mode) {
      case 'development':
        return {
          apiBaseUrl: 'https://riskassessment-dev.flourishresearch.com/api/v1',
          redirectUri: 'https://riskassessment-dev.flourishresearch.com',
          allowedHosts: [
            'riskassessment-dev.flourishresearch.com',
            'https://riskassessment-dev.flourishresearch.com'
          ]
        };
      case 'uat':
        return {
          apiBaseUrl: 'https://riskassessment-uat.flourishresearch.com/api/v1',
          redirectUri: 'https://riskassessment-uat.flourishresearch.com',
          allowedHosts: [
            'riskassessment-uat.flourishresearch.com',
            'https://riskassessment-uat.flourishresearch.com'
          ]
        };
      case 'localhost':
        return {
          apiBaseUrl: 'http://localhost:3000/api/v1',
          redirectUri: 'http://localhost:5173',
          allowedHosts: [
            'localhost',
            'localhost:5173',
            'localhost:3000'
          ]
        };
      default:
        // Default to development
        return {
          apiBaseUrl: 'https://riskassessment-dev.flourishresearch.com/api/v1',
          redirectUri: 'https://riskassessment-dev.flourishresearch.com',
          allowedHosts: [
            'riskassessment-dev.flourishresearch.com',
            'https://riskassessment-dev.flourishresearch.com'
          ]
        };
    }
  };

  const envConfig = getEnvironmentConfig();

  return {
    plugins: [react()],
    
    // Define global constants
    define: {
      __API_BASE_URL__: JSON.stringify(envConfig.apiBaseUrl),
      __REDIRECT_URI__: JSON.stringify(envConfig.redirectUri),
      __ENVIRONMENT__: JSON.stringify(mode)
    },

    server: {
      host: mode === 'localhost' ? 'localhost' : '0.0.0.0',
      port: 5173,
      allowedHosts: envConfig.allowedHosts
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            msal: ['@azure/msal-browser', '@azure/msal-react']
          }
        }
      }
    },

    // Environment variables
    envPrefix: 'VITE_'
  };
});