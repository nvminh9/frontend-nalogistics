import { Component } from '@angular/core';
import { LocationService } from '../../../../services/location-service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { log } from 'node:console';

export interface locationDTO {
  locationId:number,
  locationName:string,
  isActive:boolean
}

@Component({
  selector: 'app-location',
  imports: [FormsModule, ReactiveFormsModule,CommonModule],
  standalone : true,
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})
export class LocationComponent {

    constructor(
      private l_service  :  LocationService,
      private toastr     :  ToastrService
    ){}
  
    token:string = localStorage.getItem("token") || ''
    order:string = ''
    sortBy:string = ''
    pageSize:number = 12
    pageNumber:number = 1
    keySearch:string = ''
    listLocation : locationDTO[] = [] 
  
    // Modal states
    isAddModalOpen: boolean = false;
    isDetailModalOpen: boolean = false;
    isEditMode: boolean = false;
    currentLocation: locationDTO | null = null;
    totalItems = 0;
    totalPages = 0;
  

    ngOnInit(){
      this.l_service.listLocation(this.token , this.order , this.sortBy , this.pageSize, this.pageNumber , this.keySearch ).subscribe((data:any)=>{
        if (data.statusCode == 200) {
          this.listLocation = data.data.listLocation
          this.totalPages = data.data.totalPages
          this.totalItems = data.data.totalItems
        }
        else if (data.statusCode == 400){
          this.toastr.error(data.message)
        }
        else{
          console.log(data.message)
        }
      })

    }

    DetailLocation(locationID :number){
      this.l_service.DetailLocation(locationID).subscribe((data:any)=>{
        this.currentLocation = data.data
        console.log(data.data);
        
      })
    }
    
    DeleteLocation(locationID :number){
      confirm("Bạn có chắc xóa địa chỉ này không?")
    }
  
    updateLocationFromDetail(locationID :number){
      const locationDTO = {
        LocationName: this.currentLocation?.locationName,
        IsActive: this.currentLocation?.isActive,
      }
      if (this.currentLocation?.isActive.toString() == 'false') {
        locationDTO.IsActive = false
      }
      if (this.currentLocation?.isActive.toString() == 'true') {
        locationDTO.IsActive = true
      }
      this.l_service.UpdateLocation(locationID , locationDTO).subscribe( (data:any) =>{
        this.toastr.success(data.message)
        this.loadLocations();
        this.closeDetailModal();
      })
    }
  
    // Form data
    locationForm = {
      locationName:'',
    };
  
    // UserID and RoleID send at Frontend but not show in template
  
    // ==============================================
    // MODAL METHODS
    // ==============================================
  
    // Mở modal thêm mới
    openAddModal() {
      this.isEditMode = false;
      this.currentLocation = null;
      this.resetForm();
      this.isAddModalOpen = true;
    }
  
    // Đóng modal thêm/sửa
    closeAddModal() {
      this.isAddModalOpen = false;
      this.resetForm();
    }
  
    // Mở modal chi tiết
    openDetailModal(locationID: number) {
      this.isDetailModalOpen = true;
      this.DetailLocation(locationID);
    }
    // Đóng modal chi tiết
    closeDetailModal() {
      this.isDetailModalOpen = false;
      this.currentLocation = null;
    }
  
    editFromDetail() {
      if (!this.currentLocation) return;
      this.closeDetailModal();
      // Delay để animation mượt mà
      setTimeout(() => {
        this.isEditMode = true;
        this.fillFormWithLocation(this.currentLocation!);
        this.isAddModalOpen = true;
      }, 300);
    }
  
    // Điền dữ liệu vào form
    fillFormWithLocation(location: locationDTO) {
      this.locationForm = {
        locationName: location.locationName,
      };
    }
  
    // Reset form
    resetForm() {
      this.locationForm = {
        locationName:'',
      };
    }
  
    // Lưu khách hàng (bạn tự implement logic)
      saveLocation() {
      // Validate form
      if (!this.validateForm()) {
        return;
      }
  
      if (this.isEditMode && this.currentLocation) {
        console.log('Updating Location:', this.locationForm); 
        this.toastr.success('Cập nhật vị trí thành công!');
      } else {
        let locationDTO  = {
          LocationName: this.locationForm.locationName,
        }
        this.l_service.CreateLocation(locationDTO).subscribe( (data:any)=>{
          if (data.statusCode == 200) { 
            this.toastr.success(data.message)
            this.closeAddModal();
            this.loadLocations(); // Reload danh sách
          }
          else if(data.statusCode = 400) this.toastr.error(data.message)
          else console.log(data.message);
        })
      }
    }
  
    // Validate form đơn giản
    validateForm(): boolean {
      if (!this.locationForm.locationName.trim()) {
        this.toastr.error('Vui lòng nhập tên vị trí');
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
      return this.isEditMode ? 'Chỉnh sửa vị trí' : 'Thêm vị trí mới';
    }
  
  
    loadLocations() {
      this.ngOnInit(); // Hoặc gọi lại method load data
    }
  
  
    showEntries(event:any){
      this.pageSize = event.target.value
      this.loadLocations()
    }
  
    changePage(page : number){
        if (this.pageNumber != page) {
          this.pageNumber = page
          this.loadLocations()
        }
        else this.toastr.error("Đang ở trang hiện tại")
    }
  
    sortData(event:any){
      switch(event.target.value){
        case 'id-new' : 
          this.order = "desc", this.sortBy = "id"
          break;
        case 'name-az' : 
          this.order = "asc", this.sortBy = "name"
          break;
        case 'name-za' : 
          this.order = "desc", this.sortBy = "name"
          break;
        default : 
          this.order = "", this.sortBy = ""
          break;
      }
      this.loadLocations()
    }
  
  
    private searchTimeout: any;
    searchObject(event:any){
      this.keySearch = event.target.value
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        this.loadLocations()
      }, 700);
    }
  

}
