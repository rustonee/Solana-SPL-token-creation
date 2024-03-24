import React from 'react';
import { BiCopy } from 'react-icons/bi';

import useCopyClipboard from '@/hooks/useCopyClipboard';
import useNotification from '@/hooks/useNotification';

export default function Copy(props: {
  toCopy: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const [isCopied, setCopied] = useCopyClipboard();
  const notification = useNotification();

  return (
    <div
      className={`${props.className || ''} cursor-pointer`}
      onClick={() => {
        setCopied(props.toCopy);
        notification('Copied on clipboard.', 'success');
      }}
    >
      {isCopied ? (
        <div className='flex items-center'>
          <BiCopy className='fill-text-200 h-4 w-4' />
          {props.children || null}
        </div>
      ) : (
        <div className='flex items-center'>
          <BiCopy className='fill-text-100 h-4 w-4' />
          {props.children || null}
        </div>
      )}
    </div>
  );
}
