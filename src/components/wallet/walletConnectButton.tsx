import { useWallet } from '@solana/wallet-adapter-react';
import type { FC, MouseEventHandler } from 'react';
import React, { useCallback, useMemo } from 'react';
import { BiWallet } from 'react-icons/bi';

import Button, { ButtonProps } from '@/components/common/button';

export const WalletConnectButton: FC<ButtonProps> = ({
  children,
  disabled,
  onClick,
  ...props
}) => {
  const { wallet, connect, connecting, connected } = useWallet();

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (onClick) onClick(event);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      if (!event.defaultPrevented) connect().catch(() => {});
    },
    [onClick, connect]
  );

  const content = useMemo(() => {
    if (children) return children;
    if (connecting) return 'Connecting ...';
    if (connected) return 'Connected';
    if (wallet) return 'Connect';
    return 'Connect Wallet';
  }, [children, connecting, connected, wallet]);

  return (
    <Button
      disabled={disabled || !wallet || connecting || connected}
      icon={wallet ? <BiWallet className='h-5 w-5' /> : undefined}
      onClick={handleClick}
      {...props}
    >
      {content}
    </Button>
  );
};