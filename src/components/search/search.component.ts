import { Component } from '@angular/core';

import { FormControl} from '@angular/forms'

@Component({
  selector: 'my-search',
  templateUrl: './search.component.html',
})

// <input type="search" [formControl]="seachControl">
// use [formControl] when no parent <form></form>  needed
export class SearchComponent {
  constructor() {}
  //searchControl = new FormControl();

/* inside ionViewDidEnter()
    this.searchControl.valueChanges.subscribe(value => {
      // do something with value here
    });
*/
}