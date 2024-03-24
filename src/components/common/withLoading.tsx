import React, { useEffect, useState } from 'react';

const WithLoading = (Component: any) => {
  return function WithLoadingComponent({ ...props }) {
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1.5 * 1000);

      return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
      return (
        <div className='flex h-screen w-full items-center justify-center bg-bg-100'>
          <div className='group flex cursor-pointer items-baseline'>
            <div className='inline-block bg-gradient-to-tr text-5xl font-bold from-[#39d0d8] to-[#e300ff] bg-clip-text text-transparent'>
              Solana Create Token
            </div>
          </div>
        </div>
      );
    } else {
      return <Component {...props} />;
    }
  };
};

export default WithLoading;
