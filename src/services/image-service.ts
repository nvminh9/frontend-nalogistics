import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(
    private http: HttpClient
  ) { }

  protected readonly url = environment.apiUrl;
  options = { headers: new HttpHeaders().set("Content-Type", "application/json") }
  private token = localStorage.getItem("token")

  createImageAndUpload(photoDTO: FormData) : Observable<any>{
    let api = 'Image/createImageAndUpload'
    const headers = new HttpHeaders({
      'Authorization': "Bearer " + this.token
    });
    const requestOptions = { headers: headers };
    return this.http.post(this.url + api, photoDTO, requestOptions)
  }
}
