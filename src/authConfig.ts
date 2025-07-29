import { Configuration, PopupRequest } from '@azure/msal-browser'

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: 'f2a40b16-4c92-4bf9-90ab-88815bb51e64',
    authority: 'https://login.microsoftonline.com/3b039a3e-0b01-4b1c-955e-1ddc0c11a314',
   
    redirectUri: 'https://riskassessment-dev.flourishresearch.com',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  }
}

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'GroupMember.Read.All', 'api://f2a40b16-4c92-4bf9-90ab-88815bb51e64/access_as_user']
}

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me'
}

// Token storage utilities
export const tokenStorage = {
  setAccessToken: (token: string) => {
    localStorage.setItem('accessToken', token)
  },
  
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken')
  },
  
  removeAccessToken: () => {
    localStorage.removeItem('accessToken')
  },
  
  setTokenExpiry: (expiry: number) => {
    localStorage.setItem('tokenExpiry', expiry.toString())
  },
  
  getTokenExpiry: (): number | null => {
    const expiry = localStorage.getItem('tokenExpiry')
    return expiry ? parseInt(expiry) : null
  },
  
  isTokenExpired: (): boolean => {
    const expiry = tokenStorage.getTokenExpiry()
    return expiry ? Date.now() > expiry : true
  }
} 