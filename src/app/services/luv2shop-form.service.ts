import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Country} from "../common/country";
import {map} from "rxjs/operators";
import {State} from "../common/state";
//import {Interface} from "readline";



@Injectable({
  providedIn: 'root'
})


export class Luv2shopFormService {
private countriesUrl = 'http://localhost:8080/api/countries';
private statesUrl = 'http://localhost:8080/api/states';

  constructor(private httpClient: HttpClient) { }

  getCountries() : Observable<Country[]> {

    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    );
  }


  getStates(CountryCode : String): Observable<State[]> {
    return this.httpClient.get<GetResponseStates>(`${this.statesUrl}/search/findByCountryCode?code=${CountryCode}`).pipe(
      map(response => response._embedded.states)
    );
  }


getCreditCardMonths(startmonth : number) : Observable<number[]>{

  let data : number[] = [];

  //build an array for "Month" drop down list
  // start as desired startMonth and loop until 12

  for (let theMonth = startmonth; theMonth <= 12; theMonth++){
    data.push(theMonth);
  }

  return of(data);
}

getCreditCardYear() : Observable<number[]>{
  let data : number[] = [];
  //build an array for "Year" dropdown list
  // start at current year and loop for next ten

  const startYear : number = new Date().getFullYear();
  const endYear : number = startYear + 10;

  for(let year = startYear; year<= endYear; year++){
    data.push(year)
  }
  return of(data);
}


}
interface GetResponseCountries {
  _embedded: {
    countries: Country[];
}

}

interface GetResponseStates {
  _embedded: {
    states: State[];
  }

}
