import { Injectable } from '@angular/core';
import {CartItem} from "../common/cart-item";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  storage: Storage = sessionStorage;

  isTheSame: boolean;

  theEmail = JSON.parse(this.storage.getItem('userEmail'));
  //storage: Storage = localStorage;

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() {



    let data = JSON.parse(this.storage.getItem('cartItem'));

    if (data != null){
      this.cartItems = data;

      this.computeCartTotal();
    }

  }

  emptyCart(){
    this.cartItems = [];
    this.computeCartTotal()
  }
  persistCartItem(){
    this.storage.setItem('cartItem', JSON.stringify(this.cartItems))
  }

  addToCart(theCartItem : CartItem) {
    //check if we have already the item
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined;


    if (this.cartItems.length > 0){
    //find the item in the card based on the item id

      /* for (let tempCartItem of this.cartItems){
      if (tempCartItem.id === theCartItem.id){
        existingCartItem = tempCartItem;
        break;
       }
      } */
      existingCartItem = this.cartItems.find( tempCartItem => tempCartItem.id === theCartItem.id);
      //check if we found it
      alreadyExistsInCart = (existingCartItem != undefined);

    }

    if (alreadyExistsInCart){
      //just increment the quantity
      existingCartItem.quantity++;
    }
    else {
      // add the new item the array
      this.cartItems.push(theCartItem);
    }

    //compute cart total price and quantity
    this.computeCartTotal();
  }

   computeCartTotal() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.unitPrice * currentCartItem.quantity;
      totalQuantityValue += currentCartItem.quantity;
    }
    //publish the values to all the subscribers
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue, totalQuantityValue);

    this.persistCartItem()
  }

  private logCartData(totalPriceValue: number, totalQuantityValue: number) {
   console.log('Contents of the cart :');
   for(let tempCartItem of this.cartItems){
     const subTotalPrice =tempCartItem.quantity * tempCartItem.unitPrice;
     console.log(`name: ${tempCartItem.name}, quantity: ${tempCartItem.quantity}, unitPrice: ${tempCartItem.unitPrice}`);
   }

   console.log(`totalPrice : ${totalPriceValue.toFixed(2)}, totalQuantity : ${totalQuantityValue} `);
   console.log('----');
  }

  remove(tempCartItem: CartItem) {
    //get index of item in the array
    const indexid = this.cartItems.findIndex(theCartItem => theCartItem.id === tempCartItem.id);

    //if found, remove item from the array at the given position
    if (indexid > -1){
      this.cartItems.splice(indexid, 1);
    this.computeCartTotal();
  }
  }

  decrementQuantity(tempCartItem: CartItem) {
    tempCartItem.quantity --;
    if(tempCartItem.quantity == 0){
      this.remove(tempCartItem);
    }
    else {
      this.computeCartTotal();
    }
  }
}
