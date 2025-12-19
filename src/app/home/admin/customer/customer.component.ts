import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../../services/customer.service';
import { ToastrService } from 'ngx-toastr';

export interface Customer{
  userName: string,
  password : string ,
  fullName : string ,
  taxNo: string;
  contactName: any;
  customerID: number;
  customerCode: string;
  customerName: string;
  displayOrder : number,
  contactPhone :string,
  customerAddr : string,
  user : any
}

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})

export class CustomerComponent  {
  constructor(
    private c_service  :  CustomerService,
    private toastr     :  ToastrService

  ){}

  token:string = localStorage.getItem("token") || ''
  order:string = ''
  sortBy:string = ''
  pageSize:number = 12
  pageNumber:number = 1
  keySearch:string = ''
  listCustomer : Customer[] = [] 


  // Modal states
  isAddModalOpen: boolean = false;
  isDetailModalOpen: boolean = false;
  isEditMode: boolean = false;
  currentCustomer: Customer | null = null;

  ngOnInit(){
    this.loadCustomers()

  }

  DetailCustomer(customerID :number){
    this.c_service.DetailCustomer(customerID).subscribe((data:any)=>{
      this.currentCustomer = data.data
      console.log(data);
    })
  }

  DeleteCustomer(customerID :number){
    confirm("Bạn có chắc xóa người dùng này không?")
  }

  updateCustomerFromDetail(customerID :number){
    const customerDTO = {
      CustomerCode: this.currentCustomer?.customerCode,
      CustomerName: this.currentCustomer?.customerName,
      ContactPhone: this.currentCustomer?.contactPhone,
      CustomerAddr: this.currentCustomer?.customerAddr,
      TaxNo : this.currentCustomer?.taxNo,
      ContactName: this.currentCustomer?.contactName
    }
    this.c_service.UpdateCustomer(customerID , customerDTO).subscribe( (data:any) =>{
      this.toastr.success(data.message)
      this.loadCustomers();
      this.closeDetailModal();
    })
  }

  // Form data
  customerForm = {
    userName: '',
    password : '' ,
    fullName : '' ,
    customerCode: '',
    customerName: '',
    customerAddr: '',
    taxNo : '',
    contactPhone: '',
    contactName: ''
  };

  // UserID and RoleID send at Frontend but not show in template

  // ==============================================
  // MODAL METHODS
  // ==============================================

  // Mở modal thêm mới
  openAddModal() {
    this.isEditMode = false;
    this.currentCustomer = null;
    this.resetForm();
    this.isAddModalOpen = true;
  }

  // Đóng modal thêm/sửa
  closeAddModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  // Mở modal chi tiết
  openDetailModal(customerID: number) {
    this.isDetailModalOpen = true;
    this.DetailCustomer(customerID);
  }
  // Đóng modal chi tiết
  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.currentCustomer = null;
  }

  editFromDetail() {
    if (!this.currentCustomer) return;
    this.closeDetailModal();
    // Delay để animation mượt mà
    setTimeout(() => {
      this.isEditMode = true;
      this.fillFormWithCustomer(this.currentCustomer!);
      this.isAddModalOpen = true;
    }, 300);
  }

  // Điền dữ liệu vào form
  fillFormWithCustomer(customer: Customer) {
    this.customerForm = {
      userName: customer.userName,
      password : customer.password ,
      fullName : customer.fullName ,
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      contactPhone: customer.contactPhone,
      customerAddr: customer.customerAddr,
      taxNo : customer.taxNo,
      contactName: customer.contactName
    };
  }

  // Reset form
  resetForm() {
    this.customerForm = {
      userName: '',
      password : '' ,
      fullName : '' ,
      customerCode: '',
      customerName: '',
      contactPhone: '',
      customerAddr: '',
      taxNo : '',
      contactName: ''
    };
  }

  saveCustomer() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode && this.currentCustomer) {
      // Logic cập nhật khách hàng
      console.log('Updating customer:', this.customerForm); 
      this.toastr.success('Cập nhật khách hàng thành công!');
    } else {
      // Logic thêm mới khách hàng
      const userDTO = {
        UserName : this.customerForm.userName,
        Password : this.customerForm.password,
        FullName : this.customerForm.fullName,
        RoleID   : 4
      }
      this.c_service.CreateUser(userDTO).subscribe((dataOne:any)=> {
        if (dataOne.statusCode == 200) {
          const customerDTO = {
            CustomerCode: this.customerForm.customerCode,
            CustomerName: this.customerForm.customerName,
            ContactPhone: this.customerForm.contactPhone,
            CustomerAddr: this.customerForm.customerAddr,
            DisplayOrder: 1,
            TaxNo       : this.customerForm.taxNo,
            ContactName : this.customerForm.contactName,
            UserID      : dataOne.data
          }
          this.c_service.CreateCustomer(customerDTO).subscribe((data:any)=>{
            if (data.statusCode == 200) {
              this.toastr.success(data.message);
              this.closeAddModal();
              this.loadCustomers(); // Reload danh sách
            }else if (data.statusCode == 400){
              this.toastr.error(data.message);
            }
            else console.log(data.message);
          })
        }
        else if (dataOne.statusCode == 400) {
          this.toastr.error(dataOne.message)
        }
        else console.log(dataOne.message);
      })
    }
  }

  // Validate form đơn giản
  validateForm(): boolean {
    if (!this.customerForm.customerCode.trim()) {
      this.toastr.error('Vui lòng nhập mã khách hàng');
      return false;
    }
    if (!this.customerForm.customerName.trim()) {
      this.toastr.error('Vui lòng nhập tên khách hàng');
      return false;
    }
    if (!this.customerForm.contactPhone.trim()) {
      this.toastr.error('Vui lòng nhập số điện thoại');
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
    return this.isEditMode ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới';
  }


  loadCustomers() {
    this.c_service.listCustomer(this.token , this.order , this.sortBy , this.pageSize, this.pageNumber , this.keySearch ).subscribe((data:any)=>{
      if (data.statusCode == 200) {
        this.listCustomer = data.data
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
    this.loadCustomers()
  }

  changePage(page : number){
      if (this.pageNumber != page) {
        this.pageNumber = page
        this.loadCustomers()
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
    this.loadCustomers()
  }


  private searchTimeout: any;
  searchCustomer(event:any){
    this.keySearch = event.target.value
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadCustomers()
    }, 500);
  }


}
