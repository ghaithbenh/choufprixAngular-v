import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

//centralized HTTP client handle all API calls with JWT authentication
//connects  frontend to  backend (environment.apiUrl)
//sends HTTP requests (GET, POST, DELETE, PATCH)
//optionally attaches a JWT token for authentication
//formats query parameters cleanly

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  get<T>(path: string, params?: Record<string, any>, token?: string): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams, headers });
  }

  post<T>(path: string, body: any, token?: string): Observable<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return this.http.post<T>(`${this.baseUrl}${path}`, body, { headers });
  }

  delete<T>(path: string, token?: string): Observable<T> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return this.http.delete<T>(`${this.baseUrl}${path}`, { headers });
  }

  patch<T>(path: string, body: any, token?: string): Observable<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, { headers });
  }
}
