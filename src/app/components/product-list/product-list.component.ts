import { Component, OnInit } from '@angular/core';
import {ProductService} from "../../services/product.service";
import {Product} from "../../common/product";
import {ActivatedRoute} from "@angular/router";
import {CartItem} from "../../common/cart-item";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  //templateUrl: './product-list-table.component.html',
  //templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number=1;
  searchMode: boolean = false;


  //new properties for pagination
  thePageNumber: number=1;
  thePageSize: number=10;
  theTotalElements: number=0;
  previousKeyWord: string = null;

  constructor(private productService: ProductService,private cartService : CartService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProduct();
    });
  }

  listProduct() {
this.searchMode = this.route.snapshot.paramMap.has('keyword');

if (this.searchMode) {
this.handleSearchProducts();
}
else {
  this.handleListProducts();
}
  }

  handleSearchProducts(){

    const theKeyword: string = this.route.snapshot.paramMap.get('keyword');

    if(this.previousKeyWord != theKeyword){
      this.thePageNumber = 1;
    }
    this.previousKeyWord = theKeyword;

    this.productService.searchProductPaginate(this.thePageNumber - 1,
                                                       this.thePageSize,
                                                       theKeyword).subscribe(this.processResult());
    //this.productService.searchProducts(theKeyword).subscribe(
      //data =>{ this.products = data;}
    //)

}
  handleListProducts() {
    //check if the id parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {

      //get the id paramstring, convert it to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id');
    } else {
      //not category id available. default is category 1
      this.currentCategoryId = 1;
    }

    //
    //check if we have a different category than previous
    //Note: Angular will reuse a component if it is currently being viewed
    //
    // if we have a different category id than previous
    //then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);
    this.productService.getProductListPaginate(this.thePageNumber - 1,
                                                       this.thePageSize,
                                                       this.currentCategoryId)
                                                        .subscribe(this.processResult());


    //now get the products for the given category id
   /* this.productService.getProductList(this.currentCategoryId).subscribe(
      data => {
        this.products = data;
      }
    ) */
  }

  private processResult() {
    return data => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;

    };
  }

  updatePagesize(value: number) {
    this.thePageSize = value;
    this.thePageNumber=1;
    this.listProduct();

  }

  addToCart(theProduct: Product) {
    console.log(`Adding to cart  : ${theProduct.name}, ${theProduct.unitPrice} `);
    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);

  }


}
