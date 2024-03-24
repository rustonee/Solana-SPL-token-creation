import clsx from 'clsx';
import React from 'react';
import { AiOutlineExclamationCircle } from 'react-icons/ai';

export interface InputProps {
  label?: string;
  afterLabel?: string;
  labelClassName?: string;
  tooltip?: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}

const Switch = (props: InputProps): JSX.Element => {
  return (
    <div className='flex w-full flex-col gap-y-[6px]'>
      {props.label && (
        <label
          htmlFor={props.label}
          className={clsx(
            'flex items-center gap-2 font-bold capitalize text-white',
            props.labelClassName
          )}
        >
          <span>{props.label}</span>
          {props.tooltip && (
            <div className='group relative'>
              <AiOutlineExclamationCircle className='h-4 w-4' />
              <div className='bg-bg-400 z-10 absolute left-full ml-1 hidden -translate-y-1/2 whitespace-nowrap rounded-lg p-4 text-sm group-hover:block'>
                {props.tooltip}
              </div>
            </div>
          )}
          <div
            className={clsx(
              'relative flex h-6 w-11 cursor-pointer items-center rounded-full p-[1px]',
              props.checked ? 'bg-bg-400' : 'bg-bg-400'
            )}
            onClick={() => props.onChange()}
          >
            <div
              className={clsx(
                'absolute left-[1px] h-5 w-5 rounded-full transition-all',
                props.checked ? 'bg-bg-200 translate-x-full' : 'bg-white/40'
              )}
            />
          </div>
          {props.afterLabel && <span>{props.afterLabel}</span>}
        </label>
      )}
      {props.description && (
        <div className='flex items-center text-sm text-white/60'>
          {props.description}
        </div>
      )}
    </div>
  );
};

export default Switch;
