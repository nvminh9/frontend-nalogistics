import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CreateOrderComponent } from "../home/entry/create-order/create-order.component";
import { UpdateOrderComponent } from "../home/entry/update-order/update-order.component";
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { DriverComponent } from './admin/driver/driver.component';
import { LocationComponent } from './admin/location/location.component';
import { ItemComponent } from './admin/item/item.component';
import { TruckComponent } from './admin/truck/truck.component';
import { RmoocComponent } from './admin/rmooc/rmooc.component';
import { UserRoleComponent } from './admin/user-role.component/user-role.component';
import { MaintenanceComponent } from './admin/maintenance/maintenance.component';
import { MaintenanceTypeComponent } from './admin/maintenance-type.component/maintenance-type.component';
import { Router } from '@angular/router';
import { TransportSalaryComponent } from './admin/transport-salary.component/transport-salary.component';
import { MatIcon } from "@angular/material/icon";
import { MatIconModule } from '@angular/material/icon';

interface SubmenusState {
  orders: boolean;
  categories: boolean;
  maintenance : boolean
  user : boolean
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, CreateOrderComponent, UpdateOrderComponent, DashboardComponent, DriverComponent, LocationComponent, ItemComponent, TruckComponent, RmoocComponent, UserRoleComponent, MaintenanceComponent, MaintenanceTypeComponent, TransportSalaryComponent, MatIcon, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private route : Router){}
  isCollapsed = false;
  isMobileOpen = false;
  
  // Dùng interface thay vì index signature
  submenus: SubmenusState = {
    orders: false,
    categories: false,
    maintenance : false,
    user : false
  };

  rolename = localStorage.getItem("roleName")

  ngOnInit() {
    try {
      const savedState = localStorage.getItem('sidebarCollapsed');
      this.isCollapsed = savedState === 'true';
    } catch (error) {
      console.log('localStorage not available');
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }

  // Dùng keyof để type-safe
  toggleSubmenu(submenuName: keyof SubmenusState) {
    if (!this.isCollapsed) {
      this.submenus[submenuName] = !this.submenus[submenuName];
    }
  }

  toggleMobileSidebar() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  setActiveItem(event: Event) {
    const allItems = document.querySelectorAll('.menu-item');
    allItems.forEach(item => item.classList.remove('active'));
    
    const target = event.currentTarget as HTMLElement;
    target.classList.add('active');
  }


  Logout(){
    localStorage.removeItem("token")
    localStorage.removeItem("roleName")
    localStorage.removeItem("sidebarCollapsed")
    this.route.navigate(["/login"])
  }

}
