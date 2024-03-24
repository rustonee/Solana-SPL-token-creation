import clsx from 'clsx';
import React, { ButtonHTMLAttributes } from 'react';

import Loader from './loader';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ icon, children, className = '', loading, ...rest }, ref) => {
    function createRipple(event: React.MouseEvent) {
      const button = event.currentTarget;

      const circle = document.createElement('span');
      circle.style.position = 'absolute';
      circle.style.borderRadius = '50%';
      circle.style.backgroundColor = '#0000001c';
      circle.style.transform = 'scale(0)';
      circle.classList.add('animate-ripple'); //tailwindcss config

      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;

      const rect = button.getBoundingClientRect();
      circle.style.left = `${event.clientX - rect.left - radius}px`;
      circle.style.top = `${event.clientY - rect.top - radius}px`;

      circle.classList.add('ripple');

      const ripple = button.getElementsByClassName('ripple')[0];

      if (ripple) {
        ripple.remove();
      }

      button.appendChild(circle);
    }

    return (
      <div className='group relative p-[1.2px]'>
        <div className='absolute inset-0 group-hover:blur-md transition-all flex rounded-xl bg-gradient-to-tr from-[#39d0d8] to-[#e300ff]'></div>
        <button
          ref={ref}
          className={clsx(
            'font-ClashDisplay bg-bg-100 group relative flex min-h-[42px] items-center justify-start gap-1 overflow-hidden whitespace-nowrap rounded-xl px-6 py-[10px] text-base font-semibold tracking-[0.01em] text-white transition-all active:scale-95',
            rest.disabled && 'cursor-not-allowed bg-[#CED8DF] text-[#4B5A67]',
            rest.disabled && 'active:scale-100',
            className
          )}
          {...rest}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            createRipple(e);
            rest.onClick && rest.onClick(e);
          }}
        >
          {icon && icon}
          {children}
          {!!loading && (
            <div className='absolute right-2'>
              <Loader />
            </div>
          )}
        </button>
      </div>
    );
  }
);

export default Button;
