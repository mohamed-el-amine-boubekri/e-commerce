import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Luv2shopFormService} from "../../services/luv2shop-form.service";
import {dateComparator} from "@ng-bootstrap/ng-bootstrap/datepicker/datepicker-tools";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {Luv2shopValidators} from "../../validators/luv2shop-validators";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";

@Component({
  selector: 'app-chekout',
  templateUrl: './chekout.component.html',
  styleUrls: ['./chekout.component.css']
})
export class ChekoutComponent implements OnInit {

  checkoutFormGroup : FormGroup;
  totalQuantity: number = 0;
  totalPrice: number = 0.00;

  creditCardYear : number[] = [];
  creditCardMonth : number[] = [];
  countries : Country[] = [];

  shippingAddressStates : State[] = [];
  billingAddressStates : State[] = [];
  //luv2shopFormService : Luv2shopFormService;
  storage = sessionStorage;

  constructor(private formBuilder : FormBuilder,
              private luv2shopFormService: Luv2shopFormService,
              private cartService : CartService,
              private checkoutService : CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    const startMonth : number = new Date().getMonth() + 1;
    const theEmail = JSON.parse(this.storage.getItem('userEmail'));

    this.luv2shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived Credit Card Month" + JSON.stringify(data));
        this.creditCardMonth = data;
      }
    );

    this.luv2shopFormService.getCreditCardYear().subscribe(
      data => {
        console.log("Retrieved Credit Card Year " + JSON.stringify(data));
        this.creditCardYear = data;
      }
    );

    //populate countries
    this.luv2shopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieve countries :" + JSON.stringify(data));
        this.countries = data;
      }
    );

    this.checkoutFormGroup = this.formBuilder.group({
      customer : this.formBuilder.group({
        firstName : new FormControl('',[Validators.required,
                                                                Validators.minLength(2),
                                                                Luv2shopValidators.notOnlyWhitespace]),
        lastName :  new FormControl('',[Validators.required,Validators.minLength(2),
                                                                Luv2shopValidators.notOnlyWhitespace]),
        email : new FormControl(theEmail,
            [Validators.required /*, Validators.pattern(  `^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2-4}$`)*/])
      }),
      shippingAddress : this.formBuilder.group({
        street : new FormControl('',[Validators.required,Validators.minLength(2),
                                                             Luv2shopValidators.notOnlyWhitespace]),
        city : new FormControl('',[Validators.required,Validators.minLength(2),
                                                           Luv2shopValidators.notOnlyWhitespace]),
        state : [''],
        country : [''],
        zipCode : new FormControl('',[Validators.required,Validators.minLength(2),
                                                              Luv2shopValidators.notOnlyWhitespace])
      }),
      billingAddress : this.formBuilder.group({

        street : new FormControl('',[Validators.required,Validators.minLength(2),
          Luv2shopValidators.notOnlyWhitespace]),
        city : new FormControl('',[Validators.required,Validators.minLength(2),
          Luv2shopValidators.notOnlyWhitespace]),
        state : [''],
        country : [''],
        zipCode : new FormControl('',[Validators.required,Validators.minLength(2),
          Luv2shopValidators.notOnlyWhitespace])
      }),
      creditCard : this.formBuilder.group({
        cardType :new FormControl('',[Validators.required]),
        nameOnCard : new FormControl('',[Validators.required,Validators.minLength(2),
                                                                Luv2shopValidators.notOnlyWhitespace]),
        cardNumber : new FormControl('',[Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode : new FormControl('',[Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth : [''],
        expirationYear : ['']
      })
    });
  }

  onSubmit(){
    console.log("Handling information of the customer");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    //set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //get cart items
    const cartItems = this.cartService.cartItems;

    //create orderItem from cartItems
    //long way
    /*let orderItems : OrderItem[] = [];
    for(let i=0 ; cartItems.length; i++){
      orderItems[i] = new OrderItem(cartItems[i]);
    } */

    //short way
    let orderItems : OrderItem[] =cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    //set up purchase
    let purchase = new Purchase();

    //populate purchase customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //populate purchase shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));

    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    //populate purchase billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));

    purchase.billingAddress.state = shippingState.name;
    purchase.billingAddress.country = shippingCountry.name;

    //populate purchase order and order Items
    purchase.order = order;
    purchase.orderItems = orderItems;

    //call REST API via checkout service
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => { alert( `Your order has been received. \\nOrder tracking number ${response.orderTrackingNumber}`);
        //reset the cart
          this.resetCart();
        },
        error: err => {
          alert(`There was an error ${err.message}`);
        }
      }
    );

    //console.log(this.checkoutFormGroup.get('customer').value);
    //console.log("the email is :" + this.checkoutFormGroup.get('customer').value.email);
    //console.log(this.checkoutFormGroup.get('shippingAddress').value);
    //console.log(this.checkoutFormGroup.get('billingAddress').value);
    //console.log(this.checkoutFormGroup.get('creditCard').value);
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName')
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName')
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email')
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street')
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city')
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state')
  }
  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode')
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country')
  }

  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType')
  }
  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard')
  }
  get creditCardCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber')
  }
  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode')
  }



  copyShippingToBilling(event) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value);
      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = [];
    }

  }

  handleYearMonth() {

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYea: number = new Date().getFullYear();
    const selectedYear : number = Number(creditCardFormGroup.value.expirationYear);

    let startMonth : number;

    if (currentYea === selectedYear){
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1
    }
    this.luv2shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card month" + JSON.stringify(data));
        this.creditCardMonth = data;
      }
    )
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code and name: ${countryCode}  ${countryName}`);

    this.luv2shopFormService.getStates(countryCode).subscribe(
      data => {

        if(formGroupName ==='shippingAddress'){
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }
        formGroup.get('state').setValue(data[0]);
      }
    );

  }

  private reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
     totalQuantity => this.totalQuantity = totalQuantity
    );
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    )
  }

  private resetCart() {
    //reset cart service
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    //reset form
    this.checkoutFormGroup.reset();

    //navigate back to the products page
    this.router.navigateByUrl("/products");
  }
}
