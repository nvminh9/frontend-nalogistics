import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaintenanceService } from '../../../../services/maintenance-service';

export interface MaintenanceTypeDTO {
  maintenanceTypeID: number,
  nameType: string,
  isActive: Boolean
}

@Component({
  selector: 'app-maintenance-type.component',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './maintenance-type.component.html',
  styleUrl: './maintenance-type.component.css'
})
export class MaintenanceTypeComponent {

  constructor(
    private l_service: MaintenanceService,
    private toastr: ToastrService
  ) { }

  token: string = localStorage.getItem("token") || ''
  order: string = ''
  sortBy: string = ''
  pageSize: number = 12
  pageNumber: number = 1
  keySearch: string = ''
  listMaintenanceTypeDTO: MaintenanceTypeDTO[] = []

  // Modal states
  isAddModalOpen: boolean = false;
  isDetailModalOpen: boolean = false;
  isEditMode: boolean = false;
  currentMaintenanceTypeDTO: MaintenanceTypeDTO | null = null;
  totalItems = 0;
  totalPages = 0;


  ngOnInit() {
    this.loadMaintenanceType()
  }

  DeleteMaintenancetype(id: number) {
    if (confirm("Bạn có chắc xóa Loại bảo dưỡng này không?")) {
      this.l_service.DeleteMaintenancetype(id).subscribe((data: any) => {
        if (data.statusCode == 200) {
          this.toastr.success(data.message)
          this.loadMaintenanceType()
        }
        else if (data.statusCode == 400) {
          this.toastr.error(data.message)
        }
        else {
          console.log(data.message)
        }
      })
    }
  }

  // Form data
  Form = {
    nameType: '',
  };

  // Mở modal thêm mới
  openAddModal() {
    this.isEditMode = false;
    this.currentMaintenanceTypeDTO = null;
    this.resetForm();
    this.isAddModalOpen = true;
  }

  // Đóng modal thêm/sửa
  closeAddModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  // Điền dữ liệu vào form
  fillFormWithLocation(mtType :  MaintenanceTypeDTO ) {
    this.Form = {
      nameType: mtType.nameType,
    };
  }

  // Reset form
  resetForm() {
    this.Form = {
      nameType: '',
    };
  }

  // Lưu khách hàng (bạn tự implement logic)
  save() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode && this.currentMaintenanceTypeDTO) {
    } else {
      this.l_service.CreateMaintenanceType(this.Form.nameType).subscribe((data: any) => {
        if (data.statusCode == 200) {
          this.toastr.success(data.message)
          this.closeAddModal();
          this.loadMaintenanceType(); // Reload danh sách
        }
        else if (data.statusCode = 400) this.toastr.error(data.message)
        else console.log(data.message);
      })
    }
  }

  // Validate form đơn giản
  validateForm(): boolean {
    if (!this.Form.nameType.trim()) {
      this.toastr.error('Vui lòng nhập tên loại bảo dưỡng');
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
      }
    }
  }

  // Get modal title
  get modalTitle(): string {
    return this.isEditMode ? 'Chỉnh sửa Loại bảo dưỡng' : 'Thêm Loại bảo dưỡng mới';
  }


  loadMaintenanceType() {
    this.l_service.listMaintenanceType(this.order, this.sortBy, this.pageSize, this.pageNumber, this.keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        console.log(data);
        this.listMaintenanceTypeDTO = data.data
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
      else {
        console.log(data.message)
      }
    })
  }


  showEntries(event: any) {
    this.pageSize = event.target.value
    this.loadMaintenanceType()
  }

  changePage(page: number) {
    if (this.pageNumber != page) {
      this.pageNumber = page
      this.loadMaintenanceType()
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
    this.loadMaintenanceType()
  }


  private searchTimeout: any;
  searchObject(event: any) {
    this.keySearch = event.target.value
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadMaintenanceType()
    }, 700);
  }


}
