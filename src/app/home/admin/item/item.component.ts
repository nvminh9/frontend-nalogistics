import { Component } from '@angular/core';
import { ItemService } from '../../../../services/item-service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


export interface itemDTO{
  itemID:number ,
  itemName : string ,
  fixedPrice : number ,
  displayOrder : number ,
  isActive : boolean
}



@Component({
  selector: 'app-item',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone : true ,
  templateUrl: './item.component.html',
  styleUrl: './item.component.css'
})
export class ItemComponent {

  constructor(
    private i_service  :  ItemService,
    private toastr     :  ToastrService
  ){}



      token:string = localStorage.getItem("token") || ''
      order:string = ''
      sortBy:string = ''
      pageSize:number = 12
      pageNumber:number = 1
      keySearch:string = ''
      listItem : itemDTO[] = [] 
    
    
      // Modal states
      isAddModalOpen: boolean = false;
      isDetailModalOpen: boolean = false;
      isEditMode: boolean = false;
      currentItem: itemDTO | null = null;
    
      ngOnInit(){
        this.i_service.listItem( this.order , this.sortBy , this.pageSize, this.pageNumber , this.keySearch ).subscribe((data:any)=>{
          if (data.statusCode == 200) {
            this.listItem = data.data
          }
          else if (data.statusCode == 400){
            this.toastr.error(data.message)
          }
          else{
            console.log(data.message)
          }
        })
    
      }
    
      DetailItem(ItemID :number){
        this.i_service.DetailItem(ItemID).subscribe((data:any)=>{
          this.currentItem = data.data
        })
      }
    
      DeleteItem(ItemID :number){
        confirm("Bạn có chắc xóa người dùng này không?")
      }
    
      updateItemFromDetail(ItemID :number){
        if (this.currentItem?.isActive.toString() == "true") {
          this.currentItem.isActive = true
        }
        if (this.currentItem?.isActive.toString() == "false") {
          this.currentItem.isActive = false
        }
        const itemDTO = {
          itemName : this.currentItem?.itemName ,
          fixedPrice : this.currentItem?.fixedPrice ,
          displayOrder : this.currentItem?.displayOrder ,
          isActive : this.currentItem?.isActive
        }
        this.i_service.UpdateItem(ItemID , itemDTO).subscribe( (data:any) =>{
          if (data.statusCode == 200) {
            this.toastr.success(data.message)
            this.loadItems();
            this.closeDetailModal();
          }
          else if(data.statusCode == 400 ) this.toastr.error(data.message) 
          else console.log(data);  
        })
      }
    
      // Form data
      itemForm = {
        itemName : '' ,
        fixedPrice : 0 ,
        displayOrder : 0 ,
      };
    
      // UserID and RoleID send at Frontend but not show in template
    
      // ==============================================
      // MODAL METHODS
      // ==============================================
    
      // Mở modal thêm mới
      openAddModal() {
        this.isEditMode = false;
        this.currentItem = null;
        this.resetForm();
        this.isAddModalOpen = true;
      }
    
      // Đóng modal thêm/sửa
      closeAddModal() {
        this.isAddModalOpen = false;
        this.resetForm();
      }
    
      // Mở modal chi tiết
      openDetailModal(itemID: number) {
        this.isDetailModalOpen = true;
        this.DetailItem(itemID);
      }
      // Đóng modal chi tiết
      closeDetailModal() {
        this.isDetailModalOpen = false;
        this.currentItem = null;
      }
    
      editFromDetail() {
        if (!this.currentItem) return;
        this.closeDetailModal();
        // Delay để animation mượt mà
        setTimeout(() => {
          this.isEditMode = true;
          this.fillFormWithItem(this.currentItem!);
          this.isAddModalOpen = true;
        }, 300);
      }
    
      // Điền dữ liệu vào form
      fillFormWithItem(item: itemDTO) {
        this.itemForm = {
          itemName : item.itemName ,
          fixedPrice : item.fixedPrice ,
          displayOrder : item.displayOrder ,
        };
      }
    
      // Reset form
      resetForm() {
        this.itemForm = {
          itemName : '' ,
          fixedPrice : 0 ,
          displayOrder : 0 ,
        };
      }
    
      // Lưu tài xế (bạn tự implement logic)
      saveItem() {
        // Validate form
        if (!this.validateForm()) {
          return;
        }
        if (this.isEditMode && this.currentItem) {
          // Logic cập nhật khách hàng
          console.log('Updating Item:', this.itemForm); 
          this.toastr.success('Cập nhật Hàng hóa thành công!');
        } else {
          let itemDTO  = {
            ItemName : this.itemForm.itemName ,
            FixedPrice : this.itemForm.fixedPrice ,
            DisplayOrder : this.itemForm.displayOrder ,
          }
          this.i_service.CreateItem(itemDTO).subscribe( (data:any)=>{
            if (data.statusCode == 200) { 
              this.toastr.success(data.message)
              this.closeAddModal();
              this.loadItems(); // Reload danh sách
            }
            else if(data.statusCode = 400) this.toastr.error(data.message)
            else console.log(data.message);
          })
        }
      }
    
      // Validate form đơn giản
      validateForm(): boolean {
        if (!this.itemForm.itemName.trim()) {
          this.toastr.error('Vui lòng nhập tên Hàng hóa');
          return false;
        }
          // Validate số nguyên
        if (!this.itemForm.displayOrder || !Number.isInteger(this.itemForm.displayOrder) || this.itemForm.displayOrder <= 0) {
          this.toastr.error('Vui lòng nhập số lượng hợp lệ');
          return false;
        }
        if (!this.itemForm.fixedPrice || !Number.isInteger(this.itemForm.fixedPrice) || this.itemForm.fixedPrice <= 0) {
          this.toastr.error('Vui lòng nhập số lượng hợp lệ');
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
        return this.isEditMode ? 'Chỉnh sửa hàng hóa' : 'Thêm hàng hóa mới';
      }
    
    
      loadItems() {
        this.ngOnInit(); // Hoặc gọi lại method load data
      }
    
    
      showEntries(event:any){
        this.pageSize = event.target.value
        this.loadItems()
      }
  
      changePage(page : number){
        if (this.pageNumber != page) {
          this.pageNumber = page
          this.loadItems()
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
        this.loadItems()
      }
    
    
      private searchTimeout: any;
      searchItem(event:any){
        this.keySearch = event.target.value
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
          this.loadItems()
        }, 500);
      }
  




    

}
