import { Component, OnInit, Input } from '@angular/core';

import {FormControl} from '@angular/forms';

import { Validation } from '../../global/validation';

@Component({
  selector: 'custom-validator',
  templateUrl: './custom-validator.component.html'
})
export class CustomValidatorComponent implements OnInit {
  @Input() type: string;
  @Input() data: any;

  constructor() { }

  ngOnInit() {
    console.log('data: ', this.data)
  }

  get message() {

    if (!this.data) return '';

    let utils = Validation.utils();
    let regex = utils[this.type];
    const isValid = this.data.match(regex);

    if (!isValid) {
      return  Validation.getValidatorErrorMessage({validatorProp: this.type});
    } else return '';

  }
}