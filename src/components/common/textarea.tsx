import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { AiOutlineExclamationCircle } from 'react-icons/ai';

export interface InputProps {
  label?: string;
  labelClassName?: string;
  password?: string;
  afterPrefix?: string | ReactNode;
  required?: boolean;
  tooltip?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

const TextArea = (props: InputProps): JSX.Element => {
  return (
    <div className='flex w-full flex-col gap-y-[6px]'>
      {props.label && (
        <label
          htmlFor={props.label}
          className={clsx(
            'text-white font-boldflex items-center capitalize',
            props.labelClassName
          )}
        >
          <span>{props.label}</span>
          {props.required && <span className='text-red-600'>*</span>}
          {props.tooltip && (
            <div className='group relative'>
              <AiOutlineExclamationCircle className='ml-1 h-4 w-4' />
              <div className='bg-bg-200 border-border-100 absolute left-full ml-1 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border p-4 text-sm group-hover:block'>
                {props.tooltip}
              </div>
            </div>
          )}
        </label>
      )}
      <div className='flex items-center'>
        <textarea
          placeholder={props.placeholder}
          className='bg-bg-400 h-[75px] font-ClashDisplay text-white block w-full rounded-lg border-none p-[15px] text-base leading-none tracking-normal placeholder:text-[#1d1d1d] focus:outline-0 focus:ring-0'
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
        {props.afterPrefix && (
          <div className='text-whtie/60'>{props.afterPrefix}</div>
        )}
      </div>
    </div>
  );
};

export default TextArea;
