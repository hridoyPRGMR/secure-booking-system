export interface NavItem {
  label: string;
  icon?: string;
  route?: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Users', icon: '👥', route: '/users' },
  {
    label: 'Catalog',
    icon: '📦',
    children: [
      { label: 'Locations', route: '/locations' },
      { label: 'Hotels', route: '/hotels' },
      { label: 'Rooms', route: '/rooms' },
    ],
  },
  { label: 'Bookings', icon: '🗓️', route: '/bookings' },
];
