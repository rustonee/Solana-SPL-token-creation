import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import clsx from 'clsx';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';
import { MdContentCopy } from 'react-icons/md';

import Button, { ButtonProps } from '@/components/common/button';

import { WalletConnectButton } from './walletConnectButton';
import { WalletModalButton } from './walletModalButton';

export const WalletMuiButton: FC<ButtonProps> = ({ children, ...props }) => {
  const { publicKey, wallet, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLUListElement>(null);

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const content = useMemo(() => {
    if (children) return children;
    if (!wallet || !base58) return null;
    return base58.slice(0, 5) + '...' + base58.slice(-5);
  }, [children, wallet, base58]);

  const copyAddress = useCallback(async () => {
    if (base58) {
      await navigator.clipboard.writeText(base58);
      setCopied(true);
      setTimeout(() => setCopied(false), 400);
    }
  }, [base58]);

  const openDropdown = useCallback(() => {
    setActive(true);
  }, []);

  const closeDropdown = useCallback(() => {
    setActive(false);
  }, []);

  const openModal = useCallback(() => {
    setVisible(true);
    closeDropdown();
  }, [setVisible, closeDropdown]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;

      // Do nothing if clicking dropdown or its descendants
      if (!node || node.contains(event.target as Node)) return;

      closeDropdown();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, closeDropdown]);

  if (!wallet)
    return <WalletModalButton {...props}>{children}</WalletModalButton>;
  if (!base58)
    return <WalletConnectButton {...props}>{children}</WalletConnectButton>;

  return (
    <div className='relative'>
      <Button
        aria-expanded={active}
        style={{ pointerEvents: active ? 'none' : 'auto', ...props.style }}
        onClick={openDropdown}
        {...props}
      >
        {content}
      </Button>
      <ul
        aria-label='dropdown-list'
        className={clsx(
          'bg-bg-400 absolute w-full shadow-inputFocus text-text-100 mt-2 cursor-pointer flex-col gap-4 rounded-lg px-4 py-2 text-sm',
          active ? 'flex' : 'hidden'
        )}
        ref={ref}
        role='menu'
      >
        <li
          onClick={copyAddress}
          className='flex items-center justify-start gap-2'
          role='menuitem'
        >
          <MdContentCopy />
          {copied ? 'Copied' : 'Copy address'}
        </li>
        <li
          onClick={openModal}
          className='flex items-center justify-start gap-2'
          role='menuitem'
        >
          <FaExchangeAlt />
          Change wallet
        </li>
        <li
          onClick={disconnect}
          className='flex items-center justify-start gap-2'
          role='menuitem'
        >
          <MdLogout />
          Disconnect
        </li>
      </ul>
    </div>
  );
};

export default WalletMuiButton;