export const environment = {
    production: false,
    apiUrl: 'http://localhost:5167/api/',
    OrderStatusPattern : [
        { key: 0, value: "Đang chờ" },
        { key: 1, value: "Đang xử lý" },
        { key: 2, value: "Đã lấy hàng" },
        { key: 3, value: "Đang vận chuyển" },
        { key: 4, value: "Đã giao" },
        { key: 5, value: "Chờ phê duyệt" },
        { key: 6, value: "Hoàn thành" },
        { key: 7, value: "Đã hủy" },
        { key: 8, value: "Giao thất bại" },
    ],

    RolePattern : [
        { key: 1, value: "Admin" },
        { key: 2, value: "User" },
        { key: 3, value: "Driver" },
        { key: 4, value: "Customer" },
        { key: 5, value: "Entry" },
        { key: 6, value: "Operator" },
        { key: 7, value: "Accountant" },
        { key: 8, value: "Approver" },
    ]
};

/*
    <td *ngIf="user.roleID == 1">Admin</td> 
    <td *ngIf="user.roleID == 2">User</td> 
    <td *ngIf="user.roleID == 3">Driver</td> 
    <td *ngIf="user.roleID == 4">Customer</td> 
    <td *ngIf="user.roleID == 5">Entry</td> 
    <td *ngIf="user.roleID == 6">Operator</td> 
    <td *ngIf="user.roleID == 7">Accountant</td> 
    <td *ngIf="user.roleID == 8">Approver</td> 
*/
/*
Pending         // đag chờ
InProgress,     // Đang xu ly
PickedUp,       // Đã lấy hàng
InTransit,      // Đang vận chuyển
Delivered,      // Đã giao
Completed,      // Hoàn thành
Cancelled,      // Đã hủy
FailedDelivery  // Giao thất bại

*/