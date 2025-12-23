import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  
    constructor(
      private http:HttpClient
    ){}
  
  protected readonly url = environment.apiUrl;
    options = { headers : new HttpHeaders().set("Content-Type", "application/json")}
    private token  = localStorage.getItem("token")
  
    listLocation(token :string ,order:string,sortBy:string,pageSize:number, pageNumber:number , searchKey:string) :Observable<any> {
        let api = "admin/Location/listLocation";
        let header = new HttpHeaders({
          'Authorization' : "Bearer " + token,
          "Content-Type" : "application/json"
        })
        let fromQuery = new HttpParams()
        .set('order' , order)
        .set('sortBy' , sortBy)
        .set('pageSize' , pageSize)
        .set('pageNumber' , pageNumber)
        .set('searchKey' , searchKey)
        const requestOptions = {
           headers :header,
           params : fromQuery
          }
        return this.http.get( this.url + api , requestOptions)
    }
  
    DeleteObject(locationID :number){
  
    }
    
    CreateLocation(createLocationDTO:any){
      let api = 'admin/Location/createLocation'
        const headers = new HttpHeaders({
          'Authorization': "Bearer "  + this.token
        });
        const requestOptions = { headers: headers };
        return this.http.post(this.url + api, createLocationDTO, requestOptions)
    }
  
    UpdateLocation(id:number , updateLocationDTO:any){
      let api = 'admin/Location/updateLocation/' + id
      const header = new HttpHeaders({
          'Authorization': "Bearer "  + this.token
      });
      const requestOptions = {
         headers : header,
        }
      return this.http.put(this.url + api, updateLocationDTO, requestOptions)
    }
  
    DetailLocation(locationID :number) : Observable<any> {
      let api = "admin/Location/detailLocation";
      let header = new HttpHeaders({
        'Authorization' : "Bearer " + this.token,
        "Content-Type" : "application/json"
      })
      let fromQuery = new HttpParams()
      .set('id' , locationID )
      const requestOptions = {
         headers :header,
         params : fromQuery
        }
      return this.http.get( this.url + api , requestOptions)
    }
  
  
}
