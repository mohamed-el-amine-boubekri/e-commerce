import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {OrderHistory} from "../common/order-history";
import {Observable} from "rxjs";

interface GetResponseOrderHistory {
  _embedded: {
    orders: OrderHistory[];
  }
}

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

    orderUrl: string = "http://localhost:8080/api/orders";

  constructor(private httpClient : HttpClient) {
  }

  getOrderHistory(theEmail: string): Observable<GetResponseOrderHistory>{
    const url = this.orderUrl;

    const orderHistoryUrl =  `${url}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${theEmail}` ; // `${{url}}/search/findByCustomerEmail?email=${{theEmail}}` ;


    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl);
  }
}
