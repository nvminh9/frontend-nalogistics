import { Routes } from '@angular/router';


import { authGuard } from '../guards/auth.guard';
import { adminRoleGuard } from '../guards/admin-role-guard';
import { entryRoleGuard } from '../guards/entry-role-guard';


import { HomeComponent } from "./home/home.component";
import { LoginComponent } from './auth/login/login.component';
import { CreateOrderComponent } from "./home/entry/create-order/create-order.component";
import { UpdateOrderComponent } from "./home/entry/update-order/update-order.component";
import { PageNotFoundComponent } from "./auth/page-not-found/page-not-found.component";
import { ListOrderComponent } from "../app/home/admin/list-order/list-order.component";
import { CustomerComponent } from './home/admin/customer/customer.component';
import { DashboardComponent } from './home/admin/dashboard/dashboard.component';
import { DriverComponent } from './home/admin/driver/driver.component';
import { LocationComponent } from './home/admin/location/location.component';
import { ItemComponent } from './home/admin/item/item.component';
import { RmoocComponent } from './home/admin/rmooc/rmooc.component';
import { TruckComponent } from './home/admin/truck/truck.component';
import { UserRoleComponent } from './home/admin/user-role.component/user-role.component';
import { MaintenanceComponent } from './home/admin/maintenance/maintenance.component';
import { MaintenanceTypeComponent } from './home/admin/maintenance-type.component/maintenance-type.component';
import { TransportSalaryComponent } from './home/admin/transport-salary.component/transport-salary.component';

export const routes: Routes = [
    {path : '', component : LoginComponent, } ,
    {path : 'login', component : LoginComponent, } ,

    {path : 'entry', component : HomeComponent ,canActivate : [authGuard],
    // {path : 'entry', component : HomeComponent ,canActivate : [authGuard,entryRoleGuard],
        children : [
            {path: 'create-order', component: CreateOrderComponent},
            {path: 'update-order', component: UpdateOrderComponent},

        ]
    } ,
    // {path : 'admin', component : HomeComponent, canActivate : [authGuard,adminRoleGuard],
        {path : 'admin', component : HomeComponent ,canActivate : [authGuard],
            children : [
                {path: 'dashboard', component: DashboardComponent},
                {path: 'list-order', component: ListOrderComponent},
                {path: 'list-customer', component: CustomerComponent},
                {path: 'list-driver', component: DriverComponent},
                {path: 'list-location', component: LocationComponent},
                {path: 'list-item', component: ItemComponent},
                {path: 'list-truck', component: TruckComponent},
                {path: 'list-rmooc', component: RmoocComponent},
                {path: 'list-userRole', component: UserRoleComponent},
                {path: 'list-maintenance', component: MaintenanceComponent},
                {path: 'list-maintenanceType', component: MaintenanceTypeComponent},
                {path: 'list-transportSalary', component: TransportSalaryComponent},
            ]
    } ,
    {path: '**', component: PageNotFoundComponent} // route Not Found nên ở cuối cùng


];
