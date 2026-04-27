import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { OrderService } from '../../../../services/order-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NumberFormatPipe } from '../../../NumberFormatPipe';
import { StringDateFormatPipePipe } from '../../../string-date-format-pipe-pipe';
import { StatisticReport } from '../../../../services/statistic-report';


export interface OrderDTO {
  orderId : number,
  orderDate: Date
  truckNo: string,
  customerName: string,
  driverName: string,
  fromLocationID: number,
  fromWhereID: number,
  toLocationID: number,
  fromLocationName: string,
  fromWhereName: string,
  toLocationName: string,
  prePayFee : number,
  totalCost : number , // tổng chi phí của phần kế toán
  status: number,
  transcostDTO : transcostDTO,
  revenue : number
}
export interface transcostDTO {
  transcostID:number,
  cost: number,
  fuelPriceAtOrder: number
}

@Component({
  selector: 'app-truck-statistic.component',
  standalone : true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NumberFormatPipe, StringDateFormatPipePipe],
  templateUrl: './truck-statistic.component.html',
  styleUrl: './truck-statistic.component.css'
})
export class TruckStatisticComponent {

  ListOrderstatistic: OrderDTO[] = []

  fromDateStr: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0); // 00:00:00 ngày 1

  toDateStr: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59); // 23:59:59 ngày cuối tháng
  order = ''
  sortBy = ''
  pageSize = 30
  pageNumber = 1
  truckNo = '50H15394'
  status = ''
  ListOrderstatisticLength = 0
  listLocationDTO : any

  totalCost: number = 0 ;// tổng chi phí OrderLine
  grossProfit :number = 0 ; // lợi nhuận gộp (chưa trừ chi phí)
  netProfit :number = 0; // lợi nhuận sau khi trừ chi phí
  isDropdownOpen = false;

  // cursor : string=''
  value : string = ''
  newRevenue : number = 0;
  orderStatusList = environment.OrderStatusPattern;

  rolename = localStorage.getItem("roleName")
  listTruckDTO: any[] = [];
  ListMaintenance: any[] = [];
  CostForListMaintenance: number = 0;

  constructor(
    private o_service: OrderService,
    private s_service : StatisticReport,
    private toastr: ToastrService,
    private router : Router
  ) { }


  ngOnInit() {
    switch (this.rolename) {
      case "Operator":
        this.status = "Completed"
        break;
      case "Accountant":
        this.status = "Completed"
        break;
      case "Admin":
        this.status = "Completed"
        break;
      case "Approver":
        this.status = "Completed"
        break;
      case "Entry":
        this.status = "Completed"
        break;
      default:
        this.status = "Completed"
        break;
    }
    this.loadOrders()
  }

  loadOrders() {
    console.log(this.status);
    this.s_service.ListOrderstatistic(this.truckNo, this.fromDateStr, this.toDateStr, this.status).subscribe((data: any) => {
      if (data.statusCode == 200) {
        console.log(data);
        this.ListOrderstatisticLength = data.data.data.length
        this.fromDateStr = data.data.fromDateStr
        this.toDateStr = data.data.toDateStr
        this.ListOrderstatistic = data.data.data;
              this.ok(); // load maintenance

      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
      else {
        console.log(data.message)
      }
    })
  }

  UpdateRevenueOrder(orderId :number) {
    this.o_service.UpdateRevenueOrder(this.newRevenue, orderId).subscribe((data: any) => {
      if (data.statusCode == 200) { 
        this.toastr.success(data.message)
        this.loadOrders();
      }
      else if(data.statusCode = 400) this.toastr.error(data.message)
      else console.log(data.message);
    })
  }

  searchObject(){
    this.loadOrders()
  }

  showListObject(dropdownId: string) {
    const dropdown = document.getElementById(dropdownId);
    const menu = dropdown?.querySelector('.dropdown-menu') as HTMLElement;
    
    if (this.isDropdownOpen) {
      menu.style.display = 'none';
      this.isDropdownOpen = false;
      return;
    }

    // Gọi API lấy list truck
    this.o_service.listTruckService('').subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listTruckDTO = data.data;
        menu.style.display = 'block';
        this.isDropdownOpen = true;
      } else {
        this.toastr.error(data.message);
      }
    });
  }

  toggleDropdown(dropdownId: string, event: any) {
    const keyword = event.target.value?.toLowerCase() ?? '';
    // Filter list theo keyword gõ vào
    this.o_service.listTruckService(keyword).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listTruckDTO = data.data;
      }
    });
  }

  onSelectTruck(selectedTruckNo: string, dropdownId: string) {
    this.truckNo = selectedTruckNo;
    // Đóng dropdown sau khi chọn
    const dropdown = document.getElementById(dropdownId);
    const menu = dropdown?.querySelector('.dropdown-menu') as HTMLElement;
    menu.style.display = 'none';
    this.isDropdownOpen = false;
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

  ExportOrders(typeExport: string) {
    this.s_service.ExportListOrderstatistic(this.truckNo, this.fromDateStr, this.toDateStr, this.status).subscribe({
      next: (response: any) => {
          // Lấy tên file từ Content-Disposition header
          const contentDisposition = response.headers.get('Content-Disposition');
          let fileName = `export.${typeExport}`; // fallback
          if (contentDisposition) {
              const match = contentDisposition.split('filename=')[1]?.split(';')[0];
              if (match) fileName = match.trim();
          }

          const blob = new Blob([response.body], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
      },
      error: (error) => {
          console.error('Download failed:', error);
          alert('Failed to download file. Please try again.');
      }
    });
  }

  ok(){
    this.s_service.ListMaintenanceByTruckNo(this.truckNo).subscribe((data :any)=>{
      if (data.statusCode == 200) {
        // this.ListMaintenance = data.data.totalCostMaintence;
        console.log(data);
        
        this.CostForListMaintenance = data.data.totalCostMaintence;
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
      else {
        console.log(data.message)
      }
    })
  }

  // Thêm vào trong class, dùng getter để tự tính khi data thay đổi
get totalRevenue(): number {
  return this.ListOrderstatistic.reduce((sum, o) => sum + (o.revenue || 0), 0);
}

get totalSalary(): number {
  return this.ListOrderstatistic.reduce((sum, o) => sum + (o.transcostDTO?.cost || 0), 0);
}

get totalOrderCost(): number {
  return this.ListOrderstatistic.reduce((sum, o) => sum + (o.totalCost || 0), 0);
}

get totalPrePay(): number {
  return this.ListOrderstatistic.reduce((sum, o) => sum + (o.prePayFee || 0), 0);
}

get totalProfit(): number {
  return this.totalRevenue - this.totalSalary - this.totalOrderCost;
}

get finalProfit(): number {
  return this.totalProfit - this.CostForListMaintenance;
}

// Tự động load maintenance cost khi load orders xong, gọi this.ok() trong loadOrders
get profitByDate(): { date: string; profit: number }[] {
  if (!this.ListOrderstatistic || this.ListOrderstatistic.length === 0) return [];

  // Gom lợi nhuận theo từng ngày
  const map = new Map<string, number>();
  this.ListOrderstatistic.forEach(o => {
    const dateKey = new Date(o.orderDate).toISOString().split('T')[0]; // yyyy-mm-dd
    const profit = (o.revenue || 0) - (o.transcostDTO?.cost || 0) - (o.totalCost || 0);
    map.set(dateKey, (map.get(dateKey) || 0) + profit);
  });

  // Sắp xếp theo ngày tăng dần
  return Array.from(map.entries())
    .map(([date, profit]) => ({ date, profit }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Tạo SVG path cho line chart
get chartPath(): string {
  const data = this.profitByDate;
  if (data.length === 0) return '';

  const width = 1000;
  const height = 250;
  const padding = 40;

  const profits = data.map(d => d.profit);
  const maxProfit = Math.max(...profits, 0);
  const minProfit = Math.min(...profits, 0);
  const range = maxProfit - minProfit || 1;

  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);

  return data.map((d, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((d.profit - minProfit) / range) * (height - padding * 2);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
}

// Tọa độ điểm cho hover/marker
get chartPoints(): { x: number; y: number; date: string; profit: number; isLoss: boolean }[] {
  const data = this.profitByDate;
  if (data.length === 0) return [];

  const width = 1000;
  const height = 250;
  const padding = 40;

  const profits = data.map(d => d.profit);
  const maxProfit = Math.max(...profits, 0);
  const minProfit = Math.min(...profits, 0);
  const range = maxProfit - minProfit || 1;

  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);

  return data.map((d, i) => ({
    x: padding + i * stepX,
    y: height - padding - ((d.profit - minProfit) / range) * (height - padding * 2),
    date: d.date,
    profit: d.profit,
    isLoss: d.profit < 0
  }));
}

// Đường zero line (lợi nhuận = 0) để thấy lỗ/lời
get zeroLineY(): number {
  const data = this.profitByDate;
  if (data.length === 0) return 0;

  const height = 250;
  const padding = 40;
  const profits = data.map(d => d.profit);
  const maxProfit = Math.max(...profits, 0);
  const minProfit = Math.min(...profits, 0);
  const range = maxProfit - minProfit || 1;

  return height - padding - ((0 - minProfit) / range) * (height - padding * 2);
}
}
