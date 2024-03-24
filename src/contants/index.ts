import { MenuType } from '@/types';

export const menus: MenuType[] = [
  { title: 'Dashboard', href: '/dashboard', sub: [] },
  { title: 'Bundler', href: '/bundler', sub: [] },
  { title: 'Create Token', href: '/create', sub: [] },
  {
    title: 'About',
    href: '',
    sub: [
      { title: 'About', href: '/about', sub: [] },
      { title: 'Team', href: '/team', sub: [] },
      { title: 'Contact', href: '/contact', sub: [] },
      { title: 'Blog', href: '/blog', sub: [] },
      { title: 'Chnagelog', href: '/changelog', sub: [] },
      { title: 'FAQ', href: '/faq', sub: [] },
      { title: 'Terms of service', href: '/terms', sub: [] },
      { title: 'Privacy policy', href: '/policy', sub: [] },
    ],
  },
];
