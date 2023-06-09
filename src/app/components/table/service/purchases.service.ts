import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {

  constructor(private _http: HttpClient) { }

  public getPurchases(): Observable<any> {
    return this._http.get<any>(`https://api.medzakupivli.com/appellation/type/?hash=8f7d225ffda84d9a143ca8c9868779a95cc9b033`)
  }

}
