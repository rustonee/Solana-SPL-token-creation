import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import type { FC, MouseEvent } from 'react';
import React, { useCallback } from 'react';
import { BiWallet } from 'react-icons/bi';

import Button, { ButtonProps } from '@/components/common/button';


export const WalletModalButton: FC<ButtonProps> = ({
  children = 'Select Wallet',
  onClick,
  ...props
}) => {
  const { visible, setVisible } = useWalletModal();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (onClick) onClick(event);
      if (!event.defaultPrevented) setVisible(!visible);
    },
    [onClick, setVisible, visible]
  );

  return (
    <Button
      icon={<BiWallet className='h-5 w-5' />}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};