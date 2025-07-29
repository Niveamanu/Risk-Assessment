import { useEffect } from 'react'
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { tokenStorage } from '../authConfig'

export const useTokenStorage = () => {
  const { instance, accounts } = useMsal()

  useEffect(() => {
    const handleTokenResponse = async () => {
      if (accounts.length > 0) {
        const account = accounts[0]
        
        const request = {
          scopes: ['api://b7fb9a3b-efe3-418d-8fa8-243487a42530/access_as_user', 'GroupMember.Read.All'],
          account: account,
        }

        try {
          // Try to get token silently first
          const response = await instance.acquireTokenSilent(request)
          
          // Store access token
          tokenStorage.setAccessToken(response.accessToken)
          
          // Store token expiry
          if (response.expiresOn) {
            const expiryTime = response.expiresOn.getTime()
            tokenStorage.setTokenExpiry(expiryTime)
          }
          

        } catch (error) {
          // If silent fails (e.g., consent required), fallback to popup
          if (error instanceof InteractionRequiredAuthError) {
            try {
              const response = await instance.acquireTokenPopup(request)
              tokenStorage.setAccessToken(response.accessToken)
              
              if (response.expiresOn) {
                const expiryTime = response.expiresOn.getTime()
                tokenStorage.setTokenExpiry(expiryTime)
              }
              

            } catch (popupError) {
              // Token acquisition failed
            }
          } else {
            // Token acquisition failed
          }
        }
      }
    }

    handleTokenResponse()
  }, [instance, accounts])

  const logout = () => {
    // Clear tokens from localStorage
    tokenStorage.removeAccessToken()
    tokenStorage.setTokenExpiry(0)
    
    // Logout from MSAL
    instance.logoutPopup().catch(e => {
      // Logout failed
    })
  }

  const getStoredToken = () => {
    return tokenStorage.getAccessToken()
  }

  const isTokenValid = () => {
    const token = tokenStorage.getAccessToken()
    const isExpired = tokenStorage.isTokenExpired()
    return token && !isExpired
  }

  return {
    getStoredToken,
    isTokenValid,
    logout
  }
}