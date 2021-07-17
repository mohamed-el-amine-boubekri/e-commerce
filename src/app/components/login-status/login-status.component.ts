import { Component, OnInit } from '@angular/core';
import {OktaAuthService} from "@okta/okta-angular";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated: boolean = false;
  fullName: string;
  storage : Storage = sessionStorage;

  constructor(private oktaAuthService: OktaAuthService,
              private cartService: CartService ) { }

  ngOnInit(): void {

    //subscribe to authentication state changes
    this.oktaAuthService.$authenticationState.subscribe(
      (result) => {
        this.isAuthenticated = result;
        this.getUserDetails();

      }
    );
  }

  private getUserDetails() {
    if (this.isAuthenticated) {
      //Fetch the logged in user details
      //user full name is exposed as property name
      this.oktaAuthService.getUser().then(
        (res) => {this.fullName = res.name;

                 //retrieve the email
                 const theEmail = res.email;
                 const secondEmail = JSON.parse(this.storage.getItem('userEmail'));
                 //test
                 console.log(theEmail);
                 console.log(secondEmail);

                 if(theEmail != secondEmail){
                   this.cartService.emptyCart()
                 }

                 this.storage.setItem("userEmail", JSON.stringify(theEmail))
        }
      );
    }
  }

  logout(){
    this.oktaAuthService.signOut();
  }
}
