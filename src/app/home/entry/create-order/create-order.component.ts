import { Component } from '@angular/core';
import { OrderService } from '../../../../services/order-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NumberFormatPipe } from '../../../NumberFormatPipe';

export interface OrderLineDTO {
  ItemID: number,
  ItemName: string,
  ItemDescription?: string,
  ItemCost?: number,
  fixedPrice: number
  hasInvoice: boolean,
  InvoiceName?: string,
  InvoiceNo?: string,
  isActive: boolean
}

export interface OrderDTO {
  OrderDate: string,
  CustomerId: number,
  CustomerName: string,
  driverName: string,
  DriverId: number,
  TruckId: number,
  TruckNo: string,
  RmoocId: number,
  RmoocNo: string,
  ContainerNo: string,
  ContainerType: string,
  BillBookingNo: string,
  FromLocationID: number,
  FromLocationName: string,
  FromWhereID: number,
  FromWhereName: string,
  ToLocationID: number,
  ToLocationName: string,
  OrderLineList: OrderLineDTO[]
}

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NumberFormatPipe],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css'
})
export class CreateOrderComponent {

  listCustomerDTO: any = []
  listDriverDTO: any = []
  listTruckDTO: any = []
  listRmoocDTO: any = []
  listLocationDTO: any = []
  listItemDTO: any = []
  keySearch: string = ''

  currentOrderDTO: OrderDTO = {
    OrderDate: '',
    CustomerId: 0,
    CustomerName: '',
    DriverId: 0,
    driverName: '',
    TruckId: 0,
    TruckNo: '',
    RmoocId: 0,
    RmoocNo: '',
    ContainerNo: '',
    ContainerType: '',
    BillBookingNo: '',
    FromLocationID: 0,
    FromLocationName: '',
    FromWhereID: 0,
    FromWhereName: '',
    ToLocationID: 0,
    ToLocationName: '',
    OrderLineList: []
  };

  currentOrderLine: OrderLineDTO = {
    ItemID: 0,
    ItemName: '',
    ItemDescription: '',
    ItemCost: 0,
    fixedPrice: 0,
    hasInvoice: false,
    InvoiceName: '',
    InvoiceNo: '',
    isActive: false
  }

    rolename = localStorage.getItem("roleName")

  
  constructor(
    private o_service: OrderService,
    private toastr: ToastrService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.listItem(this.keySearch);
  }

  toggleDropdown(dropdownId: string, event: any) {
    this.keySearch = event.target.value
    switch (dropdownId) {
      case 'customerDropdown':
        this.listCustomer(this.keySearch)
        break;
      case 'driverDropdown':
        this.listDriver(this.keySearch)
        break;
      case 'vehicleDropdown':
        this.listTruck(this.keySearch)
        break;
      case 'rmoorDropdown':
        this.listRmooc(this.keySearch)
        break;
      case 'portReceiveDropdown':
      case 'warehouseDropdown':
      case 'portReturnDropdown':
        this.listLocation(this.keySearch)
        break;
      default:
        this.listCustomer(this.keySearch)
        break;
    }
  }

  showListObject(dropdownId: string) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const menu = dropdown.querySelector('.dropdown-menu');
    const toggle = dropdown.querySelector('.dropdown-toggle');

