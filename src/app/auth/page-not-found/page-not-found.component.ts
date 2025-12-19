import { Component } from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {

  constructor(private _location: Location) 
  {}

  backClicked() {
    this._location.back();
  }

}
