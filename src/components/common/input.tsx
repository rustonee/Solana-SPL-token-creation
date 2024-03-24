import clsx from 'clsx';
import React, { InputHTMLAttributes, ReactNode } from 'react';
import { AiOutlineExclamationCircle } from 'react-icons/ai';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelclassname?: string;
  description?: string;
  password?: string;
  afterPrefix?: string | ReactNode;
  required?: boolean;
  error?: string;
  tooltip?: string;
}

const Input = (props: InputProps): JSX.Element => {
  return (
    <div className='flex w-full flex-col gap-y-[6px]'>
      {props.label && (
        <label
          htmlFor={props.label}
          className={clsx(
            'flex items-center font-bold capitalize text-white',
            props.labelclassname
          )}
        >
          <span>{props.label}</span>
          {props.required && <span className='text-red-600'>*</span>}
          {props.tooltip && (
            <div className='group relative'>
              <AiOutlineExclamationCircle className='ml-1 h-4 w-4' />
              <div className='bg-bg-400 absolute left-full ml-1 hidden -translate-y-1/2 whitespace-nowrap rounded-lg p-4 text-sm group-hover:block'>
                {props.tooltip}
              </div>
            </div>
          )}
        </label>
      )}
      {props.description && (
        <div className='text-white/60 flex items-center text-sm'>
          {props.description}
        </div>
      )}
      <div className='flex items-center'>
        <input
          className={clsx(
            'bg-bg-400 font-ClashDisplay block w-full rounded-2xl border p-[15px] text-base leading-none tracking-normal text-white placeholder:text-white/50 focus:outline-0 focus:ring-0',
            props.error ? 'border-red-600' : 'border-bg-400'
          )}
          {...props}
        />
        {props.afterPrefix && (
          <div className='text-text-500'>{props.afterPrefix}</div>
        )}
      </div>
      {props.error && <div className='text-sm text-red-600'>{props.error}</div>}
    </div>
  );
};

export default Input;
