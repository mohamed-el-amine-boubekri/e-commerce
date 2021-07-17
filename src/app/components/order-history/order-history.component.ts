import { Component, OnInit } from '@angular/core';
import {OrderHistoryService} from "../../services/order-history.service";
import {OrderHistory} from "../../common/order-history";

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {

  orderHistoryList: OrderHistory[] = [];
  storage: Storage = sessionStorage;

  orderTreck: string;

  constructor(private orderHistoryService: OrderHistoryService) {
  }

  ngOnInit(): void {
    this.handleOrderHistory();
  }

  handleOrderHistory() {
    const theEmail = JSON.parse(this.storage.getItem('userEmail'));

    this.orderHistoryService.getOrderHistory(theEmail).subscribe(
      resp => {
        this.orderHistoryList = resp._embedded.orders;

        //console.log( resp._embedded.orders)
      }
    );

  }
}

