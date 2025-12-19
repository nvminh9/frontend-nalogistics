import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../../../services/driver-service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export interface Driver {
  userName: string,
  password : string,
  fullName : string ,
  driverID :number,
  driverName:string,
  address:string,
  phone:string,
  licenseNo:string,
  expireDate:string,
  status:string,
  isActive : boolean ,
  user:any
}

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.css'
})
export class DriverComponent {

    constructor(
      private d_service  :  DriverService,
      private toastr     :  ToastrService
    ){}
  
    token:string = localStorage.getItem("token") || ''
    order:string = ''
    sortBy:string = ''
    pageSize:number = 12
    pageNumber:number = 1
    keySearch:string = ''
    listDriver : Driver[] = [] 
  
  
    // Modal states
    isAddModalOpen: boolean = false;
    isDetailModalOpen: boolean = false;
    isEditMode: boolean = false;
    currentDriver: Driver | null = null;
  
    ngOnInit(){
      this.loadDrivers()
  
    }
  
    DetailDriver(DriverID :number){
      this.d_service.DetailDriver(DriverID).subscribe((data:any)=>{
        this.currentDriver = data.data
        if (this.currentDriver) {
          if (data.data.status == 0) {
          this.currentDriver.status = "Available"
          }
          else this.currentDriver.status = "Busy"
        }        
      })
    }
  
    DeleteDriver(DriverID :number){
      confirm("Bạn có chắc xóa người dùng này không?")
    }
  
    updateDriverFromDetail(DriverID :number){
      if (this.currentDriver?.isActive.toString() == "true") {
        this.currentDriver.isActive = true
      }
      if (this.currentDriver?.isActive.toString() == "false") {
        this.currentDriver.isActive = false
      }
      const driverDTO = {
        Password : this.currentDriver?.user.password,
        DriverName:this.currentDriver?.driverName,
        Address:this.currentDriver?.address,
        Phone:this.currentDriver?.phone,
        LicenseNo:this.currentDriver?.licenseNo,
        ExpireDate:this.currentDriver?.expireDate,
        IsActive:this.currentDriver?.isActive,
        Status: this.currentDriver?.status
      }
      // console.log(driverDTO);
      // return
      this.d_service.UpdateDriver(DriverID , driverDTO).subscribe( (data:any) =>{
        if (data.statusCode == 200) {
          this.toastr.success(data.message)
          this.loadDrivers();
          this.closeDetailModal();
        }
        else if(data.statusCode == 400) this.toastr.error(data.message)
        else console.log(data.message);
         
      })
    }
  
    // Form data
    driverForm = {
      userName: '',
      password : '' ,
      fullName : '' ,
      driverName:'',
      address:'',
      phone:'',
      licenseNo:'',
      expireDate:'',
    };
  
    // UserID and RoleID send at Frontend but not show in template
  
    // ==============================================
    // MODAL METHODS
    // ==============================================
  
    // Mở modal thêm mới
    openAddModal() {
      this.isEditMode = false;
      this.currentDriver = null;
      this.resetForm();
      this.isAddModalOpen = true;
    }
  
    // Đóng modal thêm/sửa
    closeAddModal() {
      this.isAddModalOpen = false;
      this.resetForm();
    }
  
    // Mở modal chi tiết
    openDetailModal(driverID: number) {
      this.isDetailModalOpen = true;
      this.DetailDriver(driverID);
    }
    // Đóng modal chi tiết
    closeDetailModal() {
      this.isDetailModalOpen = false;
      this.currentDriver = null;
    }
  
    editFromDetail() {
      if (!this.currentDriver) return;
      this.closeDetailModal();
      // Delay để animation mượt mà
      setTimeout(() => {
        this.isEditMode = true;
        this.fillFormWithDriver(this.currentDriver!);
        this.isAddModalOpen = true;
      }, 300);
    }
  
    // Điền dữ liệu vào form
    fillFormWithDriver(driver: Driver) {
      this.driverForm = {
        userName: driver.userName,
        password : driver.password ,
        fullName : driver.fullName ,
        driverName:driver.driverName,
        address:driver.address,
        phone:driver.phone,
        licenseNo:driver.licenseNo,
        expireDate:driver.expireDate,
      };
    }
  
    // Reset form
    resetForm() {
      this.driverForm = {
        userName: '',
        password : '' ,
        fullName : '' ,
        driverName:'',
        address:'',
        phone:'',
        licenseNo:'',
        expireDate:'',
      };
    }
  
    // Lưu tài xế (bạn tự implement logic)
    saveDriver() {
      // Validate form
      if (!this.validateForm()) {
        return;
      }
  
      if (this.isEditMode && this.currentDriver) {
        // Logic cập nhật khách hàng
        console.log('Updating Driver:', this.driverForm); 
        this.toastr.success('Cập nhật tài xế thành công!');
      } else {
        let driverDTO  = {
          UserName: this.driverForm.userName,
          Password : this.driverForm.password ,
          FullName : this.driverForm.fullName ,
          DriverName:this.driverForm.driverName,
          Address:this.driverForm.address,
          Phone:this.driverForm.phone,
          LicenseNo:this.driverForm.licenseNo,
          ExpireDate:this.driverForm.expireDate
        }
        this.d_service.CreateDriverAndUser(driverDTO).subscribe( (data:any)=>{
          if (data.statusCode == 200) { 
            this.toastr.success(data.message)
            this.closeAddModal();
            this.loadDrivers(); // Reload danh sách
          }
          else if(data.statusCode = 400) this.toastr.error(data.message)
          else console.log(data.message);
        })
      }
    }
  
    // Validate form đơn giản
    validateForm(): boolean {
      if (!this.driverForm.driverName.trim()) {
        this.toastr.error('Vui lòng nhập tên tài xế');
        return false;
      }
      if (!this.driverForm.expireDate.trim()) {
        this.toastr.error('Vui lòng nhập ngày hết hạn bằng lái');
        return false;
      }
      if (!this.driverForm.licenseNo.trim()) {
        this.toastr.error('Vui lòng nhập Mã bằng lái');
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
      return this.isEditMode ? 'Chỉnh sửa tài xế' : 'Thêm tài xế mới';
    }
  
  
    loadDrivers() {
      this.d_service.listDriver(this.token , this.order , this.sortBy , this.pageSize, this.pageNumber , this.keySearch ).subscribe((data:any)=>{
        if (data.statusCode == 200) {
          this.listDriver = data.data
          console.log(this.listDriver);
          
        }
        else if (data.statusCode == 400){
          this.toastr.error(data.message)
        }
        else{
          console.log(data.message)
        }
      })
    }
  
  
    showEntries(event:any){
      this.pageSize = event.target.value
      this.loadDrivers()
    }

    changePage(page : number){
      if (this.pageNumber != page) {
        this.pageNumber = page
        this.loadDrivers()
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
      this.loadDrivers()
    }
  
  
    private searchTimeout: any;
    searchDriver(event:any){
      this.keySearch = event.target.value
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        this.loadDrivers()
      }, 500);
    }
  
  
  


  

  

}
