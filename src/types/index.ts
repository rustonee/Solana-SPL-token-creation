export type MenuType = {
  title: string;
  href: string;
  sub: MenuType[];
};

export type CreateBundleTokenInput = {
  privateKey: string;
  name: string;
  symbol: string;
  image: string;
  decimals: number;
  description: string;
  supply: number;
  immutable?: boolean;
  revokeMint?: boolean;
  revokeFreeze?: boolean;
  socialLinks?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
};
