import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { RoleListComponent } from './features/roles/role-list/role-list.component';
import { LocationListComponent } from './features/locations/location-list/location-list.component';
import { HotelListComponent } from './features/hotels/hotel-list/hotel-list.component';
import { RoomListComponent } from './features/rooms/room-list/room-list.component';
import { BookingListComponent } from './features/bookings/booking-list/booking-list.component';
import { authGuard } from './core/guards/auth.guard';
import { requirePermission } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component'),
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      { path: 'dashboard', redirectTo: 'users' },
      {
        path: 'users',
        component: UserListComponent,
        data: { breadcrumb: 'Users' },
        canActivate: [requirePermission('Users.View')],
      },
      {
        path: 'roles',
        component: RoleListComponent,
        data: { breadcrumb: 'Roles' },
        canActivate: [requirePermission('Roles.View')],
      },
      {
        path: 'locations',
        component: LocationListComponent,
        data: { breadcrumb: 'Locations' },
        canActivate: [requirePermission('Locations.View')],
      },
      {
        path: 'hotels',
        component: HotelListComponent,
        data: { breadcrumb: 'Hotels' },
        canActivate: [requirePermission('Hotels.View')],
      },
      {
        path: 'rooms',
        component: RoomListComponent,
        data: { breadcrumb: 'Rooms' },
        canActivate: [requirePermission('Rooms.View')],
      },
      {
        path: 'bookings',
        component: BookingListComponent,
        data: { breadcrumb: 'Bookings' },
        canActivate: [requirePermission('Bookings.View')],
      },
      { path: '**', redirectTo: 'users' },
    ],
  },
];
