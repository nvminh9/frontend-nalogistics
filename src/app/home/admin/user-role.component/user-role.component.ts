import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../services/user-service';

export interface User{
  userID : number
  userName: string,
  password : string ,
  fullName : string ,
  roleID : number,
  isActive :boolean 
}


@Component({
  selector: 'app-user-role.component',
  standalone : true,
  imports: [FormsModule, ReactiveFormsModule,CommonModule],
  templateUrl: './user-role.component.html',
  styleUrl: './user-role.component.css'
})
export class UserRoleComponent {


  constructor(
    private u_service: UserService,
    private toastr: ToastrService

  ) { }

  token: string = localStorage.getItem("token") || ''
  order: string = ''
  sortBy: string = ''
  pageSize: number = 30
  pageNumber: number = 1
  keySearch: string = ''
  listUser: User[] = []
  RoleIDSearch : number = 0 

  PasswordFirst :string = ''
  PasswordSecond :string = ''
  PasswordCheck :Boolean = false

  // Modal states
  isAddModalOpen: boolean = false;
  isDetailModalOpen: boolean = false;
  isEditMode: boolean = false;
  currentUser: User | null = null;
  listRole : any

  ngOnInit() {
    this.loadUsers()
    this.getListRole()
  }

  DetailUser(userID: number) {
    this.u_service.DetailUser(userID).subscribe((data: any) => {
      // console.log(data);
      this.currentUser = data.data.detailUser
      this.PasswordFirst =  data.data.detailUser.password
      this.PasswordSecond =  data.data.detailUser.password
      this.PasswordCheck = false
      // console.log(this.PasswordFirst);
      // console.log(this.PasswordSecond);
    })
  }

  getListRole(){
    this.u_service.ListRole().subscribe( (data:any)=>{
      // console.log(data);
      
      data.data = data.data.filter( (r :any) => r.roleName != "Driver" && r.roleName != "Customer")
        this.listRole = data.data
    })
  }

  DeleteUser(userID: number) {
    confirm("Bạn có chắc xóa người dùng này không?")
  }

  updateUserFromDetail(userID: number) {
    this.PasswordSecond = this.currentUser?.password || ""
    if (this.PasswordFirst != this.PasswordSecond) {
      this.PasswordCheck = true
    }
    const userDTO = {
      fullName: this.currentUser?.fullName,
      password: this.currentUser?.password,
      roleID: this.currentUser?.roleID,
      changePassBool : this.PasswordCheck
    }    
    // console.log(this.PasswordFirst);
    // console.log(this.PasswordSecond);    
    // console.log(userDTO.changePassBool);
    // return
    this.u_service.UpdateUserByAdmin(userDTO, userID).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.toastr.success(data.message)
        this.loadUsers();
        this.closeDetailModal();
      }
      else if(data.statusCode == 400) this.toastr.error(data.message)
      else console.log(data.message);
    })
  }

  // Form data
  userForm = {
    userName: '',
    password: '',
    fullName: '',
    roleID : 0
  };

  // UserID and RoleID send at Frontend but not show in template

  // ==============================================
  // MODAL METHODS
  // ==============================================

  // Mở modal thêm mới
  openAddModal() {
    this.isEditMode = false;
    this.currentUser = null;
    this.resetForm();
    this.isAddModalOpen = true;
  }

  // Đóng modal thêm/sửa
  closeAddModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  // Mở modal chi tiết
  openDetailModal(userID: number) {
    this.isDetailModalOpen = true;
    this.DetailUser(userID);
  }
  // Đóng modal chi tiết
  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.currentUser = null;
  }

  editFromDetail() {
    if (!this.currentUser) return;
    this.closeDetailModal();
    // Delay để animation mượt mà
    setTimeout(() => {
      this.isEditMode = true;
      this.fillFormWithUser(this.currentUser!);
      this.isAddModalOpen = true;
    }, 300);
  }

  // Điền dữ liệu vào form
  fillFormWithUser(user : User) {
    this.userForm = {
      userName: user.userName,
      password: user.password,
      fullName: user.fullName,
      roleID : user.roleID
    };
  }

  // Reset form
  resetForm() {
    this.userForm = {
      userName: '',
      password: '',
      fullName: '',
      roleID : 0
    };
  }

  saveUser() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    if (this.isEditMode && this.currentUser) {
      // Logic cập nhật khách hàng
      this.toastr.success('Cập nhật khách hàng thành công!');
    } else {
      const userDTO = {
        UserName: this.userForm.userName,
        Password: this.userForm.password,
        FullName: this.userForm.fullName,
        RoleID: this.userForm.roleID
      }
      this.u_service.CreateUserRole(userDTO).subscribe((data: any) => {
        if (data.statusCode == 200) {
          this.toastr.success(data.message)
          this.closeAddModal()
          this.loadUsers()
        }
        else if (data.statusCode == 400) this.toastr.error(data.message)
        else console.log(data.message);
      })
    }
  }

  // Validate form đơn giản
  validateForm(): boolean {
    if (!this.userForm.fullName.trim()) {
      this.toastr.error('Vui lòng nhập tên đầy đủ người dùng ');
      return false;
    }
    if (!this.userForm.userName.trim()) {
      this.toastr.error('Vui lòng nhập tên đăng nhập');
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
    return this.isEditMode ? 'Chỉnh sửa Người dùng' : 'Thêm người dùng mới';
  }


  loadUsers() {
    this.u_service.GetListUser(this.order, this.sortBy, this.pageSize,this.keySearch, this.pageNumber, this.RoleIDSearch ).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listUser = data.data
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
      else {
        console.log(data.message)
      }
    })
  }

  filterRole(event: any) {
    this.RoleIDSearch = event.target.value
    this.loadUsers()
  }


  showEntries(event: any) {
    this.pageSize = event.target.value
    this.loadUsers()
  }

  changePage(page: number) {
    if (this.pageNumber != page) {
      this.pageNumber = page
      this.loadUsers()
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
    this.loadUsers()
  }


  private searchTimeout: any;
  searchUser(event: any) {
    this.keySearch = event.target.value
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
    this.loadUsers()
    }, 500);
  }

}
