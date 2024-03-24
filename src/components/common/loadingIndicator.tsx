import clsx from 'clsx';
import React, { useEffect } from 'react';

import useRouterLoading from '@/hooks/useRouterLoading';

const HIDE_DELAY = 1000;

const LoadingIndicator = () => {
  const isLoading = useRouterLoading();
  const [visible, setVisible] = React.useState(true);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), HIDE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div
      className={clsx(
        'fixed left-0 right-0 top-0 z-50 mb-[-4px] h-1 bg-main-100',
        visible ? 'block' : 'hidden',
        !isLoading && 'animate-run w-full'
      )}
      data-testid='loading-indicator'
    >
      <div />
    </div>
  );
};

export default LoadingIndicator;
