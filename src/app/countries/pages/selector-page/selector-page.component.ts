import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html'
})
export class SelectorPageComponent implements OnInit {


  countriesByRegion: SmallCountry[] = [];
  borders: SmallCountry[] = [];

  myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    borders: ['', Validators.required]
  })

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) { }

  ngOnInit(): void {
    this.onRegionChange();
    this.onCountryChange();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChange(): void {
    this.myForm.get('region')?.valueChanges
      .pipe(
        tap(() => this.myForm.get('country')?.setValue('')),
        tap(() => this.borders = []),
        switchMap(region => this.countriesService.getCountriesByRegion(region))
      ).subscribe(countries => {
        this.countriesByRegion = countries;
      })
  }

  onCountryChange(): void {
    this.myForm.get('country')?.valueChanges
      .pipe(
        tap(() => this.myForm.get('borders')?.setValue('')),
        filter(value => value.length > 0),
        switchMap(alphaCode => this.countriesService.getCountryByCode(alphaCode)),
        switchMap(country => this.countriesService.getCountryBordersByCode(country.borders))
      ).subscribe(country => {
        this.borders = country;
      })
  }
}
