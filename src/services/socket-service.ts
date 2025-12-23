import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { json } from 'stream/consumers';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!:WebSocket ;

  // Subject để broadcast data cho các component
  private dataSubject = new Subject<any>();

  // Subject để broadcast connection status
  private connectionStatus = new Subject<boolean>();
  private token = localStorage.getItem("token")

  /**
   * Lấy Observable để component subscribe
  */
  public getData(): Observable<any> {
    return this.dataSubject.asObservable();
  }



  connect() {
    try {
      this.socket = new WebSocket('ws://localhost:5167/api/DashBoard/truck-statistics?token=' + this.token);
      
      this.socket.onopen = (event:any) => {
        console.log('✅ WebSocket connected successfully');
      };

      this.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);          
          // Broadcast data cho các component đã subscribe
          this.dataSubject.next(data);
      };

      
      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
      
      this.socket.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        // Thử kết nối lại sau 5 giây
        // setTimeout(() => this.connect(), 5000);
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }

  /**
   * Disconnect WebSocket
  */
  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }


  sendMessage(message :string){
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message)
    }
  }


}
