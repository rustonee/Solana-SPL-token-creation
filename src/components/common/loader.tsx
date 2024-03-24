import clsx from 'clsx';

/**
 * Takes in custom size and stroke for circle color, default to primary color as fill,
 * need ...rest for layered styles on top
 */
export default function Loader({
  className,
  size = '16px',
  stroke = '#FFFFFF',
  strokewidth = 2.5,
  ...rest
}: {
  className?: string;
  size?: string;
  stroke?: string;
  strokewidth?: number;
  [k: string]: any;
}) {
  return (
    <svg
      className={clsx('animate-spin', className)}
      style={{ height: size, width: size }}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...rest}
    >
      <path
        d='M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5'
        strokeWidth={strokewidth}
        strokeLinecap='round'
        strokeLinejoin='round'
        stroke={stroke}
      />
    </svg>
  );
}
