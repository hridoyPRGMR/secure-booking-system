export interface NavItem {
  label: string;
  icon?: string;
  route?: string;
  /** Permission code required to see this item. Omit for items always shown (e.g. a parent group). */
  permission?: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Users', icon: '👥', route: '/users', permission: 'Users.View' },
  { label: 'Roles', icon: '🔐', route: '/roles', permission: 'Roles.View' },
  {
    label: 'Catalog',
    icon: '📦',
    children: [
      { label: 'Locations', route: '/locations', permission: 'Locations.View' },
      { label: 'Hotels', route: '/hotels', permission: 'Hotels.View' },
      { label: 'Rooms', route: '/rooms', permission: 'Rooms.View' },
    ],
  },
  { label: 'Bookings', icon: '🗓️', route: '/bookings', permission: 'Bookings.View' },
];
