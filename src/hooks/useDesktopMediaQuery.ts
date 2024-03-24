import { useMediaQuery } from 'react-responsive';
// const { publicRuntimeConfig } = getConfig()

const useDesktopMediaQuery = () => {
  // const { breakpoints } = publicRuntimeConfig
  // return useMediaQuery({ query: `(min-width: ${breakpoints.lg}` })
  return useMediaQuery({ query: `(min-width: 800px` });
};

export const useMobileMediaQuery = () => {
  return useMediaQuery({ query: `(max-width: 500px` });
};

export const useLaptopMediaQuery = () => {
  return useMediaQuery({ query: `(min-width: 1080px` });
};

export const useTouchDeviceMediaQuery = () => {
  return useMediaQuery({ query: `(hover: none) and (pointer: coarse)` });
};

export default useDesktopMediaQuery;
