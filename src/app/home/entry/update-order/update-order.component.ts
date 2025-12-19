// update-order.component.ts - Complete Component
import { Component } from '@angular/core';
import { OrderService } from '../../../../services/order-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NumberFormatPipe } from '../../../NumberFormatPipe';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { ImageService } from '../../../../services/image-service';
import { NumberUtilService } from '../../../../services/number-util-service';

export interface OrderLineDTO {
  OrderLineId: number
  itemID: number,
  itemName: string,
  orderLineItem?: any,
  itemDescription?: string,
  itemCost?: number,
  fixedPrice: number
  hasInvoice: boolean,
  invoiceName?: string,
  invoiceNo?: string,
  isActive: boolean
}

export interface ImageDTO {
  orderID: number, 
  fileName: string, 
  File: File,
  url: string,
  descrip: string,
  userID: number,
  created: Date
}

export interface OrderDTO {
  OrderDate: string,
  CustomerId: number,
  CustomerName: string,
  driverName: string,
  DriverId: number,
  TruckId: number,
  TruckNo: string,
  RmoocId: number,
  RmoocNo: string,
  ContainerNo: string,
  ContainerType: string,
  BillBookingNo: string,
  FromLocationID: number,
  FromLocationName: string,
  FromWhereID: number,
  FromWhereName: string,
  ToLocationID: number,
  ToLocationName: string,
  Status: number,
  CreatedDate: string
  OrderLineList: OrderLineDTO[]
  Notes :string,
  PrePayFee :number,
  EmployeeFee :number,
  totalCost : number
}

export enum OrderStatus {
  InProgress,
  PickedUp,
  InTransit,
  Delivered,
  Completed,
  Cancelled,
  FailedDelivery
}

@Component({
  selector: 'app-update-order',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './update-order.component.html',
  styleUrl: './update-order.component.css'
})
export class UpdateOrderComponent {

  listCustomerDTO: any = []
  listDriverDTO: any = []
  listTruckDTO: any = []
  listRmoocDTO: any = []
  listLocationDTO: any = []
  listItemDTO: any = []
  keySearch: string = ''

  // Image management properties
  orderImages: ImageDTO[] = []
  orderImageUpload: ImageDTO[] = []
  selectedImageIndex: number = -1
  showImageModal: boolean = false
  currentImages: ImageDTO[] = []
  currentViewImage: ImageDTO | null = null
  currentImageType: 'existing' | 'new' = 'existing'

  statusList = environment.OrderStatusPattern

  currentOrderDTO: OrderDTO = {
    OrderDate: '',
    CustomerId: 0,
    CustomerName: '',
    DriverId: 0,
    driverName: '',
    TruckId: 0,
    TruckNo: '',
    RmoocId: 0,
    RmoocNo: '',
    ContainerNo: '',
    ContainerType: '',
    BillBookingNo: '',
    FromLocationID: 0,
    FromLocationName: '',
    FromWhereID: 0,
    FromWhereName: '',
    ToLocationID: 0,
    ToLocationName: '',
    OrderLineList: [],
    Status: 0,
    CreatedDate: '',
    PrePayFee : 0,
    EmployeeFee : 0,
    Notes : '',
    totalCost : 0
  };

  currentOrderLine: OrderLineDTO = {
    OrderLineId: 0,
    itemID: 0,
    itemName: '',
    itemDescription: '',
    itemCost: 0,
    fixedPrice: 0,
    hasInvoice: false,
    invoiceName: '',
    invoiceNo: '',
    isActive: false
  }

  roleName = localStorage.getItem("roleName")
  orderID = 0

  constructor(
    private o_service: OrderService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private _location: Location, 
    private i_service : ImageService,
    private numberUtil_service : NumberUtilService
  ) { }

  ngOnInit() {
    this.orderID = Number.parseInt(this.route.snapshot.queryParamMap.get("orderID")!) || 0;
    this.UpdateOrderDetail()
  }

