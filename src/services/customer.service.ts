import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(
    private http:HttpClient
  ){}

  private url = "http://localhost:5167/api/" ;
  options = { headers : new HttpHeaders().set("Content-Type", "application/json")}
  private token  = localStorage.getItem("token")


  listCustomer(token :string ,order:string,sortBy:string,pageSize:number, pageNumber:number , keySearch:string) :Observable<any> {
    let api = "admin/Customer/listCustomer";
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


  DeleteCustomer(customerID :number){

  }

  DetailCustomer(customerID :number) : Observable<any> {
    let api = "admin/Customer/detailCustomer";
    let header = new HttpHeaders({
      'Authorization' : "Bearer " + this.token,
      "Content-Type" : "application/json"
    })
    let fromQuery = new HttpParams()
    .set('id' , customerID )
    const requestOptions = {
       headers :header,
       params : fromQuery
      }
    return this.http.get( this.url + api , requestOptions)
  }

  CreateUser(userDTO:any){
    let api = 'Auth/createNewUser'
      const headers = new HttpHeaders({
        'Authorization': "Bearer "  + this.token
    });
      const requestOptions = { headers: headers };
      return this.http.post(this.url + api, userDTO, requestOptions)
  }
  CreateCustomer(customerDTO:any){
    let api = 'admin/Customer/createCustomer'
      const headers = new HttpHeaders({
        'Authorization': "Bearer "  + this.token
      });
      const requestOptions = { headers: headers };
      return this.http.post(this.url + api, customerDTO, requestOptions)
  }

  UpdateCustomer(id:number , customerDTO:any){
    let api = 'admin/Customer/updateCustomer/' + id
    const header = new HttpHeaders({
        'Authorization': "Bearer "  + this.token
    });
    const requestOptions = {
       headers : header,
      }
    return this.http.put(this.url + api, customerDTO, requestOptions)
  }








  
}
