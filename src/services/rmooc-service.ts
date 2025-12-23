import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RmoocService {
  constructor(
    private http: HttpClient
  ) { }

  protected readonly url = environment.apiUrl;
  options = { headers: new HttpHeaders().set("Content-Type", "application/json") }
  private token = localStorage.getItem("token")


  listRmooc(token: string, order: string, sortBy: string, pageSize: number, pageNumber: number, keySearch: string): Observable<any> {
    let api = "admin/Truck/searchRmooc";
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

  DeleteRmooc(rmoocID: number) {

  }


  CreateRmooc(CreateRmoocDTO: any) {
    let api = 'admin/Truck/createRmooc'
    const headers = new HttpHeaders({
      'Authorization': "Bearer " + this.token
    });
    const requestOptions = { headers: headers };
    return this.http.post(this.url + api, CreateRmoocDTO, requestOptions)
  }

  UpdateRmooc(id: number, UpdateRmoocDTO: any) {
    let api = 'admin/Truck/updateRmooc/' + id
    const header = new HttpHeaders({
      'Authorization': "Bearer " + this.token
    });
    const requestOptions = {
      headers: header,
    }
    return this.http.put(this.url + api, UpdateRmoocDTO, requestOptions)
  }

  DetailRmooc(RmoocID: number): Observable<any> {
    let api = "admin/Truck/detailRmooc";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('id', RmoocID)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

}
