import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
    constructor(
      private http:HttpClient
    ){}
  
  protected readonly url = environment.apiUrl;
    options = { headers : new HttpHeaders().set("Content-Type", "application/json")}
    private token  = localStorage.getItem("token")
  
    
    listItem(order:string,sortBy:string,pageSize:number, pageNumber:number , keySearch:string) :Observable<any> {
        let api = "admin/Item/listItem";
        let header = new HttpHeaders({
          'Authorization' : "Bearer " + this.token,
          "Content-Type" : "application/json"
        })
        let fromQuery = new HttpParams()
        .set('order' , order)
        .set('sortBy' , sortBy)
        .set('pageSize' , pageSize)
        .set('pageNumber' , pageNumber)
        .set('searchKey' , keySearch)
        const requestOptions = {
           headers :header,
           params : fromQuery
          }
        return this.http.get( this.url + api , requestOptions)
    }
  
    DeleteItem(itemID :number){
  
    }
    
  
    CreateItem(CreateItemDTO:any){
      let api = 'admin/Item/createItem'
        const headers = new HttpHeaders({
          'Authorization': "Bearer "  + this.token
        });
        const requestOptions = { headers: headers };
        return this.http.post(this.url + api, CreateItemDTO, requestOptions)
    }
  
    UpdateItem(id:number , UpdateItemDTO:any){
      let api = 'admin/Item/updateItem/' + id
      const header = new HttpHeaders({
          'Authorization': "Bearer "  + this.token
      });
      const requestOptions = {
         headers : header,
        }
      return this.http.put(this.url + api, UpdateItemDTO, requestOptions)
    }
  
    DetailItem(ItemID :number) : Observable<any> {
      let api = "admin/Item/detailItem";
      let header = new HttpHeaders({
        'Authorization' : "Bearer " + this.token,
        "Content-Type" : "application/json"
      })
      let fromQuery = new HttpParams()
      .set('id' , ItemID )
      const requestOptions = {
         headers :header,
         params : fromQuery
        }
      return this.http.get( this.url + api , requestOptions)
    }
  
  
}
