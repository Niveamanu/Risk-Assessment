import { useState, useEffect } from 'react'
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from '@azure/msal-browser'

export interface UserRoles {
  isAdmin: boolean
  isUser: boolean
  groups: string[]
  loading: boolean
}

export const useUserRoles = (): UserRoles => {
  const { instance, accounts } = useMsal()
  const [roles, setRoles] = useState<UserRoles>({
    isAdmin: false,
    isUser: false,
    groups: [],
    loading: true
  })

  useEffect(() => {
    const getUserRoles = async () => {
      if (accounts.length === 0) {
        setRoles(prev => ({ ...prev, loading: false }))
        return
      }

      try {
        const account = accounts[0]
        
        // Request to get user's groups
        const request = {
          scopes: ['GroupMember.Read.All'],
          account: account,
        }

        const response = await instance.acquireTokenSilent(request)
        
        // Make a call to Microsoft Graph to get user's groups
        const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
          headers: {
            'Authorization': `Bearer ${response.accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (graphResponse.ok) {
          const groupsData = await graphResponse.json()
          const userGroups = groupsData.value.map((group: any) => group.displayName)
          
          const isAdmin = userGroups.includes('site_director') || userGroups.includes('Flourish_Admin_Group')
          const isUser = userGroups.includes('principal_investigator') || userGroups.includes('Flourish_User_Group')
          
          console.log('🔍 User roles determined:', {
            userGroups,
            isAdmin,
            isUser,
            hasAdminGroup: userGroups.includes('site_director') || userGroups.includes('Flourish_Admin_Group'),
            hasUserGroup: userGroups.includes('principal_investigator') || userGroups.includes('Flourish_User_Group')
          })
          
          setRoles({
            isAdmin,
            isUser,
            groups: userGroups,
            loading: false
          })
        } else {
          setRoles(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          try {
            const response = await instance.acquireTokenPopup({
              scopes: ['GroupMember.Read.All']
            })
            
            const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
              headers: {
                'Authorization': `Bearer ${response.accessToken}`,
                'Content-Type': 'application/json'
              }
            })

            if (graphResponse.ok) {
              const groupsData = await graphResponse.json()
              const userGroups = groupsData.value.map((group: any) => group.displayName)
              
              const isAdmin = userGroups.includes('site_director') || userGroups.includes('Flourish_Admin_Group')
              const isUser = userGroups.includes('principal_investigator') || userGroups.includes('Flourish_User_Group')
              
              console.log('🔍 User roles determined (popup):', {
                userGroups,
                isAdmin,
                isUser,
                hasAdminGroup: userGroups.includes('site_director') || userGroups.includes('Flourish_Admin_Group'),
                hasUserGroup: userGroups.includes('principal_investigator') || userGroups.includes('Flourish_User_Group')
              })
              
              setRoles({
                isAdmin,
                isUser,
                groups: userGroups,
                loading: false
              })
            }
          } catch (popupError) {
            setRoles(prev => ({ ...prev, loading: false }))
          }
        } else {
          setRoles(prev => ({ ...prev, loading: false }))
        }
      }
    }

    getUserRoles()
  }, [instance, accounts])

  return roles
} 