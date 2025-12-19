import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient
  ) { }

  private url = "http://localhost:5167/api/";
  options = { headers: new HttpHeaders().set("Content-Type", "application/json") }
  private token = localStorage.getItem("token")



  CreateUserRole(NewUserDTO: any): Observable<any> {
    let api = 'Auth/createNewUserRoleByAdmin'
    const headers = new HttpHeaders({
      'Authorization': "Bearer " + this.token
    });
    const requestOptions = { headers: headers };
    return this.http.post(this.url + api, NewUserDTO, requestOptions)
  }

  GetListUser(order: string, sortBy: string, pageSize: number, keySearch: string, pageNumber: number , roleID :number): Observable<any> {
    let api = "Auth/listUser";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('order', order)
      .set('sortBy', sortBy)
      .set('pageSize', pageSize)
      .set('pageNumber', pageNumber)
      .set('keySearch', keySearch)
      .set('roleID', roleID)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  UpdateUserByAdmin(UpdateUserDTO: any , userID : number): Observable<any> {
    console.log(UpdateUserDTO);
    let api = 'Auth/updateUserRoleByAdmin'
    const headers = new HttpHeaders({
      'Authorization': "Bearer " + this.token
    });
    let fromQuery = new HttpParams()
      .set('id', userID)
    const requestOptions = { headers: headers , params : fromQuery };    
    return this.http.put(this.url + api, UpdateUserDTO, requestOptions)
  }

  DetailUser(userID: number): Observable<any> {
    let api = "Auth/detailUser";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + this.token,
      "Content-Type": "application/json"
    })
    let fromQuery = new HttpParams()
      .set('id', userID)
    const requestOptions = {
      headers: header,
      params: fromQuery
    }
    return this.http.get(this.url + api, requestOptions)
  }

  ListRole(): Observable<any> {
    let api = "Auth/getAllRole";
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
