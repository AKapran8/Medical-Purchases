import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPurchase, ISecondTaskBody } from '../purchases.model';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {

  constructor(private _http: HttpClient) { }

  public getPurchases(): Observable<IPurchase[] | []> {
    return this._http.get<IPurchase[] | []>(`https://api.medzakupivli.com/appellation/type/?hash=8f7d225ffda84d9a143ca8c9868779a95cc9b033`)
  }

  // I don't understand what that endpoint do, so I name it like this
  public secondOptionalTask(body: ISecondTaskBody): Observable<any> {
    const param: string = body.key;
    return this._http.post<any>(`https://api.medzakupivli.com/inbound_logistics/angular/?name=${param}`, body);
  }

}
