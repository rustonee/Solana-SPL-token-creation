type ExactAlt<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

type Must<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

type EndpointTypes = 'mainnet' | 'devnet' | 'localnet'
