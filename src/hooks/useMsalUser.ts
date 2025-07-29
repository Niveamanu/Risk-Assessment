import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { tokenStorage } from "../authConfig";

export default function useMsalUser() {
  const { accounts, instance } = useMsal();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const account = accounts[0];
      setUserInfo({
        username: account.username,
        name: account.name,
        email: account.username,
      });

      // Check if we already have a valid token
      const existingToken = tokenStorage.getAccessToken();
      if (existingToken && !tokenStorage.isTokenExpired()) {
        setIsAuthenticated(true);
        return;
      }

      const request = {
        scopes: ["api://b7fb9a3b-efe3-418d-8fa8-243487a42530/access_as_user", "GroupMember.Read.All"], // Your app's API scope
        account: account,
      };

      instance
        .acquireTokenSilent(request)
        .then((response) => {
          tokenStorage.setAccessToken(response.accessToken);
          if (response.expiresOn) {
            const expiryTime = response.expiresOn.getTime();
            tokenStorage.setTokenExpiry(expiryTime);
          }
          setIsAuthenticated(true);
        })
        .catch(async (error) => {
          console.log('Silent token acquisition failed, trying popup...', error);
          // If silent fails (e.g., consent required), fallback to popup
          if (error instanceof InteractionRequiredAuthError) {
            try {
              const response = await instance.acquireTokenPopup(request);
              tokenStorage.setAccessToken(response.accessToken);
              if (response.expiresOn) {
                const expiryTime = response.expiresOn.getTime();
                tokenStorage.setTokenExpiry(expiryTime);
              }
              setIsAuthenticated(true);
            } catch (popupError) {
              console.error('Popup token acquisition failed:', popupError);
              setIsAuthenticated(false);
            }
          } else {
            console.error('Token acquisition failed:', error);
            setIsAuthenticated(false);
          }
        });
    } else {
      // No accounts, user is not authenticated
      setUserInfo(null);
      setIsAuthenticated(false);
    }
  }, [accounts, instance]);

  return { ...userInfo, isAuthenticated };
} 