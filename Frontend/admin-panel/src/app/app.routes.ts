import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { LocationListComponent } from './features/locations/location-list/location-list.component';
import { HotelListComponent } from './features/hotels/hotel-list/hotel-list.component';
import { RoomListComponent } from './features/rooms/room-list/room-list.component';
import { BookingListComponent } from './features/bookings/booking-list/booking-list.component';
import { authGuard } from './core/guards/auth.guard';

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
      { path: 'users', component: UserListComponent, data: { breadcrumb: 'Users' } },
      { path: 'locations', component: LocationListComponent, data: { breadcrumb: 'Locations' } },
      { path: 'hotels', component: HotelListComponent, data: { breadcrumb: 'Hotels' } },
      { path: 'rooms', component: RoomListComponent, data: { breadcrumb: 'Rooms' } },
      { path: 'bookings', component: BookingListComponent, data: { breadcrumb: 'Bookings' } },
      { path: '**', redirectTo: 'users' },
    ],
  },
];
