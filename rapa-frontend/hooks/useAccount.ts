import { useState, useEffect } from 'react';
import {
  isConnected as checkFreighterInstalled,
  requestAccess,
  getAddress,
  isAllowed,
  setAllowed
} from '@stellar/freighter-api';

interface AccountData {
  displayName: string;
  publicKey: string;
  walletType: string;
}

export function useAccount() {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false);

  useEffect(() => {
    // Check if Freighter is installed
    const checkIsInstalled = async () => {
      let res = await checkFreighterInstalled();
      if (!res.isConnected) {
        // Wait and retry once since extensions might take a moment to inject
        await new Promise((resolve) => setTimeout(resolve, 500));
        res = await checkFreighterInstalled();
      }
      setIsFreighterInstalled(res.isConnected);
    };

    checkIsInstalled();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Check localStorage first
      const savedPublicKey = localStorage.getItem('stellar_public_key');
      const walletType = localStorage.getItem('wallet_type');

      if (savedPublicKey && walletType) {
        // Verify the connection is still valid
        if (walletType === 'freighter') {
          try {
            const { isConnected: installed } = await checkFreighterInstalled();
            if (installed) {
              const { isAllowed: allowed } = await isAllowed();
              if (allowed) {
                const { address } = await getAddress();
                if (address === savedPublicKey) {
                  setAccount({
                    displayName: formatAddress(savedPublicKey),
                    publicKey: savedPublicKey,
                    walletType: walletType
                  });
                } else {
                  // Keys don't match, clear storage
                  clearAccount();
                }
              } else {
                clearAccount();
              }
            }
          } catch (error) {
            console.error(error);
            clearAccount();
          }
        }
      }
    } catch (error) {
      console.error('Error checking account connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectFreighter = async (): Promise<boolean> => {
    try {
      const { isConnected: installed } = await checkFreighterInstalled();
      if (!installed) {
        throw new Error('Freighter wallet not installed');
      }

      // First set allowed (this prompts the user)
      const allowedStatus = await isAllowed();
      if (!allowedStatus.isAllowed) {
        const { error: setAllowedError } = await setAllowed();
        if (setAllowedError) {
          throw new Error(setAllowedError.toString());
        }
      }

      const response = await requestAccess();

      if (response.error) {
        throw new Error(response.error.toString());
      }

      const publicKey = response.address;

      if (!publicKey) {
         throw new Error('Failed to retrieve public key');
      }

      const accountData: AccountData = {
        displayName: formatAddress(publicKey),
        publicKey: publicKey,
        walletType: 'freighter'
      };

      setAccount(accountData);

      // Save to localStorage
      localStorage.setItem('stellar_public_key', publicKey);
      localStorage.setItem('wallet_type', 'freighter');

      return true;
    } catch (error) {
      console.error('Failed to connect to Freighter:', error);
      // Re-throw if it's the specific "not installed" error so UI can handle it
      if (error instanceof Error && error.message === 'Freighter wallet not installed') {
        throw error;
      }
      return false;
    }
  };

  const disconnect = () => {
    clearAccount();
  };

  const clearAccount = () => {
    setAccount(null);
    localStorage.removeItem('stellar_public_key');
    localStorage.removeItem('wallet_type');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return {
    account,
    isLoading,
    isFreighterInstalled,
    connectFreighter,
    disconnect,
    isConnected: !!account
  };
}