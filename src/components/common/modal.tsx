import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';
import React, { Fragment } from 'react';

const MAX_WIDTH_CLASS_MAPPING = {
  xs: 'max-w-full sm:max-w-sm',
  sm: 'sm:max-w-sm',
  md: 'lg:max-w-md',
  lg: 'lg:max-w-lg',
  xl: 'lg:max-w-xl',
  '2xl': 'lg:max-w-2xl',
  '3xl': 'lg:max-w-3xl',
};

interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  afterLeave?: () => void;
  children?: React.ReactNode;
  transparent?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  unmount?: boolean;
}

const Modal = ({
  isOpen,
  onDismiss,
  afterLeave,
  children,
  maxWidth = 'xs',
  unmount,
}: ModalProps): JSX.Element => {
  return (
    <Transition
      appear
      show={isOpen}
      as={Fragment}
      afterLeave={afterLeave}
      unmount={unmount}
    >
      <Dialog
        as='div'
        className='fixed inset-0 z-50'
        onClose={onDismiss}
        unmount={unmount}
      >
        <div className='relative flex min-h-screen items-center justify-center text-center'>
          <Transition.Child
            unmount={false}
            as={Fragment}
            enter='ease-out duration-150'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-150'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Dialog.Overlay className='fixed inset-0 bg-[rgb(0,0,0,0.8)] filter sm:bg-[rgb(0,0,0,0.4)] sm:backdrop-blur-[10px]' />
          </Transition.Child>

          <span
            className='inline-block h-screen align-middle'
            aria-hidden='true'
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter='ease-out duration-150'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-150'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <div
              className={clsx(
                'no-scrollbar pointer-events-auto fixed bottom-0 mx-auto max-h-[85vh] w-full transform rounded-none text-left sm:block sm:bottom-1/2 sm:translate-y-1/2',
                MAX_WIDTH_CLASS_MAPPING[maxWidth]
              )}
            >
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
