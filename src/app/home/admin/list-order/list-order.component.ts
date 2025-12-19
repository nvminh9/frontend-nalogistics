import { Component } from '@angular/core';
import { OrderService } from '../../../../services/order-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NumberFormatPipe } from '../../../NumberFormatPipe';
import { StringDateFormatPipePipe } from '../../../string-date-format-pipe-pipe';
import { environment } from '../../../../environments/environment.development';
import { Router } from '@angular/router';
import { DateUtils } from '../../../utils/DateUtils';
export interface OrderDTO {
  orderDate: Date
  containerNo: string,
  customerName: string,
  driverName: string,
  fromLocationName: string,
  fromWhereName: string,
  orderID: number,
  rmoocNo: string
  status: boolean,
  billBookingNo : string,
  toLocationName: string,
  totalCost: number
  truckNo: string
  userId: number
}

@Component({
  selector: 'app-list-order',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NumberFormatPipe, StringDateFormatPipePipe],
  templateUrl: './list-order.component.html',
  styleUrl: './list-order.component.css'
})
export class ListOrderComponent {


  listOrder: OrderDTO[] = []

 fromDateStr: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

// Ngày cuối tháng hiện tại  
 toDateStr: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 2);

  order = ''
  sortBy = ''
  pageSize = 30
  pageNumber = 1
  keySearch = ''
  status = ''
  listOrderLength = 0

  // cursor : string=''
  value : string = ''

  orderStatusList = environment.OrderStatusPattern;

  rolename = localStorage.getItem("roleName")

  constructor(
    private o_service: OrderService,
    private toastr: ToastrService,
    private router : Router
  ) { }


  ngOnInit() {
    switch (this.rolename) {
      case "Operator":
        this.status = "Pending"
        break;
      case "Accountant":
        this.status = "Delivered"
        break;
      case "Admin":
        this.status = "Completed"
        break;
      case "Approver":
        this.status = "AwaitingApproval"
        break;
      case "Entry":
        this.status = "Pending"
        break;
      default:
        this.status = ""
        break;
    }
    this.loadOrders()
  }

  loadOrders() {
    this.o_service.ListOrder(this.fromDateStr, this.toDateStr, this.order, this.sortBy, this.pageSize, this.pageNumber, this.keySearch, this.status).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listOrderLength = data.data.listOrder.length

        this.fromDateStr = data.data.fromDate.substring(0, 10)
        this.toDateStr = data.data.toDate.substring(0, 10)

        data.data.listOrder.forEach((e: any) => {
          e.status = this.orderStatusList[e.status].value;
          this.value = e.totalCost.toString()          
        });        
        this.listOrder = data.data.listOrder;
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
      else {
        console.log(data.message)
      }
    })
  }


  searchObject() {
    this.loadOrders();
  }

  showEntries(event:any){
    this.pageSize = event.target.value
    this.loadOrders()
  }

  sortData(event: any) {
    switch (event.target.value) {
      case 'price-asc':
        this.order = 'asc'
        this.sortBy = 'cost'
        this.pageNumber = 1
        // this.cursor = this.value
        this.loadOrders()
        break;
      case 'price-desc':
        this.order = 'desc'
        this.sortBy = 'cost'
        this.pageNumber = 1
        // this.cursor = this.value
        this.loadOrders()
        break;
      case 'id-asc':
        this.order = 'asc'
        this.sortBy = 'id'
        this.pageNumber = 1
        this.loadOrders()
        break;
      default:
        this.order = 'desc'
        this.sortBy = 'id'
        this.pageNumber = 1
        this.loadOrders()
        break;
    }

  }

  sortStatus(event: any) {    
    this.status = event.target.value; // Lấy giá trị string từ option được chọn
    this.pageNumber = 1
    console.log(this.status);

  }


  changePage(page : number){
      if (this.pageNumber != page) {
        this.pageNumber = page
        // this.cursor = ''
        this.value = ''
        this.loadOrders()
      }
      else this.toastr.error("Đang ở trang hiện tại")
  }

  ExportOrders(typeExport:string){
    this.o_service.ExportOrders( this.fromDateStr, this.toDateStr, this.order, this.sortBy, this.pageSize, this.pageNumber, this.keySearch, this.status , typeExport).subscribe(
      {
        next: (blob: Blob) => {
            const timestamp = new Date().getTime();
            const filename = `Orders_page${this.pageNumber}_${timestamp}.${typeExport}`; 
            const url = window.URL.createObjectURL(blob);     
            const link = document.createElement('a');
            link.href = url;
            link.download = filename; 
            document.body.appendChild(link); 
            link.click();
            document.body.removeChild(link); 
            window.URL.revokeObjectURL(url);
        },
        error: (error) => {
            console.error('Download failed:', error);
            alert('Failed to download file. Please try again.');
        }
      }
    )
  }


  DetailOrder(orderID:number){
    this.router.navigate(['//entry/update-order'] , { queryParams : { orderID : orderID }}); // Programmatic navigation
  }

}
