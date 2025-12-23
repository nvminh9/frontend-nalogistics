import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  constructor(
    private http:HttpClient
  ){}

  protected readonly url = environment.apiUrl;
  options = { headers : new HttpHeaders().set("Content-Type", "application/json")}
  private token  = localStorage.getItem("token")

  listDriver(token :string ,order:string,sortBy:string,pageSize:number, pageNumber:number , keySearch:string) :Observable<any> {
      let api = "admin/Driver/listDriver";
      let header = new HttpHeaders({
        'Authorization' : "Bearer " + token,
        "Content-Type" : "application/json"
      })
      let fromQuery = new HttpParams()
      .set('order' , order)
      .set('sortBy' , sortBy)
      .set('pageSize' , pageSize)
      .set('pageNumber' , pageNumber)
      .set('keySearch' , keySearch)
      const requestOptions = {
         headers :header,
         params : fromQuery
        }
      return this.http.get( this.url + api , requestOptions)
  }

  DeleteDriver(driverID :number){

  }
  


  CreateDriverAndUser(CreateDriverDTO:any){
    let api = 'admin/Driver/createDriver'
      const headers = new HttpHeaders({
        'Authorization': "Bearer "  + this.token
      });
      const requestOptions = { headers: headers };
      return this.http.post(this.url + api, CreateDriverDTO, requestOptions)
  }

  UpdateDriver(id:number , UpdateDriverDTO:any){
    let api = 'admin/Driver/updateDriver/' + id
    const header = new HttpHeaders({
        'Authorization': "Bearer "  + this.token
    });
    const requestOptions = {
       headers : header,
      }      
    return this.http.put(this.url + api, UpdateDriverDTO, requestOptions)
  }

  DetailDriver(DriverID :number) : Observable<any> {
    let api = "admin/Driver/detailDriver";
    let header = new HttpHeaders({
      'Authorization' : "Bearer " + this.token,
      "Content-Type" : "application/json"
    })
    let fromQuery = new HttpParams()
    .set('id' , DriverID )
    const requestOptions = {
       headers :header,
       params : fromQuery
      }
    return this.http.get( this.url + api , requestOptions)
  }



  
  

}
