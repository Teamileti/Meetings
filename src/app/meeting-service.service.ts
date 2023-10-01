import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MeetingServiceService {

  constructor(private http: HttpClient) { }

  addMeeting(data: any): Observable<any> {
    return this.http.post('http://localhost:3000/meetings', data);
  }

  updateMeeting(id: number, data: any): Observable<any> {
    return this.http.put(`http://localhost:3000/meetings/${id}`, data);
  }

  getMeetingList(): Observable<any> {
    return this.http.get('http://localhost:3000/meetings');
  }

  deleteMeeting(id: number): Observable<any> {
    return this.http.delete(`http://localhost:3000/meetings/${id}`);
  }
}
