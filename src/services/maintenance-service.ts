import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  constructor(
    private http: HttpClient
  ) { }

  protected readonly url = environment.apiUrl;
  options = { headers: new Headers().set("Content-Type", "application/json") }
  private token = localStorage.getItem("token")



  // Maintenance Service

  listMaintenance(order: string, sortBy: string, pageSize: number, pageNumber: number, searchKey: string, fromDateStr: Date, toDateStr: Date): Observable<any> {
    let fromDateISO = new Date(fromDateStr).toISOString().split('T')[0];
    let toDateISO = new Date(toDateStr).toISOString().split('T')[0];
    let api = "Maintenance/listMaintenance";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('order', order)
      .set('sortBy', sortBy)
      .set('pageSize', pageSize)
      .set('pageNumber', pageNumber)
      .set('fromDateStr', fromDateISO)
      .set('toDateStr', toDateISO)
      .set('searchKey', searchKey)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  CreateMaintenance(maintenanceDTO : any) {
    let api = 'Maintenance/createMaintenance'
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    const requestOptions = {
      headers: header
    }
    return this.http.post(this.url + api, maintenanceDTO, requestOptions)
  }

  UpdateMaintenance(id :number , MaintenanceDTO : any) {
    let api = 'Maintenance/updateMaintenance'
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('id', id)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.put(this.url + api, MaintenanceDTO, requestOptions)
  }

  DetailMaintenance(id: number): Observable<any> {
    let api = "Maintenance/detailMaintenance";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('id', id)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  DeleteMaintenance(id: number): Observable<any> {
    let api = "Maintenance/deleteMaintenance";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('id', id)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  
  // MaintenanceType Service

  listMaintenanceType(order: string, sortBy: string, pageSize: number, pageNumber: number, searchKey: string): Observable<any> {
    let api = "MaintenanceType/listMaintenanceType";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('order', order)
      .set('sortBy', sortBy)
      .set('pageSize', pageSize)
      .set('pageNumber', pageNumber)
      .set('searchKey', searchKey)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  DeleteMaintenancetype(id: number) {
    let api = "MaintenanceType/deleteMaintenanceType";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('id', id)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)

  }

  CreateMaintenanceType(nameType : string) {
    let api = 'MaintenanceType/createMaintenanceType'
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('nameType', nameType)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.post(this.url + api, {nameType}, requestOptions)
  }





}
