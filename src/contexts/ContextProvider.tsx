import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { ENV } from '@/configs';

import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';

const ReactUIWalletModalProviderDynamic = dynamic(
  async () =>
    (await import('@solana/wallet-adapter-react-ui')).WalletModalProvider,
  { ssr: false }
);

export interface WalletContextState {
  error: WalletError | undefined;
  setError: Dispatch<SetStateAction<WalletError | undefined>>;
  isOpenWalletModal: boolean;
  setOpenWalletModal: Dispatch<SetStateAction<boolean>>;
  isOpenAccountModal: boolean;
  setOpenAccountModal: Dispatch<SetStateAction<boolean>>;
  isOpenNetworkModal: boolean;
  setOpenNetworkModal: Dispatch<SetStateAction<boolean>>;
}

export const WalletContext = createContext<WalletContextState>(
  {} as WalletContextState
);

export function useWallet(): WalletContextState {
  return useContext(WalletContext);
}

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useAutoConnect();
  const endpoint = useMemo(
    () =>
      clusterApiUrl(
        ENV.IN_PRODUCTION
          ? WalletAdapterNetwork.Mainnet
          : WalletAdapterNetwork.Devnet
      ),
    []
  );

  const [isOpenWalletModal, setOpenWalletModal] = useState<boolean>(false);
  const [isOpenAccountModal, setOpenAccountModal] = useState<boolean>(false);
  const [isOpenNetworkModal, setOpenNetworkModal] = useState<boolean>(false);
  const [error, setError] = useState<WalletError>();

  const AvaiableWallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  const onError = useCallback((_error: WalletError) => {
    setError(_error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={AvaiableWallets}
        onError={onError}
        autoConnect={autoConnect}
      >
        <WalletContext.Provider
          value={{
            error,
            setError,
            isOpenWalletModal,
            setOpenWalletModal,
            isOpenAccountModal,
            setOpenAccountModal,
            isOpenNetworkModal,
            setOpenNetworkModal,
          }}
        >
          <ReactUIWalletModalProviderDynamic>
            {children}
          </ReactUIWalletModalProviderDynamic>
        </WalletContext.Provider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AutoConnectProvider>
      <WalletContextProvider>{children}</WalletContextProvider>
    </AutoConnectProvider>
  );
};
