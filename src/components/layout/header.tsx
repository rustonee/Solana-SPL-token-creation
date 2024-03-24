import React from 'react';

import Wallet from '../wallet';

const Header = (): JSX.Element => {
  return (
    <div className='sticky top-0 z-50 w-full lg:h-fit'>
      <div className='mx-4 flex flex-col gap-[18px] pb-[10px] pt-5 lg:mx-[72px] lg:py-5'>
        <div className='flex items-center justify-between'>
          <div className='group flex cursor-pointer items-baseline'></div>
          <div className='hidden items-center gap-6 text-lg font-semibold lg:flex'></div>
          <div className='flex items-center gap-4'>
            <Wallet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