    // Toggle hiển thị dropdown
    if (menu?.classList.contains('show')) {
      menu.classList.remove('show');
      toggle?.classList.remove('active');
    } else {
      // Đóng tất cả dropdown khác
      document.querySelectorAll('.dropdown-menu.show').forEach(otherMenu => {
        otherMenu.classList.remove('show');
        otherMenu.closest('.searchable-dropdown')?.querySelector('.dropdown-toggle')?.classList.remove('active');
      });

      // Hiển thị dropdown hiện tại
      menu?.classList.add('show');
      toggle?.classList.add('active');

      // Load data
      this.loadDropdownData(dropdownId);
    }
  }

  private loadDropdownData(dropdownId: string) {
    switch (dropdownId) {
      case 'customerDropdown':
        this.listCustomer(this.keySearch);
        break;
      case 'driverDropdown':
        this.listDriver(this.keySearch);
        break;
      case 'vehicleDropdown':
        this.listTruck(this.keySearch);
        break;
      case 'rmoorDropdown':
        this.listRmooc(this.keySearch);
        break;
      case 'portReceiveDropdown':
      case 'warehouseDropdown':
      case 'portReturnDropdown':
        this.listLocation(this.keySearch);
        break;
    }
  }

  private closeDropdown(dropdownId: string) {
    const dropdown = document.getElementById(dropdownId);
    const menu = dropdown?.querySelector('.dropdown-menu');
    const toggle = dropdown?.querySelector('.dropdown-toggle');

    menu?.classList.remove('show');
    toggle?.classList.remove('active');
  }

  saveOrder() {
    if (!this.validateForm()){
      return
    }
    this.currentOrderDTO.OrderLineList.forEach((i: any) => {
      if (i.InvoiceNo.trim() != '' && i.InvoiceName.trim() !== "" && i.ItemCost > 0 ) {
        i.isActive = true;
      } else {
        i.isActive = false;
      }
    });
    this.o_service.CreateOrder(this.currentOrderDTO).subscribe((data: any) => {
      if (data.statusCode == 200) {
        const toastRef = this.toastr.success(
          data.message + '<br><span class="toast-view-detail-btn">Xem chi tiết đơn hàng</span>',
          '',
          { enableHtml: true, timeOut: 5000 }
        );
        toastRef.onTap.subscribe(() => {
          this.router.navigate(['/entry/update-order'], { queryParams: { orderID: data.data } });
        });
        this.cancelOrder()
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
      else {
        console.log(data.message)
      }
    })
  }

  cancelOrder() {
    this.currentOrderDTO = {
      OrderDate: '',
      CustomerId: 0,
      CustomerName: '',
      DriverId: 0,
      driverName: '',
      TruckId: 0,
      TruckNo: '',
      RmoocId: 0,
      RmoocNo: '',
      ContainerNo: '',
      ContainerType: '',
      BillBookingNo: '',
      FromLocationID: 0,
      FromLocationName: '',
      FromWhereID: 0,
      FromWhereName: '',
      ToLocationID: 0,
      ToLocationName: '',
      OrderLineList: this.listItemDTO.map((i: any) => ({
        ItemID: i.itemID,
        ItemName: i.itemName,
        ItemDescription: '',
        fixedPrice: i.fixedPrice,
        ItemCost: 0,
        hasInvoice: false,
        InvoiceNo: '',
        InvoiceName: '',
        isActive : false
      }))
    };
  }


  validateForm():boolean {
    // if (this.currentOrderDTO.ToLocationID == this.currentOrderDTO.FromLocationID || this.currentOrderDTO.ToLocationID == this.currentOrderDTO.FromWhereID || this.currentOrderDTO.FromLocationID == this.currentOrderDTO.FromWhereID) {
    //   this.toastr.error('Các địa chỉ đang trùng với nhau');
    //   return false;
    // }
    // const currentDate = new Date();
    // currentDate.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00 để so sánh chỉ ngày
    
    // const orderDate = new Date(this.currentOrderDTO.OrderDate);
    // orderDate.setHours(0, 0, 0, 0);
    
    // if (orderDate < currentDate) {
    //   this.toastr.error('Ngày đặt hàng không được nhỏ hơn ngày hiện tại');
    //   return false;
    // }
    return true;
  }
  listCustomer(keySearch: string) {
    this.o_service.listCustomerService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listCustomerDTO = data.data
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  listDriver(keySearch: string) {
    this.o_service.listDriverService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listDriverDTO = data.data
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  listTruck(keySearch: string) {
    this.o_service.listTruckService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listTruckDTO = data.data
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  listRmooc(keySearch: string) {
    this.o_service.listRmoocService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listRmoocDTO = data.data
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  listLocation(keySearch: string) {
    this.o_service.listLocationService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listLocationDTO = data.data.listLocation
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  listItem(keySearch: string) {
    this.o_service.listItemService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listItemDTO = data.data
        this.currentOrderDTO.OrderLineList = this.listItemDTO.map((i: any) => ({
          ItemID: i.itemID,
          ItemName: i.itemName,
          ItemDescription: '',
          fixedPrice: i.fixedPrice,
          ItemCost: 0,
          hasInvoice: false,
          InvoiceNo: '',
          InvoiceName: '',
          isActive: false
        }));
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  // Selection handlers
  onSelectCustomer(selectedId: number) {
    this.currentOrderDTO.CustomerId = selectedId;
    const d = this.listCustomerDTO.find((x: any) => x.customerID === selectedId);
    this.currentOrderDTO.CustomerName = d ? d.customerName : '';
    this.keySearch = '';
    this.closeDropdown('customerDropdown');
  }

  onSelectDriver(selectedId: number) {
    this.currentOrderDTO.DriverId = selectedId;
    const d = this.listDriverDTO.find((x: any) => x.driverID === selectedId);
    this.currentOrderDTO.driverName = d ? d.driverName : '';
    this.keySearch = '';
    this.closeDropdown('driverDropdown');
  }

  onSelectTruck(selectedId: number) {
    this.currentOrderDTO.TruckId = selectedId;
    const d = this.listTruckDTO.find((x: any) => x.truckID === selectedId);
    this.currentOrderDTO.TruckNo = d ? d.truckNo : '';
    this.keySearch = '';
    this.closeDropdown('vehicleDropdown');
  }

  onSelectRmooc(selectedId: number) {
    this.currentOrderDTO.RmoocId = selectedId;
    const d = this.listRmoocDTO.find((x: any) => x.truckID === selectedId);
    this.currentOrderDTO.RmoocNo = d ? d.truckNo : '';
    this.keySearch = '';
    this.closeDropdown('rmoorDropdown');
  }

  onSelectLocation(selectedId: number, check: string) {
    switch (check) {
      case 'FromLocationID':
        this.currentOrderDTO.FromLocationID = selectedId;
        const d = this.listLocationDTO.find((x: any) => x.locationId === selectedId);
        this.currentOrderDTO.FromLocationName = d ? d.locationName : '';
        this.closeDropdown('portReceiveDropdown');
        break;
      case 'FromWhereID':
        this.currentOrderDTO.FromWhereID = selectedId;
        const f = this.listLocationDTO.find((x: any) => x.locationId === selectedId);
        this.currentOrderDTO.FromWhereName = f ? f.locationName : '';
        this.closeDropdown('warehouseDropdown');
        break;
      default:
        this.currentOrderDTO.ToLocationID = selectedId;
        const c = this.listLocationDTO.find((x: any) => x.locationId === selectedId);
        this.currentOrderDTO.ToLocationName = c ? c.locationName : '';
        this.closeDropdown('portReturnDropdown');
        break;
    }
    this.keySearch = '';
  }
}