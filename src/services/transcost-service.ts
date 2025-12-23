import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TranscostService {
  constructor(private http : HttpClient){}

  protected readonly url = environment.apiUrl;
    options = { headers : new HttpHeaders().set("Content-Type", "application/json")}
    private token  = localStorage.getItem("token")



    // GetListTranscost():Observable<any>{
    GetListTranscost(FromLocationId:number, FromWhereId:number, ToLocationId:number, fromDateStr:Date,toDateStr:Date, pageSize:number, pageNumber:number):Observable<any>{  
      let fromDateISO = new Date(fromDateStr).toISOString().split('T')[0];
      let toDateISO = new Date(toDateStr).toISOString().split('T')[0];
      let api = "Transcost/getListTranscost";
      let header = new HttpHeaders({
        'Authorization': "Bearer " + this.token,
        "Content-Type": "application/json"
      })
      let fromQuery = new HttpParams()
        .set('fromLocationId', FromLocationId)
        .set('fromWhereId', FromWhereId)
        .set('toLocationId', ToLocationId)
        .set('pageSize', pageSize)
        .set('pageNumber', pageNumber)
        .set('fromDateStr', fromDateISO)
        .set('toDateStr', toDateISO)
      const requestOptions = {
        headers: header,
        params: fromQuery
      }
      return this.http.get(this.url + api, requestOptions)
    }

    CreateTranscost(transcostDTO:any){
      let api = 'Transcost/createTranscost'
      const headers = new HttpHeaders({
        'Authorization': "Bearer " + this.token
      });
      const requestOptions = { headers: headers };
      return this.http.post(this.url + api, transcostDTO, requestOptions)
    }


    UpdateTranscost(transcostDTO:any){
      let api = 'Transcost/updateTranscost'
      const headers = new HttpHeaders({
        'Authorization': "Bearer " + this.token
      });
      const requestOptions = { headers: headers };
      return this.http.post(this.url + api, transcostDTO, requestOptions)
    }




  
}
