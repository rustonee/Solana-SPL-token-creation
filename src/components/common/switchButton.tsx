import clsx from 'clsx';
import React, { Dispatch } from 'react';

type Props = {
  options: string[];
  value?: number;
  setValue?: Dispatch<number>;
};

const SwitchButton = ({ options, value = 0, setValue }: Props) => {
  return (
    <div className='relative flex items-center border border-border-100 w-full cursor-pointer'>
      {options.map((opt, index) => (
        <div
          key={index}
          className={clsx(
            'z-10 w-full p-2 text-center capitalize transition-all',
            value === index && 'text-text-300'
          )}
          onClick={() => setValue && setValue(index)}
        >
          {opt}
        </div>
      ))}
      <div
        className={clsx('bg-bg-400 absolute inset-y-0 transition-all')}
        style={{
          width: `${100 / options.length}%`,
          transform: `translateX(${value * 100}%)`,
        }}
      ></div>
    </div>
  );
};

export default SwitchButton;
