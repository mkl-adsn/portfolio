import type { IconName } from '../../scripts/icons';

export interface ContactItem {
  /** Icon name (no extension) from src/icons/ */
  icon: IconName;
  label: string;
  href: string | null;
  external?: boolean;
}

export const contacts: ContactItem[] = [
  { icon: 'mail',     label: 'mkl.adsn@gmail.com', href: 'mailto:mkl.adsn@gmail.com' },
  { icon: 'phone',    label: '+46 709 52 64 03',    href: 'tel:+46709526403'           },
  { icon: 'linkedin', label: 'LinkedIn',            href: 'https://www.linkedin.com/in/mikael-andersson-1a221a30/',      external: true },
  { icon: 'github',   label: 'GitHub',              href: 'https://github.com/mkl-adsn',                                 external: true },
  { icon: 'location', label: 'Stockholm, Sweden',   href: 'https://maps.app.goo.gl/Wod7hsKLJPK7Tv7a9'                         },
];
