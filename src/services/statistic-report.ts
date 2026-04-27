import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticReport {
  constructor(
    private http : HttpClient
  ){}
  protected readonly url = environment.apiUrl;
  options =  { headers: new HttpHeaders().set("Content-Type", "application/json") }
  token = localStorage.getItem("token")


  ListOrderstatistic(TruckNo : string,FromDateStr :Date,ToDateStr : Date, Status : string ): Observable<any>{
    let api = "Statistics/listOrderstatistic";
    let fromDateISO = new Date(FromDateStr).toISOString().split('T')[0];
    let toDateISO = new Date(ToDateStr).toISOString().split('T')[0];
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('TruckNo', TruckNo)
      .set('FromDateStr', fromDateISO)
      .set('ToDateStr', toDateISO)
      .set('Status', Status)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  ExportListOrderstatistic(TruckNo: string, FromDateStr: Date, ToDateStr: Date, Status: string): Observable<any> {
    let api = "Statistics/exportListOrderstatistic";
    let fromDateISO = new Date(FromDateStr).toISOString().split('T')[0];
    let toDateISO = new Date(ToDateStr).toISOString().split('T')[0];

    let header = new HttpHeaders({
        'Authorization': "Bearer " + this.token,
        "Content-Type": "application/json"
    });
    let fromQuery = new HttpParams()
        .set('TruckNo', TruckNo)
        .set('FromDateStr', fromDateISO)
        .set('ToDateStr', toDateISO)
        .set('Status', Status);

    return this.http.get(this.url + api, {
        headers: header,
        params: fromQuery,
        responseType: 'blob',
        observe: 'response'
    });
}

  ListMaintenanceByTruckNo(TruckNo : string): Observable<any>{
    let api = "Statistics/getMaintenanceByTruckNo";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('TruckNo', TruckNo)

    const requestOptions = {
      headers: header,
      params: fromQuery,
    }
    return this.http.get(this.url + api, requestOptions)
  }




}