  UpdateOrderDetail() {
    this.o_service.DetailOrder(this.orderID).subscribe((data: any) => {
      if (data.statusCode == 200) {                
        this.currentOrderDTO = {
          OrderDate: data.data.orderDate.substring(0, 10),
          CustomerId: data.data.customerId,
          CustomerName: data.data.customerName,
          DriverId: data.data.driverId,
          driverName: data.data.driverName,
          TruckId: data.data.truckId,
          TruckNo: data.data.truckNo,
          RmoocId: data.data.rmoocId,
          RmoocNo: data.data.rmoocNo,
          ContainerNo: data.data.containerNo,
          ContainerType: data.data.containerType,
          BillBookingNo: data.data.billBookingNo,
          FromLocationID: data.data.fromLocationID,
          FromLocationName: data.data.fromLocationName,
          FromWhereID: data.data.fromWhereID,
          FromWhereName: data.data.fromWhereName,
          ToLocationID: data.data.toLocationID,
          ToLocationName: data.data.toLocationName,
          Status: data.data.status,
          CreatedDate: data.data.createdDate.substring(0, 10),
          OrderLineList: data.data.orderLineList1.map((i: any) => ({
            OrderLineId: i.orderLineId,
            itemID: i.itemID,
            itemName: i.orderLineItem?.itemName || '',
            itemDescription: i.itemDescription || '',
            fixedPrice: i.orderLineItem?.fixedPrice || 0,
            itemCost: i.itemCost || 0,
            hasInvoice: Boolean(i.hasInvoice),
            invoiceNo: i.invoiceNo || '',
            invoiceName: i.invoiceName || '',
            isActive: Boolean(i.isActive)
          })).sort((a: any, b: any) => {
            if (a.hasInvoice && !b.hasInvoice) return -1;
            if (!a.hasInvoice && b.hasInvoice) return 1;
            return a.itemID - b.itemID;
          }),
          Notes : data.data.notes,
          PrePayFee : data.data.prePayFee,
          totalCost : data.data.totalCost,
          EmployeeFee : data.data.employeeFee,
        };
        this.orderImages = data.data.orderImageList || []
      }
      else if (data.statusCode == 400) this.toastr.error(data.message)
      else console.log(data.statusCode);
    });
  }

  updateTotalCost(){
    if (this.currentOrderDTO.OrderLineList.length != 0) {
      this.currentOrderDTO.totalCost = this.currentOrderDTO.OrderLineList.reduce((total: number, item: any) => {
        return total + (Number(item.itemCost) || 0);
      }, 0);
    }
  }

  onCostInput(event: any, trans: any): void {
    const inputValue = event.target.value;
    const parsedValue = this.numberUtil_service.parseCostFromInput(inputValue);
    trans = parsedValue;
  }

  onCostBlur(event: any, trans: any): void {
    if (trans.cost && trans.cost > 0) {
      // Format lại với dấu phẩy
      event.target.value = trans.cost.toLocaleString('en-US');
    }
  }



