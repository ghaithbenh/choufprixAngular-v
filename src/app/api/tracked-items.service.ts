import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { TrackedItem } from '../types';

@Injectable({ providedIn: 'root' })
export class TrackedItemsService {
  constructor(private api: ApiClientService) {}

  getTrackedItems(token: string): Observable<TrackedItem[]> {
    return this.api.get<TrackedItem[]>('/tracked-items', undefined, token);
  }

  getTrackedProductIds(token: string): Observable<string[]> {
    return this.api.get<string[]>('/tracked-items/ids', undefined, token);
  }

  trackProduct(productId: string, token: string): Observable<any> {
    return this.api.post<any>('/tracked-items', { productId }, token);
  }

  untrackProduct(productId: string, token: string): Observable<any> {
    return this.api.delete<any>(`/tracked-items/${productId}`, token);
  }
}
