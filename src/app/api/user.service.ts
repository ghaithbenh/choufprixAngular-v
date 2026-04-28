import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiClientService) {}

  getAllUsers(token: string): Observable<any[]> {
    return this.api.get<any[]>('/users', undefined, token);
  }

  updateUserRole(userId: string, role: string, token: string): Observable<any> {
    return this.api.patch<any>(`/users/${userId}/role`, { role }, token);
  }

  deleteUser(userId: string, token: string): Observable<any> {
    return this.api.delete<any>(`/users/${userId}`, token);
  }

  createUser(userData: any, token: string): Observable<any> {
    return this.api.post<any>('/users', userData, token);
  }

  login(credentials: any): Observable<any> {
    return this.api.post<any>('/auth/login', credentials);
  }

  register(userData: any): Observable<any> {
    return this.api.post<any>('/auth/register', userData);
  }
}
