import { Configuration, PopupRequest } from '@azure/msal-browser'

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: 'b7fb9a3b-efe3-418d-8fa8-243487a42530',
    authority: 'https://login.microsoftonline.com/b8869792-ee44-4a05-a4fb-b6323a34ca35',
    redirectUri: 'http://localhost:5173',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  }
}

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'GroupMember.Read.All', 'api://b7fb9a3b-efe3-418d-8fa8-243487a42530/access_as_user']
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