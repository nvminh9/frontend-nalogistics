import { Component } from '@angular/core';
import { TruckService } from '../../../../services/truck-service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


export interface truckDTO {
  truckID: number,
  truckNo: string,
  isActive: boolean
}

@Component({
  selector: 'app-truck',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './truck.component.html',
  styleUrl: './truck.component.css'
})
export class TruckComponent {
  constructor(
    private t_service: TruckService,
    private toastr: ToastrService
  ) { }



  token: string = localStorage.getItem("token") || ''
  order: string = ''
  sortBy: string = ''
  pageSize: number = 12
  pageNumber: number = 1
  keySearch: string = ''
  listTruck: truckDTO[] = []


  // Modal states
  isAddModalOpen: boolean = false;
  isDetailModalOpen: boolean = false;
  isEditMode: boolean = false;
  currentTruck: truckDTO | null = null;

  ngOnInit() {
    this.t_service.listTruck(this.token, this.order, this.sortBy, this.pageSize, this.pageNumber, this.keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listTruck = data.data
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
      else {
        console.log(data.message)
      }
    })

  }

  DetailTruck(TruckID: number) {
    this.t_service.DetailTruck(TruckID).subscribe((data: any) => {
      this.currentTruck = data.data
    })
  }

  DeleteTruck(TruckID: number) {
    confirm("Bạn có chắc xóa người dùng này không?")
  }

  updateTruckFromDetail(TruckID: number) {
    if (this.currentTruck?.isActive.toString() == "true") {
      this.currentTruck.isActive = true
    }
    if (this.currentTruck?.isActive.toString() == "false") {
      this.currentTruck.isActive = false
    }
    const truckDTO = {
      truckNo: this.currentTruck?.truckNo,
      isActive: this.currentTruck?.isActive
    }
    this.t_service.UpdateTruck(TruckID, truckDTO).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.toastr.success(data.message)
        this.loadTrucks();
        this.closeDetailModal();
      }
      else if (data.statusCode == 400) this.toastr.error(data.message)
      else console.log(data);
    })
  }

  // Form data
  truckForm = {
    truckNo: '',
  };

  // UserID and RoleID send at Frontend but not show in template

  // ==============================================
  // MODAL METHODS
  // ==============================================

  // Mở modal thêm mới
  openAddModal() {
    this.isEditMode = false;
    this.currentTruck = null;
    this.resetForm();
    this.isAddModalOpen = true;
  }

  // Đóng modal thêm/sửa
  closeAddModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  // Mở modal chi tiết
  openDetailModal(truckID: number) {
    this.isDetailModalOpen = true;
    this.DetailTruck(truckID);
  }
  // Đóng modal chi tiết
  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.currentTruck = null;
  }

  editFromDetail() {
    if (!this.currentTruck) return;
    this.closeDetailModal();
    // Delay để animation mượt mà
    setTimeout(() => {
      this.isEditMode = true;
      this.fillFormWithTruck(this.currentTruck!);
      this.isAddModalOpen = true;
    }, 300);
  }

  // Điền dữ liệu vào form
  fillFormWithTruck(truck: truckDTO) {
    this.truckForm = {
      truckNo : truck.truckNo,
    };
  }

  // Reset form
  resetForm() {
    this.truckForm = {
      truckNo : '',
    };
  }

  saveTruck() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    if (this.isEditMode && this.currentTruck) {
      // Logic cập nhật khách hàng
      console.log('Updating Truck:', this.truckForm);
      this.toastr.success('Cập nhật Xe thành công!');
    } else {
      let truckDTO = {
        TruckNo: this.truckForm.truckNo,
      }
      this.t_service.CreateTruck(truckDTO).subscribe((data: any) => {
        if (data.statusCode == 200) {
          this.toastr.success(data.message)
          this.closeAddModal();
          this.loadTrucks(); // Reload danh sách
        }
        else if (data.statusCode = 400) this.toastr.error(data.message)
        else console.log(data.message);
      })
    }
  }

  // Validate form đơn giản
  validateForm(): boolean {
    if (!this.truckForm.truckNo.trim()) {
      this.toastr.error('Vui lòng nhập Mã Xe');
      return false;
    }
    return true;
  }

  // Đóng modal khi click overlay
  onOverlayClick(event: MouseEvent, modalType: 'add' | 'detail') {
    if (event.target === event.currentTarget) {
      if (modalType === 'add') {
        this.closeAddModal();
      } else {
        this.closeDetailModal();
      }
    }
  }

  // Get modal title
  get modalTitle(): string {
    return this.isEditMode ? 'Chỉnh sửa Xe' : 'Thêm Xe mới';
  }


  loadTrucks() {
    this.ngOnInit(); // Hoặc gọi lại method load data
  }


  showEntries(event: any) {
    this.pageSize = event.target.value
    this.loadTrucks()
  }

  changePage(page: number) {
    if (this.pageNumber != page) {
      this.pageNumber = page
      this.loadTrucks()
    }
    else this.toastr.error("Đang ở trang hiện tại")
  }

  sortData(event: any) {
    switch (event.target.value) {
      case 'id-new':
        this.order = "desc", this.sortBy = "id"
        break;
      case 'name-az':
        this.order = "asc", this.sortBy = "name"
        break;
      case 'name-za':
        this.order = "desc", this.sortBy = "name"
        break;
      default:
        this.order = "", this.sortBy = ""
        break;
    }
    this.loadTrucks()
  }


  private searchTimeout: any;
  searchTruck(event: any) {
    this.keySearch = event.target.value
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadTrucks()
    }, 500);
  }




}
