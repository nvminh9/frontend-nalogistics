import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor(
    private http: HttpClient
  ) { }

  protected readonly url = environment.apiUrl;

  options = { headers: new HttpHeaders().set("Content-Type", "application/json") }
  token = localStorage.getItem("token")


  Login(username: string, password: string): Observable<any> {
    let api = "auth/login";
    let data = {
      Username: username,
      Password: password
    }
    return this.http.post(this.url + api, data, this.options);
  }

  CheckToken(token: string): Observable<any> {
    let api = "auth/decodedToken";
    let header = new HttpHeaders({
      'Authorization': "Bearer " + token
    })
    const requestOptions = { headers: header }
    return this.http.get(this.url + api, requestOptions);
  }



  


}
