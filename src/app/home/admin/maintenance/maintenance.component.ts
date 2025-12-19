import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaintenanceService } from '../../../../services/maintenance-service';
import { TruckService } from '../../../../services/truck-service';
import { StringDateFormatPipePipe } from '../../../string-date-format-pipe-pipe';

export interface maintenanceDTO {
  maintenanceID: number,
  truckID: number,
  truckNo: number,
  maintenanceTypeID: number,
  maintenanceTypeName?: string,
  userID: number,
  userName: string,
  cost: number,
  implementedBy: string,
  scheduledDate: string,
  description: string,
  createdDate: Date
}


@Component({
  selector: 'app-maintenance.component',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, StringDateFormatPipePipe],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.css'
})

export class MaintenanceComponent {
  constructor(
    private l_service: MaintenanceService,
    private t_service: TruckService,
    private toastr: ToastrService
  ) { }

  roleName = localStorage.getItem("roleName")
  token: string = localStorage.getItem("token") || ''
  order: string = 'asc'
  sortBy: string = 'id'
  pageSize: number = 30
  pageNumber: number = 1
  keySearch: string = ''
  fromDateStr: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  // Ngày cuối tháng hiện tại  
  toDateStr: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 2);
  keySearchForTruck: string = ""
  lengthItem = 0
  listmaintenance: maintenanceDTO[] = []
  listMaintenanceTypeDTO: any[] = []
  listTruckDTO: any[] = []
  
  // Modal states
  isAddModalOpen: boolean = false;
  isDetailModalOpen: boolean = false;
  isEditMode: boolean = false;
  currentMaintenance: maintenanceDTO | null = null;
  totalItems = 0;
  totalPages = 0;

  // Dropdown states
  showTruckDropdown = false;
  showMaintenanceTypeDropdown = false;
  showTruckDropdownDetail = false;
  showMaintenanceTypeDropdownDetail = false;

  // Search terms
  truckSearchTerm = '';
  maintenanceTypeSearchTerm = '';
  truckSearchTermDetail = '';
  maintenanceTypeSearchTermDetail = '';

  // Filtered lists
  filteredTrucks: any[] = [];
  filteredMaintenanceTypes: any[] = [];
  filteredTrucksDetail: any[] = [];
  filteredMaintenanceTypesDetail: any[] = [];

  // Form data
  MaintenanceForm = {
    TruckID: 0,
    MaintenanceTypeID: 0,
    Cost: 0,
    ImplementedBy: '',
    Description: '',
    ScheduledDate: new Date().toISOString().substring(0, 10)
  };


  ngOnInit() {
    this.loadMaintenances()
    this.loadTrucks()
    this.getListMaintenanceType()
  }

  loadTrucks() {
    this.t_service.listTruck(this.token, "desc", "id", 30, 1, this.keySearchForTruck).subscribe((data: any) => {
      this.listTruckDTO = data.data
      this.filteredTrucks = [...this.listTruckDTO];
      this.filteredTrucksDetail = [...this.listTruckDTO];
    })
  }

  getListMaintenanceType() {
    this.l_service.listMaintenanceType("", "", 40, 1, "").subscribe((data: any) => {
      this.listMaintenanceTypeDTO = data.data
      this.filteredMaintenanceTypes = [...this.listMaintenanceTypeDTO];
      this.filteredMaintenanceTypesDetail = [...this.listMaintenanceTypeDTO];
    })
  }

  DetailMaintenance(maintenanceID: number) { 
    // muốn bind ra được input type Date thì cần 1 chuỗi ISO String ngắn với format là "YYYY-MM-DD"
    this.l_service.DetailMaintenance(maintenanceID).subscribe((data: any) => {
      // console.log(data);
      data.data.scheduledDate = data.data.scheduledDate.substring(0, 10)
      this.currentMaintenance = data.data
    })
  }

  Delete(maintenanceID: number) {
    confirm("Bạn có chắc xóa địa chỉ này không?")
  }

  updateMaintenance(maintenanceID: number) {
    const maintenanceDTO = {
      TruckID: this.currentMaintenance?.truckID,
      MaintenanceTypeID: this.currentMaintenance?.maintenanceTypeID,
      Cost: this.currentMaintenance?.cost,
      ImplementedBy: this.currentMaintenance?.implementedBy,
      Description: this.currentMaintenance?.description,
      ScheduledDate: this.currentMaintenance?.scheduledDate
    }
    this.l_service.UpdateMaintenance(maintenanceID, maintenanceDTO).subscribe((data: any) => {
      this.toastr.success(data.message)
      this.loadMaintenances();
      this.closeDetailModal();
    })
  }

  // ==============================================
  // DROPDOWN METHODS
  // ==============================================

  // Toggle dropdown
  toggleDropdown(type: string) {
    switch (type) {
      case 'truck':
        this.showTruckDropdown = !this.showTruckDropdown;
        if (this.showTruckDropdown) {
          this.showMaintenanceTypeDropdown = false;
        }
        break;
      case 'maintenanceType':
        this.showMaintenanceTypeDropdown = !this.showMaintenanceTypeDropdown;
        if (this.showMaintenanceTypeDropdown) {
          this.showTruckDropdown = false;
        }
        break;
      case 'truckDetail':
        this.showTruckDropdownDetail = !this.showTruckDropdownDetail;
        if (this.showTruckDropdownDetail) {
          this.showMaintenanceTypeDropdownDetail = false;
        }
        break;
      case 'maintenanceTypeDetail':
        this.showMaintenanceTypeDropdownDetail = !this.showMaintenanceTypeDropdownDetail;
        if (this.showMaintenanceTypeDropdownDetail) {
          this.showTruckDropdownDetail = false;
        }
        break;
    }
  }

  // Filter functions
  filterTrucks() {
    const searchTerm = this.truckSearchTerm.toLowerCase();
    this.filteredTrucks = this.listTruckDTO.filter((truck: any) =>
      truck.truckNo.toLowerCase().includes(searchTerm)
    );
  }

  filterMaintenanceTypes() {
    const searchTerm = this.maintenanceTypeSearchTerm.toLowerCase();
    this.filteredMaintenanceTypes = this.listMaintenanceTypeDTO.filter((type: any) =>
      type.nameType.toLowerCase().includes(searchTerm)
    );
  }

  filterTrucksDetail() {
    const searchTerm = this.truckSearchTermDetail.toLowerCase();
    this.filteredTrucksDetail = this.listTruckDTO.filter((truck: any) =>
      truck.truckNo.toLowerCase().includes(searchTerm)
    );
  }

  filterMaintenanceTypesDetail() {
    const searchTerm = this.maintenanceTypeSearchTermDetail.toLowerCase();
    this.filteredMaintenanceTypesDetail = this.listMaintenanceTypeDTO.filter((type: any) =>
      type.nameType.toLowerCase().includes(searchTerm)
    );
  }

  // Select functions
  selectTruck(truck: any) {
    this.MaintenanceForm.TruckID = truck.truckID;
    this.showTruckDropdown = false;
    this.truckSearchTerm = '';
    this.filteredTrucks = [...this.listTruckDTO];
  }

  selectMaintenanceType(type: any) {
    this.MaintenanceForm.MaintenanceTypeID = type.maintenanceTypeID;
    this.showMaintenanceTypeDropdown = false;
    this.maintenanceTypeSearchTerm = '';
    this.filteredMaintenanceTypes = [...this.listMaintenanceTypeDTO];
  }

  selectTruckDetail(truck: any) {
    if (this.currentMaintenance) {
      this.currentMaintenance.truckID = truck.truckID;
    }
    this.showTruckDropdownDetail = false;
    this.truckSearchTermDetail = '';
    this.filteredTrucksDetail = [...this.listTruckDTO];
  }

  selectMaintenanceTypeDetail(type: any) {
    if (this.currentMaintenance) {
      this.currentMaintenance.maintenanceTypeID = type.maintenanceTypeID;
    }
    this.showMaintenanceTypeDropdownDetail = false;
    this.maintenanceTypeSearchTermDetail = '';
    this.filteredMaintenanceTypesDetail = [...this.listMaintenanceTypeDTO];
  }

  // Get selected values
  getSelectedTruckNo(): string {
    const truck = this.listTruckDTO.find((t: any) => t.truckID === this.MaintenanceForm.TruckID);
    return truck ? truck.truckNo : '';
  }

  getSelectedMaintenanceTypeName(): string {
    const type = this.listMaintenanceTypeDTO.find((t: any) => t.maintenanceTypeID === this.MaintenanceForm.MaintenanceTypeID);
    return type ? type.nameType : '';
  }

  getSelectedTruckNoDetail(): string {
    if (!this.currentMaintenance) return '';
    const truck = this.listTruckDTO.find((t: any) => t.truckID === this.currentMaintenance?.truckID);
    return truck ? truck.truckNo : '';
  }

  getSelectedMaintenanceTypeNameDetail(): string {
    if (!this.currentMaintenance) return '';
    const type = this.listMaintenanceTypeDTO.find((t: any) => t.maintenanceTypeID === this.currentMaintenance?.maintenanceTypeID);
    return type ? type.nameType : '';
  }

  closeAllDropdowns() {
    this.showTruckDropdown = false;
    this.showMaintenanceTypeDropdown = false;
    this.showTruckDropdownDetail = false;
    this.showMaintenanceTypeDropdownDetail = false;
  }

  // ==============================================
  // MODAL METHODS
  // ==============================================

  // Mở modal thêm mới
  openAddModal() {
    this.isEditMode = false;
    this.currentMaintenance = null;
    this.resetForm();
    this.isAddModalOpen = true;
    this.closeAllDropdowns();
  }

  // Đóng modal thêm/sửa
  closeAddModal() {
    this.isAddModalOpen = false;
    this.resetForm();
    this.closeAllDropdowns();
  }

  // Mở modal chi tiết
  openDetailModal(maintenanceID: number) {
    this.isDetailModalOpen = true;
    this.DetailMaintenance(maintenanceID);
    this.closeAllDropdowns();
  }

  // Đóng modal chi tiết
  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.currentMaintenance = null;
    this.closeAllDropdowns();
  }

  editFromDetail() {
    if (!this.currentMaintenance) return;
    this.closeDetailModal();
    // Delay để animation mượt mà
    setTimeout(() => {
      this.isEditMode = true;
      this.fillFormWithLocation(this.currentMaintenance!);
      this.isAddModalOpen = true;
    }, 300);
  }

  // Điền dữ liệu vào form
  fillFormWithLocation(mtDTO: maintenanceDTO) {
    this.MaintenanceForm = {
      TruckID: mtDTO.truckID,
      MaintenanceTypeID: mtDTO.maintenanceTypeID,
      Cost: mtDTO.cost,
      ImplementedBy: mtDTO.implementedBy,
      Description: mtDTO.description,
      ScheduledDate: mtDTO.scheduledDate.substring(0, 10)
    };
  }

  // Reset form
  resetForm() {
    this.MaintenanceForm = {
      TruckID: 0,
      MaintenanceTypeID: 0,
      Cost: 0,
      ImplementedBy: '',
      Description: '',
      ScheduledDate: new Date().toISOString().substring(0, 10)
    };
  }

  // Lưu bảo dưỡng
  save() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode && this.currentMaintenance) {
      // this.toastr.success('Cập nhật vị trí thành công!');
    } else {
      let maintenanceDTO = {
        truckID: this.MaintenanceForm.TruckID,
        maintenanceTypeID: this.MaintenanceForm.MaintenanceTypeID,
        cost: this.MaintenanceForm.Cost,
        implementedBy: this.MaintenanceForm.ImplementedBy,
        description: this.MaintenanceForm.Description,
        scheduledDate: new Date(this.MaintenanceForm.ScheduledDate)
      }
      // console.log(maintenanceDTO);
      this.l_service.CreateMaintenance(maintenanceDTO).subscribe((data: any) => {
        if (data.statusCode == 200) {
          this.toastr.success(data.message)
          this.closeAddModal();
          this.loadMaintenances(); // Reload danh sách
        }
        else if (data.statusCode = 400) this.toastr.error(data.message)
        else console.log(data.message);
      })
    }
  }

  // Validate form đơn giản
  validateForm(): boolean {
    if (!this.MaintenanceForm.ImplementedBy.trim()) {
      this.toastr.error('Vui lòng nhập Người thực hiện đơn bảo dưỡng này');
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
    return this.isEditMode ? 'Chỉnh sửa bảo dưỡng' : 'Thêm bảo dưỡng mới';
  }

  // ==============================================
  // DATA LOADING METHODS
  // ==============================================

  loadMaintenances() {
    this.l_service.listMaintenance(this.order, this.sortBy, this.pageSize, this.pageNumber, this.keySearch, this.fromDateStr, this.toDateStr).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.fromDateStr = data.data.fromDate.substring(0, 10)
        this.toDateStr = data.data.toDate.substring(0, 10)
        this.listmaintenance = data.data.listMaintenance
        this.lengthItem = this.listmaintenance.length
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
    this.loadMaintenances()
  }

  changePage(page: number) {
    if (this.pageNumber != page) {
      this.pageNumber = page
      this.loadMaintenances()
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
    this.loadMaintenances()
  }

  private searchTimeout: any;
  searchObject(event: any) {
    this.keySearch = event.target.value
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadMaintenances()
    }, 700);
  }

  FilterDate() {
    // console.log(this.toDateStr);
    // console.log(this.fromDateStr);
    this.loadMaintenances()
  }

}