import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TranscostService } from '../../../../services/transcost-service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../../../services/location-service';
import { NumberUtilService } from '../../../../services/number-util-service';

export interface Transcost {
  transcostID: number;
  fromLocationId: number;
  fromLocationName: string;
  fromWhereId: number;
  fromWhereName: string;
  toLocationId: number;
  toLocationName: string;
  createdBy: number;
  createdByName: string;
  createdDate: Date;
  cost: number;
}

export interface LocationDTO {
  locationId: number;
  locationName: string;
}

@Component({
  selector: 'app-transport-salary',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './transport-salary.component.html',
  styleUrl: './transport-salary.component.css'
})
export class TransportSalaryComponent implements OnInit, OnDestroy {
  constructor(
    private t_service: TranscostService,
    private toastr: ToastrService,
    private l_service: LocationService,
    private numberUtil_service : NumberUtilService
  ) {}

  // Basic properties
  token: string = localStorage.getItem("token") || '';
  FromLocationId: number = 0;
  FromWhereId: number = 0;
  ToLocationId: number = 0;
 fromDateStr: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

// Ngày cuối tháng hiện tại  
  toDateStr: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 2);
  pageSize: number = 12;
  pageNumber: number = 1;
  listTranscost: Transcost[] = [];
  
  // Location data for each dropdown type - tách riêng cho từng loại
  listFromLocationDTO: LocationDTO[] = [];
  listFromWhereDTO: LocationDTO[] = [];
  listToLocationDTO: LocationDTO[] = [];
  
  // Search keys for each dropdown type
  searchFromLocationKey: string = '';
  searchFromWhereKey: string = '';
  searchToLocationKey: string = '';

  // Modal states
  isAddModalOpen: boolean = false;
  isDetailModalOpen: boolean = false;
  isEditMode: boolean = false;
  currentTranscost: Transcost | null = null;

  // Dropdown states
  dropdownStates = {
    fromLocation: false,
    fromWhere: false,
    toLocation: false
  };

  // Filter dropdown states (separate from modal dropdowns)
  filterDropdownStates = {
    fromLocation: false,
    fromWhere: false,
    toLocation: false
  };

  // Filtered locations for each dropdown
  filteredLocations = {
    fromLocation: [] as LocationDTO[],
    fromWhere: [] as LocationDTO[],
    toLocation: [] as LocationDTO[]
  };

  // Filtered locations for filter dropdowns
  filteredFilterLocations = {
    fromLocation: [] as LocationDTO[],
    fromWhere: [] as LocationDTO[],
    toLocation: [] as LocationDTO[]
  };

  // Search terms for each dropdown
  searchTerms = {
    fromLocation: '',
    fromWhere: '',
    toLocation: ''
  };

  // Search terms for filter dropdowns
  filterSearchTerms = {
    fromLocation: '',
    fromWhere: '',
    toLocation: ''
  };

  // Form data
  TranscostForm = {
    FromLocationId: 0,
    FromWhereId: 0,
    ToLocationId: 0,
    cost: 0
  };

  // Debounce timers - tách riêng cho từng dropdown type
  private searchTimeouts = {
    fromLocation: null as any,
    fromWhere: null as any,
    toLocation: null as any
  };

  private filterSearchTimeouts = {
    fromLocation: null as any,
    fromWhere: null as any,
    toLocation: null as any
  };

  ngOnInit() {
    // Không load gì khi vào trang, chờ user search
  }

  // Handle filter changes
  onFilterChange() {
    this.pageNumber = 1; // Reset về trang 1 khi filter thay đổi
    this.loadTranscost();
  }

  // Handle manual search button click
  onSearch() {
    this.pageNumber = 1; // Reset về trang 1
    this.loadTranscost(); // Load với filters hiện tại
  }


  ngOnDestroy() {
    // Cleanup all timeouts khi component bị destroy
    Object.values(this.searchTimeouts).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    Object.values(this.filterSearchTimeouts).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
  }

  // Listen for clicks outside dropdown to close them
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.closeAllDropdowns();
      this.closeAllFilterDropdowns();
    }
  }

  // ==============================================
  // FILTER DROPDOWN METHODS (separate from modal dropdowns)
  // ==============================================

  openFilterDropdown(dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation') {
    this.closeAllFilterDropdowns();
    this.filterDropdownStates[dropdownType] = true;
    
    // Load locations cho dropdown type tương ứng
    this.loadLocationForType(dropdownType, 'filter');
  }

  toggleFilterDropdown(dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation') {
    if (this.filterDropdownStates[dropdownType]) {
      this.filterDropdownStates[dropdownType] = false;
    } else {
      this.openFilterDropdown(dropdownType);
    }
  }

  closeAllFilterDropdowns() {
    this.filterDropdownStates.fromLocation = false;
    this.filterDropdownStates.fromWhere = false;
    this.filterDropdownStates.toLocation = false;
  }

  onFilterSearchLocation(event: any, dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation') {
    const searchTerm = event.target.value.toLowerCase();
    this.filterSearchTerms[dropdownType] = searchTerm;
    
    // Filter local data ngay lập tức
    const sourceData = this.getSourceDataForDropdownType(dropdownType);
    this.filteredFilterLocations[dropdownType] = sourceData.filter(location =>
      location.locationName.toLowerCase().includes(searchTerm)
    );

    // Clear timeout cũ của dropdown type này
    if (this.filterSearchTimeouts[dropdownType]) {
      clearTimeout(this.filterSearchTimeouts[dropdownType]);
    }

    // Set timeout mới - sau 1 giây mới call API cho dropdown type này
    this.filterSearchTimeouts[dropdownType] = setTimeout(() => {
      this.setSearchKeyForDropdownType(dropdownType, searchTerm);
      this.loadLocationForType(dropdownType, 'filter'); // Call API sau 1 giây
      console.log(`Filter API called for ${dropdownType} with search term:`, searchTerm);
    }, 1000);
  }

  selectFilterLocation(location: LocationDTO, dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation') {
    switch (dropdownType) {
      case 'fromLocation':
        this.FromLocationId = location.locationId;
        this.filterSearchTerms.fromLocation = ''; // Clear search term
        break;
      case 'fromWhere':
        this.FromWhereId = location.locationId;
        this.filterSearchTerms.fromWhere = ''; // Clear search term
        break;
      case 'toLocation':
        this.ToLocationId = location.locationId;
        this.filterSearchTerms.toLocation = ''; // Clear search term
        break;
    }
    this.filterDropdownStates[dropdownType] = false;
    // Không auto trigger - chờ user click search
  }

  // ==============================================
  // MODAL DROPDOWN METHODS (existing ones)
  // ==============================================

  openDropdown(dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation') {
    this.closeAllDropdowns();
    this.dropdownStates[dropdownType] = true;
    
    // Load locations cho dropdown type tương ứng
    this.loadLocationForType(dropdownType, 'modal');
  }

  toggleDropdown(dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation') {
    if (this.dropdownStates[dropdownType]) {
      this.dropdownStates[dropdownType] = false;
    } else {
      this.openDropdown(dropdownType);
    }
  }

  closeAllDropdowns() {
    this.dropdownStates.fromLocation = false;
    this.dropdownStates.fromWhere = false;
    this.dropdownStates.toLocation = false;
  }

  onSearchLocation(event: any, dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation') {
    const searchTerm = event.target.value.toLowerCase();
    this.searchTerms[dropdownType] = searchTerm;
    
    // Filter local data ngay lập tức cho UX
    const sourceData = this.getSourceDataForDropdownType(dropdownType);
    this.filteredLocations[dropdownType] = sourceData.filter(location =>
      location.locationName.toLowerCase().includes(searchTerm)
    );

    // Clear timeout cũ của dropdown type này
    if (this.searchTimeouts[dropdownType]) {
      clearTimeout(this.searchTimeouts[dropdownType]);
    }

    // Set timeout mới - sau 1 giây mới call API cho dropdown type này
    this.searchTimeouts[dropdownType] = setTimeout(() => {
      this.setSearchKeyForDropdownType(dropdownType, searchTerm);
      this.loadLocationForType(dropdownType, 'modal'); // Call API sau 1 giây
      console.log(`API called for ${dropdownType} with search term:`, searchTerm);
    }, 1000);
  }

  selectLocation(location: LocationDTO, dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation') {
    switch (dropdownType) {
      case 'fromLocation':
        this.TranscostForm.FromLocationId = location.locationId;
        this.searchTerms.fromLocation = ''; // Clear search term
        break;
      case 'fromWhere':
        this.TranscostForm.FromWhereId = location.locationId;
        this.searchTerms.fromWhere = ''; // Clear search term
        break;
      case 'toLocation':
        this.TranscostForm.ToLocationId = location.locationId;
        this.searchTerms.toLocation = ''; // Clear search term
        break;
    }
    this.dropdownStates[dropdownType] = false;
  }

  getSelectedLocationName(locationId: number): string {
    // Tìm trong tất cả các list
    let location = this.listFromLocationDTO.find(l => l.locationId === locationId);
    if (location) return location.locationName;
    
    location = this.listFromWhereDTO.find(l => l.locationId === locationId);
    if (location) return location.locationName;
    
    location = this.listToLocationDTO.find(l => l.locationId === locationId);
    if (location) return location.locationName;
    
    return '';
  }

  // ==============================================
  // HELPER METHODS FOR DROPDOWN DATA MANAGEMENT
  // ==============================================

  private getSourceDataForDropdownType(dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation'): LocationDTO[] {
    switch (dropdownType) {
      case 'fromLocation':
        return this.listFromLocationDTO;
      case 'fromWhere':
        return this.listFromWhereDTO;
      case 'toLocation':
        return this.listToLocationDTO;
      default:
        return [];
    }
  }

  private setSearchKeyForDropdownType(dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation', searchTerm: string) {
    switch (dropdownType) {
      case 'fromLocation':
        this.searchFromLocationKey = searchTerm;
        break;
      case 'fromWhere':
        this.searchFromWhereKey = searchTerm;
        break;
      case 'toLocation':
        this.searchToLocationKey = searchTerm;
        break;
    }
  }

  private getSearchKeyForDropdownType(dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation'): string {
    switch (dropdownType) {
      case 'fromLocation':
        return this.searchFromLocationKey;
      case 'fromWhere':
        return this.searchFromWhereKey;
      case 'toLocation':
        return this.searchToLocationKey;
      default:
        return '';
    }
  }

  private updateFilteredLocationsForType(dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation', data: LocationDTO[], context: 'modal' | 'filter') {
    if (context === 'modal') {
      this.filteredLocations[dropdownType] = [...data];
    } else {
      this.filteredFilterLocations[dropdownType] = [...data];
    }
  }

  private updateSourceDataForDropdownType(dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation', data: LocationDTO[]) {
    switch (dropdownType) {
      case 'fromLocation':
        this.listFromLocationDTO = data;
        break;
      case 'fromWhere':
        this.listFromWhereDTO = data;
        break;
      case 'toLocation':
        this.listToLocationDTO = data;
        break;
    }
  }

  // ==============================================
  // MODAL METHODS
  // ==============================================

  openAddModal() {
    this.isEditMode = false;
    this.currentTranscost = null;
    this.resetForm();
    this.isAddModalOpen = true;
    this.closeAllDropdowns();
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.resetForm();
    this.closeAllDropdowns();
  }

  openDetailModal(transcostID: number) {
    this.isDetailModalOpen = true;
    // Implement detail loading if needed
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.currentTranscost = null;
  }

  editFromDetail() {
    if (!this.currentTranscost) return;
    this.closeDetailModal();
    setTimeout(() => {
      this.isEditMode = true;
      this.fillFormWithTranscost(this.currentTranscost!);
      this.isAddModalOpen = true;
    }, 300);
  }

  fillFormWithTranscost(transcost: Transcost) {
    this.TranscostForm = {
      FromLocationId: transcost.fromLocationId,
      FromWhereId: transcost.fromWhereId,
      ToLocationId: transcost.toLocationId,
      cost: transcost.cost,
    };
  }

  resetForm() {
    this.TranscostForm = {
      FromLocationId: 0,
      FromWhereId: 0,
      ToLocationId: 0,
      cost: 0
    };
    // Reset search terms
    this.searchTerms = {
      fromLocation: '',
      fromWhere: '',
      toLocation: ''
    };
  }

  saveTranscost() {
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode && this.currentTranscost) {
      // Logic cập nhật
      console.log('Updating Transcost:', this.TranscostForm);
      this.toastr.success('Cập nhật tiền lương vận chuyển thành công!');
    } else {
      // Logic tạo mới
      const transcostDTO = {
        FromLocationId: this.TranscostForm.FromLocationId,
        FromWhereId: this.TranscostForm.FromWhereId,
        ToLocationId: this.TranscostForm.ToLocationId,
        cost: this.TranscostForm.cost
      };

      this.t_service.CreateTranscost(transcostDTO).subscribe((data: any) => {
        if (data.statusCode == 200) {
          this.toastr.success(data.message);
          this.closeAddModal();
          this.loadTranscost();
        } else if (data.statusCode == 400) {
          this.toastr.error(data.message);
        } else {
          console.log(data.message);
        }
      });
    }
  }

  validateForm(): boolean {
    if (this.TranscostForm.FromLocationId === 0) {
      this.toastr.error('Vui lòng chọn cảng nhận Cont');
      return false;
    }
    if (this.TranscostForm.FromWhereId === 0) {
      this.toastr.error('Vui lòng chọn kho nhận/giao hàng');
      return false;
    }
    if (this.TranscostForm.ToLocationId === 0) {
      this.toastr.error('Vui lòng chọn cảng hạ/trả Cont');
      return false;
    }
    if (this.TranscostForm.cost <= 0) {
      this.toastr.error('Vui lòng nhập tiền lương hợp lệ');
      return false;
    }
    return true;
  }

  onOverlayClick(event: MouseEvent, modalType: 'add' | 'detail') {
    if (event.target === event.currentTarget) {
      if (modalType === 'add') {
        this.closeAddModal();
      } else {
        this.closeDetailModal();
      }
    }
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Chỉnh sửa Tiền lương vận chuyển' : 'Thêm Tiền lương vận chuyển mới';
  }

  // ==============================================
  // DATA LOADING METHODS
  // ==============================================

  loadTranscost() {
    this.t_service.GetListTranscost(
      this.FromLocationId, 
      this.FromWhereId, 
      this.ToLocationId, 
      this.fromDateStr, 
      this.toDateStr, 
      this.pageSize, 
      this.pageNumber
    ).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listTranscost = data.data.listTrans;
        // console.log(data);
        
        this.fromDateStr = data.data.fromDateStr
        this.toDateStr = data.data.toDateStr
      } else if (data.statusCode == 400) {
        this.toastr.error(data.message);
      } else {
        console.log(data.message);
      }
    });
  }

  // Load location data cho từng dropdown type riêng biệt
  loadLocationForType(dropdownType: 'fromLocation' | 'fromWhere' | 'toLocation', context: 'modal' | 'filter') {
    const searchKey = this.getSearchKeyForDropdownType(dropdownType);
    
    this.l_service.listLocation(this.token, "id", "asc", 100, 1, searchKey)
      .subscribe((data: any) => {
        if (data.statusCode == 200) {
          const locationData = data.data.listLocation;
          
          // Update source data cho dropdown type này
          this.updateSourceDataForDropdownType(dropdownType, locationData);
          
          // Update filtered locations cho context tương ứng
          this.updateFilteredLocationsForType(dropdownType, locationData, context);
          
          console.log(`Locations loaded for ${dropdownType} (${context}):`, locationData);
        } else {
          console.log(`Error loading locations for ${dropdownType}:`, data.message);
        }
      });
  }

  // Legacy method for backward compatibility (có thể xóa nếu không dùng)
  loadLocation() {
    console.warn('loadLocation() is deprecated. Use loadLocationForType() instead.');
    // Load cho tất cả nếu cần
    this.loadLocationForType('fromLocation', 'modal');
    this.loadLocationForType('fromWhere', 'modal');
    this.loadLocationForType('toLocation', 'modal');
  }

  DeleteTranscost(transcostID: number) {
    if (confirm("Bạn có chắc xóa mục này không?")) {
      // Implement delete logic
      console.log('Delete transcost:', transcostID);
    }
  }



  onCostInput(event: any, trans: any): void {
    const inputValue = event.target.value;
    const parsedValue = this.numberUtil_service.parseCostFromInput(inputValue);
    trans.cost = parsedValue;
  }

  onCostBlur(event: any, trans: any): void {
    if (trans.cost && trans.cost > 0) {
      // Format lại với dấu phẩy
      event.target.value = trans.cost.toLocaleString('en-US');
    }
  }

  updateCost(transcostID: number, cost: number, i :number): void {
    if (!cost || cost <= 0) {
      this.toastr.error('Vui lòng nhập giá hợp lệ');
      return;
    }
    else{
      let trans = {
        Cost : cost,
        TranscostID : transcostID
      }
      this.t_service.UpdateTranscost(trans).subscribe((data:any)=>{
        if (data.statusCode == 200) {
          this.toastr.success(data.message)
          console.log(data);
          
          this.listTranscost[i].createdDate = data.data.updateAt
        } else if (data.statusCode == 400) {
          this.toastr.error(data.message);
        } else {
          console.log(data.message);
        }
        })
    }
  }

  showEntries(event: any) {
    this.pageSize = event.target.value;
    this.loadTranscost();
  }

  changePage(page: number) {
    if (this.pageNumber != page) {
      this.pageNumber = page;
      this.loadTranscost();
    } else {
      this.toastr.error("Đang ở trang hiện tại");
    }
  }
}