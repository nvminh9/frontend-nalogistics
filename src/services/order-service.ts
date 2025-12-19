import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(
    private http: HttpClient
  ) { }

  private url = "http://localhost:5167/api/";
  options = { headers: new HttpHeaders().set("Content-Type", "application/json") }
  private token = localStorage.getItem("token")
  private pageSize = 50
  private pageNumber = 1




  listCustomerService(keySearch: string): Observable<any> {
    let api = "admin/Customer/listCustomer";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('pageSize', this.pageSize)
      .set('pageNumber', this.pageNumber)
      .set('keySearch', keySearch)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  listDriverService(keySearch: string): Observable<any> {
    let api = "admin/Driver/listDriver";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('pageSize', this.pageSize)
      .set('pageNumber', this.pageNumber)
      .set('keySearch', keySearch)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  listTruckService(keySearch: string): Observable<any> {
    let api = "admin/Truck/searchTruck";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('pageSize', this.pageSize)
      .set('pageNumber', this.pageNumber)
      .set('keySearch', keySearch)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  listRmoocService(keySearch: string): Observable<any> {
    let api = "admin/Truck/searchRmooc";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('pageSize', this.pageSize)
      .set('pageNumber', this.pageNumber)
      .set('keySearch', keySearch)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  listLocationService(searchKey: string): Observable<any> {
    let api = "admin/Location/listLocation";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('pageSize', this.pageSize)
      .set('pageNumber', this.pageNumber)
      .set('searchKey', searchKey)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  listItemService(keySearch: string): Observable<any> {
    let api = "admin/Item/listItem";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('sortBy', 'displayorder')
      .set('order', 'desc')
      .set('pageSize', this.pageSize)
      .set('pageNumber', this.pageNumber)
      .set('searchKey', keySearch)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }


  CreateOrder(createOrderDTO: any): Observable<any> {
    let api = 'Order/createOrder'
    const headers = new HttpHeaders({
      'Authorization': "Bearer " + this.token
    });
    const requestOptions = { headers: headers };
    return this.http.post(this.url + api, createOrderDTO, requestOptions)
  }


  ListOrder(fromDateStr: Date, toDateStr: Date, order: string, sortBy: string, pageSize: number, pageNumber: number, keySearch: string, status: string) {
    let fromDateISO = new Date(fromDateStr).toISOString().split('T')[0];
    let toDateISO = new Date(toDateStr).toISOString().split('T')[0];

    let api = "Order/listOrder";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('fromDateStr', fromDateISO)
      .set('toDateStr', toDateISO)
      .set('status', status)
      .set('order', order)
      .set('sortBy', sortBy)
      .set('pageSize', pageSize)
      .set('pageNumber', pageNumber)
      .set('searchKey', keySearch)
    // .set('cursor', cursor)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }



  DetailOrder(orderID: number): Observable<any> {
    let api = "Order/detailOrder";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('id', orderID)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }


  UpdateOrder(orderID: number, orderDTO: any) {
    let api = "Order/UpdateOrder";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('id', orderID)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.put(this.url + api, orderDTO, requestOptions)
  }


  ExportOrderDetail(orderID: number, typeExport :string): Observable<any>{
    let api = "Order/exportOrderDetail";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('orderID', orderID)
      .set('typeExport', typeExport)
    const requestOptions = {
      headers: header,
      params: fromQuery,
      responseType: 'blob' as 'blob' 
    }
    return this.http.post(this.url + api,null, requestOptions)
  }
  ExportOrders(fromDateStr: Date, toDateStr: Date, order: string, sortBy: string, pageSize: number, pageNumber: number, keySearch: string, status: string , typeExport:string): Observable<any>{
    let api = "Order/exportOrders";
    let fromDateISO = new Date(fromDateStr).toISOString().split('T')[0];
    let toDateISO = new Date(toDateStr).toISOString().split('T')[0];
    let requestDTO = {
      fromDateStr: fromDateISO,
      toDateStr: toDateISO,
      order: order,
      sortBy: sortBy,
      pageSize: pageSize,
      pageNumber: pageNumber,
      keySearch: keySearch,
      status: status ,
    }
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('typeExport', typeExport)
    const requestOptions = {
      headers: header,
      params: fromQuery,
      responseType: 'blob' as 'blob' 
    }
    return this.http.post(this.url + api, requestDTO , requestOptions)
  }


  UpdateStatusOrderForOperator(orderID: number) {
    let api = "Order/updateStatusOrderForOperator";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('orderID', orderID)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.put(this.url + api, null, requestOptions)
  }


  UpdateStatusOrderForAccountant(orderID: number) {
    let api = "Order/updateStatusOrderForAccountant";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('orderID', orderID)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.put(this.url + api, null, requestOptions)
  }

  UpdateStatusOrderForApprover(orderID: number) {
    let api = "Order/updateStatusOrderForApprover";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('orderID', orderID)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.put(this.url + api, null, requestOptions)
  }









}
