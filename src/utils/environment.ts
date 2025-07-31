// Environment utility functions
export const getEnvironmentInfo = () => {
  return {
    environment: typeof __ENVIRONMENT__ !== 'undefined' ? __ENVIRONMENT__ : 'unknown',
    apiBaseUrl: typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : 'not configured',
    redirectUri: typeof __REDIRECT_URI__ !== 'undefined' ? __REDIRECT_URI__ : 'not configured',
    timestamp: new Date().toISOString()
  };
};

export const logEnvironmentInfo = () => {
  const envInfo = getEnvironmentInfo();
  console.log('🌍 Environment Configuration:', envInfo);
  return envInfo;
};

// Export environment constants for use in components
export const ENVIRONMENT = typeof __ENVIRONMENT__ !== 'undefined' ? __ENVIRONMENT__ : 'development';
export const API_BASE_URL = typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : 'https://riskassessment-dev.flourishresearch.com/api/v1';
export const REDIRECT_URI = typeof __REDIRECT_URI__ !== 'undefined' ? __REDIRECT_URI__ : 'https://riskassessment-dev.flourishresearch.com'; 