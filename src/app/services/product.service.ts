import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Product} from "../common/product";
import {ProductCategory} from "../common/product-category";



@Injectable({
  providedIn: 'root'
})
export class ProductService {




  private baseUrl= 'http://localhost:8080/api/products';
  private categoryUrl= 'http://localhost:8080/api/product-category';


  constructor(private httpClient : HttpClient) {}


  getProductListPaginate(thePage:number,
                         thePageSize: number,
                         theCategoryId: number): Observable<GetResponseProducts>{
    // @TODO: need to build URLbased on category id  (after setting up the springboot

    const searchURL = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`
                      + `&page=${thePage}&size=${thePageSize}` ;


    return this.httpClient.get<GetResponseProducts>(searchURL);
  }

getProductList(theCategoryId:number): Observable<Product[]>{
    // @TODO: need to build URLbased on category id  (after setting up the springboot

  const searchURL = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
  return this.httpClient.get<GetResponseProducts>(searchURL).pipe(map(response => response._embedded.products));
    }

  searchProducts(theKeyword: string): Observable <Product[]> {
    const searchURL = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;
    return this.httpClient.get<GetResponseProducts>(searchURL).pipe(map(response => response._embedded.products));

  }

  searchProductPaginate(thePage:number,
                         thePageSize: number,
                         theKeyword : string): Observable<GetResponseProducts>{
    // @TODO: need to build URLbased on category id  (after setting up the springboot

    const searchURL = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
      + `&page=${thePage}&size=${thePageSize}` ;


    return this.httpClient.get<GetResponseProducts>(searchURL);
  }
  getProductCategories(): Observable<ProductCategory[]>{
    return this.httpClient.get<GetResponseProductsCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory));

  }
  getProduct(theProductId: number): Observable<Product> {
    //need to build a URL based on the productId
    const productUrl =`${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  }

}



interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page:{
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}
  interface GetResponseProductsCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }

}
