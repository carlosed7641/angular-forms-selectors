import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CountriesService {

  private baseURL: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] =
    [
      Region.Africa,
      Region.Americas,
      Region.Asia,
      Region.Europe,
      Region.Oceania
    ]

  constructor(
    private http: HttpClient
  ) { }

  get regions(): Region[] {
    return [...this._regions];
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {

    if (!region) return of([]);

    const url: string = `${this.baseURL}/region/${region}?fields=cca3,name,borders`;

    return this.http.get<Country[]>(url)
      .pipe(
        map(countries => countries.map(country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))),

      )
  }

  getCountryByCode(cca3: string): Observable<SmallCountry> {

    const url: string = `${this.baseURL}/alpha/${cca3}?fields=cca3,name,borders`;

    return this.http.get<Country>(url)
      .pipe(
        map(country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))
      )
  }

  getCountryBordersByCode(borders: string[]): Observable<SmallCountry[]> {

    if (!borders || !borders.length) return of([])

    const countryRequest: Observable<SmallCountry>[] = []

    borders.forEach(code => {
      const request = this.getCountryByCode(code)
      countryRequest.push(request)
    })

    return combineLatest(countryRequest)


  }

}