  // =============== IMAGE MANAGEMENT METHODS ===============
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      this.toastr.error('Vui lòng chọn file hình ảnh!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.toastr.error('File quá lớn! Vui lòng chọn file dưới 2MB.');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const newImage: ImageDTO = {
        orderID: this.orderID,
        fileName: file.name,
        File: file,
        url: e.target.result,
        descrip: '',
        userID: parseInt(localStorage.getItem('userID') || '0'),
        created: new Date()
      };
      this.orderImageUpload.push(newImage);
      this.toastr.success('Đã thêm hình ảnh. Vui lòng thêm chú thích.');
    };
    reader.readAsDataURL(file);
    // Clear input for next selection
    event.target.value = '';
  }

  onDescriptionChange(index: number, event: any): void {
    const description = event.target.value;
    if (this.orderImageUpload[index]) {
      this.orderImageUpload[index].descrip = description;
    }
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
    const placeholder = event.target.nextElementSibling;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  }

  viewImage(index: number, type: 'existing' | 'new'): void {
    this.currentImageType = type;
    this.selectedImageIndex = index;
    
    if (type === 'existing') {
      this.currentImages = [...this.orderImages];
    } else {
      this.currentImages = [...this.orderImageUpload];
    }
    
    this.currentViewImage = this.currentImages[index];
    this.showImageModal = true;
    
  }

  uploadImage(index: number, type: 'existing' | 'new'){
    this.viewImage(index,type)
    const formData = new FormData();
    if (this.currentViewImage != null) {
      formData.append('File', this.currentViewImage.File);
      formData.append('OrderID', this.currentViewImage.orderID.toString() );
      formData.append('Descrip', this.currentViewImage.descrip);
    }
    this.i_service.createImageAndUpload(formData).subscribe( (data:any)=> {
      if (data.statusCode == 200) {
        this.toastr.success(data.message)
        this.UpdateOrderDetail()
        this.deleteImage(index,type)
      }
      else if (data.statusCode == 400) this.toastr.error(data.message)
      else console.log(data.statusCode);
    })
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.selectedImageIndex = -1;
    this.currentImages = [];
    this.currentViewImage = null;
  }

  previousImage(): void {
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
      this.currentViewImage = this.currentImages[this.selectedImageIndex];
    }
  }

  nextImage(): void {
    if (this.selectedImageIndex < this.currentImages.length - 1) {
      this.selectedImageIndex++;
      this.currentViewImage = this.currentImages[this.selectedImageIndex];
    }
  }

  deleteImage(index: number, type: 'existing' | 'new'): void {
    if (type === 'existing') {
      // Handle existing image deletion - call API if needed
      this.orderImages.splice(index, 1);
      this.toastr.success('Đã xóa hình ảnh');
    } else {
      // Remove from upload queue
      this.orderImageUpload.splice(index, 1);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // =============== EXISTING METHODS ===============
  getStatusClass(statusId: number): string {
    if (statusId < this.currentOrderDTO.Status) {
      return 'completed';
    } else if (statusId === this.currentOrderDTO.Status) {
      return 'current';
    } else {
      return 'pending';
    }
  }

  toggleDropdown(dropdownId: string, event: any) {
    this.keySearch = event.target.value
    switch (dropdownId) {
      case 'customerDropdown':
        this.listCustomer(this.keySearch)
        break;
      case 'driverDropdown':
        this.listDriver(this.keySearch)
        break;
      case 'vehicleDropdown':
        this.listTruck(this.keySearch)
        break;
      case 'rmoorDropdown':
        this.listRmooc(this.keySearch)
        break;
      case 'portReceiveDropdown':
      case 'warehouseDropdown':
      case 'portReturnDropdown':
        this.listLocation(this.keySearch)
        break;
      default:
        this.listCustomer(this.keySearch)
        break;
    }
  }

  showListObject(dropdownId: string) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const menu = dropdown.querySelector('.dropdown-menu');
    const toggle = dropdown.querySelector('.dropdown-toggle');

    if (menu?.classList.contains('show')) {
      menu.classList.remove('show');
      toggle?.classList.remove('active');
    } else {
      document.querySelectorAll('.dropdown-menu.show').forEach(otherMenu => {
        otherMenu.classList.remove('show');
        otherMenu.closest('.searchable-dropdown')?.querySelector('.dropdown-toggle')?.classList.remove('active');
      });

      menu?.classList.add('show');
      toggle?.classList.add('active');
      this.loadDropdownData(dropdownId);
    }
  }

  private loadDropdownData(dropdownId: string) {
    switch (dropdownId) {
      case 'customerDropdown':
        this.listCustomer(this.keySearch);
        break;
      case 'driverDropdown':
        this.listDriver(this.keySearch);
        break;
      case 'vehicleDropdown':
        this.listTruck(this.keySearch);
        break;
      case 'rmoorDropdown':
        this.listRmooc(this.keySearch);
        break;
      case 'portReceiveDropdown':
      case 'warehouseDropdown':
      case 'portReturnDropdown':
        this.listLocation(this.keySearch);
        break;
    }
  }

  private closeDropdown(dropdownId: string) {
    const dropdown = document.getElementById(dropdownId);
    const menu = dropdown?.querySelector('.dropdown-menu');
    const toggle = dropdown?.querySelector('.dropdown-toggle');

    menu?.classList.remove('show');
    toggle?.classList.remove('active');
  }

  saveOrder() {
    if (!this.validateForm()) {
      return;
    }
    if (confirm("Bạn có chắc là muốn chỉnh sửa đơn hàng này không?")) {
      this.currentOrderDTO.OrderLineList.forEach((i: any) => {
        if (i.invoiceNo.trim() != '' && i.invoiceName.trim() !== "" && i.itemCost > 0) {
          i.isActive = true;
        } else {
          i.isActive = false;
        }
      });
      this.o_service.UpdateOrder(this.orderID, this.currentOrderDTO).subscribe((data: any) => {
        if (data.statusCode == 200) {
          this.toastr.success(data.message);
          this.UpdateOrderDetail();
        }
        else if (data.statusCode == 400) {
          this.toastr.error(data.message);
        }
        else {
          console.log(data.message);
        }
      });
    }
  }

  ExportOrderDetail(typeExport:string){
    this.o_service.ExportOrderDetail(this.orderID , typeExport).subscribe(
    {
      next: (blob: Blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `OrderDetail_${this.orderID}.${typeExport}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Download failed:', error)
    }
    )
  }

  updateStatusInprogress() {
    if (confirm("⚠️ Bạn cần nhấn Cập nhật thông tin nếu có chỉnh sửa.\n\n👉 Đơn hàng sẽ chuyển tới trạng thái **Đang xử lí**")) {
      this.o_service.UpdateStatusOrderForOperator(this.orderID).subscribe((data: any) => {
        if (data.statusCode == 200) {
          this.UpdateOrderDetail();
          this.toastr.success("✅ Cập nhật trạng thái đơn hàng sang **Đang xử lí** thành công");
        }
        else if (data.statusCode == 400) {
          this.toastr.error("❌ " + data.message);
        }
        else console.log(data.statusCode);
      });
    }
  }

  updateStatusAwaitingApproval() {
    if (confirm("⚠️ Bạn cần nhấn Cập nhật thông tin nếu có chỉnh sửa.\n\n👉 Đơn hàng sẽ chuyển tới trạng thái **Chờ phê duyệt**")) {
      this.o_service.UpdateStatusOrderForAccountant(this.orderID).subscribe((data: any) => {
        if (data.statusCode == 200) {
          this.UpdateOrderDetail();
          this.toastr.success("✅ Cập nhật trạng thái đơn hàng sang **Chờ phê duyệt** thành công");
        }
        else if (data.statusCode == 400) {
          this.toastr.error("❌ " + data.message);
        }
        else console.log(data.statusCode);
      });
    }
  }

  updateStatusSuccess() {
    if (confirm("⚠️ Bạn cần nhấn Cập nhật thông tin nếu có chỉnh sửa.\n\n👉 Đơn hàng sẽ chuyển tới trạng thái **Hoàn thành**")) {
      this.o_service.UpdateStatusOrderForApprover(this.orderID).subscribe((data: any) => {
        if (data.statusCode == 200) {
          this.UpdateOrderDetail();
          this.toastr.success("✅ Cập nhật trạng thái đơn hàng sang **Hoàn thành** thành công");
        }
        else if (data.statusCode == 400) {
          this.toastr.error("❌ " + data.message);
        }
        else console.log(data.statusCode);
      });
    }
  }

  back() {
    if (confirm("Thông tin thay đổi có thể chưa được Lưu")) {
      this._location.back()
    }
  }

  DeleteItemInOrderLine(idx:number){
    this.currentOrderDTO.OrderLineList[idx].invoiceName = ''
    this.currentOrderDTO.OrderLineList[idx].invoiceNo = ''
    this.currentOrderDTO.OrderLineList[idx].hasInvoice = false
    this.currentOrderDTO.OrderLineList[idx].itemCost = 0
  }

  validateForm(): boolean {
    return true;
  }

  listCustomer(keySearch: string) {
    this.o_service.listCustomerService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listCustomerDTO = data.data
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  listDriver(keySearch: string) {
    this.o_service.listDriverService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listDriverDTO = data.data
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  listTruck(keySearch: string) {
    this.o_service.listTruckService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listTruckDTO = data.data
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  listRmooc(keySearch: string) {
    this.o_service.listRmoocService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listRmoocDTO = data.data
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  listLocation(keySearch: string) {
    this.o_service.listLocationService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listLocationDTO = data.data.listLocation
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  listItem(keySearch: string) {
    this.o_service.listItemService(keySearch).subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.listItemDTO = data.data
        this.currentOrderDTO.OrderLineList = this.listItemDTO.map((i: any) => ({
          itemID: i.itemID,
          itemName: i.itemName,
          itemDescription: '',
          fixedPrice: i.fixedPrice,
          itemCost: 0,
          hasInvoice: false,
          invoiceNo: '',
          invoiceName: '',
          isActive: false
        }));
      }
      else if (data.statusCode == 400) {
        this.toastr.error(data.message)
      }
    })
  }

  // Selection handlers
  onSelectCustomer(selectedId: number) {
    this.currentOrderDTO.CustomerId = selectedId;
    const d = this.listCustomerDTO.find((x: any) => x.customerID === selectedId);
    this.currentOrderDTO.CustomerName = d ? d.customerName : '';
    this.keySearch = '';
    this.closeDropdown('customerDropdown');
  }

  onSelectDriver(selectedId: number) {
    this.currentOrderDTO.DriverId = selectedId;
    const d = this.listDriverDTO.find((x: any) => x.driverID === selectedId);
    this.currentOrderDTO.driverName = d ? d.driverName : '';
    this.keySearch = '';
    this.closeDropdown('driverDropdown');
  }

  onSelectTruck(selectedId: number) {
    this.currentOrderDTO.TruckId = selectedId;
    const d = this.listTruckDTO.find((x: any) => x.truckID === selectedId);
    this.currentOrderDTO.TruckNo = d ? d.truckNo : '';
    this.keySearch = '';
    this.closeDropdown('vehicleDropdown');
  }

  onSelectRmooc(selectedId: number) {
    this.currentOrderDTO.RmoocId = selectedId;
    const d = this.listRmoocDTO.find((x: any) => x.truckID === selectedId);
    this.currentOrderDTO.RmoocNo = d ? d.truckNo : '';
    this.keySearch = '';
    this.closeDropdown('rmoorDropdown');
  }

  onSelectLocation(selectedId: number, check: string) {
    switch (check) {
      case 'FromLocationID':
        this.currentOrderDTO.FromLocationID = selectedId;
        const d = this.listLocationDTO.find((x: any) => x.locationId === selectedId);
        this.currentOrderDTO.FromLocationName = d ? d.locationName : '';
        this.closeDropdown('portReceiveDropdown');
        break;
      case 'FromWhereID':
        this.currentOrderDTO.FromWhereID = selectedId;
        const f = this.listLocationDTO.find((x: any) => x.locationId === selectedId);
        this.currentOrderDTO.FromWhereName = f ? f.locationName : '';
        this.closeDropdown('warehouseDropdown');
        break;
      default:
        this.currentOrderDTO.ToLocationID = selectedId;
        const c = this.listLocationDTO.find((x: any) => x.locationId === selectedId);
        this.currentOrderDTO.ToLocationName = c ? c.locationName : '';
        this.closeDropdown('portReturnDropdown');
        break;
    }
    this.keySearch = '';
  }


  
}