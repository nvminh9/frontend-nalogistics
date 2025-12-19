import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TruckService {
  constructor(
    private http: HttpClient
  ) { }

  private url = "http://localhost:5167/api/";
  options = { headers: new HttpHeaders().set("Content-Type", "application/json") }
  private token = localStorage.getItem("token")


  listTruck(token: string, order: string, sortBy: string, pageSize: number, pageNumber: number, keySearch: string): Observable<any> {
    let api = "admin/Truck/searchTruck";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('order', order)
      .set('sortBy', sortBy)
      .set('pageSize', pageSize)
      .set('pageNumber', pageNumber)
      .set('keySearch', keySearch)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  DeleteTruck(truckID: number) {

  }


  CreateTruck(CreateTruckDTO: any) {
    let api = 'admin/Truck/createTruck'
    const headers = new HttpHeaders({
      'Authorization': "Bearer " + this.token
    });
    const requestOptions = { headers: headers };
    return this.http.post(this.url + api, CreateTruckDTO, requestOptions)
  }

  UpdateTruck(id: number, UpdateTruckDTO: any) {
    let api = 'admin/Truck/updateTruck/' + id
    const header = new HttpHeaders({
      'Authorization': "Bearer " + this.token
    });
    const requestOptions = {
      headers: header,
    }
    return this.http.put(this.url + api, UpdateTruckDTO, requestOptions)
  }

  DetailTruck(TruckID: number): Observable<any> {
    let api = "admin/Truck/detailTruck";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('id', TruckID)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }




  getDashboardData(): Observable<any> {
    let api = "DashBoard/truck-statistics";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    const requestOptions = {
      headers: header,
    }
    return this.http.get(this.url + api, requestOptions)
  }
}
