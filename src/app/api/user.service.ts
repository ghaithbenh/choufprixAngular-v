import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiClientService) {}

  getAllUsers(token: string): Observable<any[]> {
    return this.api.get<any[]>('/users');
  }

  updateUserRole(userId: string, role: string, token: string): Observable<any> {
    return this.api.patch<any>(`/users/${userId}/role`, { role }, token);
  }
}
