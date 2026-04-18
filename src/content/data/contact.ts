export interface ContactItem {
  /** Filename (no extension) of the icon in /images/Icon/Light/ */
  icon: string;
  label: string;
  href: string | null;
  external?: boolean;
}

export const contacts: ContactItem[] = [
  { icon: 'Mail',     label: 'mkl.adsn@gmail.com', href: 'mailto:mkl.adsn@gmail.com' },
  { icon: 'Phone',    label: '+46 709 52 64 03',    href: 'tel:+46709526403'           },
  { icon: 'Linkedin', label: 'LinkedIn',            href: 'https://www.linkedin.com/in/mikael-andersson-1a221a30/',      external: true },
  { icon: 'Location', label: 'Stockholm, Sweden',   href: 'https://maps.app.goo.gl/Wod7hsKLJPK7Tv7a9'                         },
];
