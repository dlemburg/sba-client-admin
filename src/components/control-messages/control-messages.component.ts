import { Component, Input, OnInit} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';

@Component({
  selector: 'control-messages',
  templateUrl: './control-messages.component.html'
})
export class ControlMessagesComponent implements OnInit {
  @Input() controlInstance: FormControl;  // form control has all kinds of methods and props
  @Input() isSubmitted: boolean;
  constructor(public validation: Validation) { }

  // two validation props:  
  // 1.) this.control.someFormName.valid
  // 2.) this.control.someFormName.errors
  /* in this component:
      console.log('this.controlInstance.errors: ', this.controlInstance.errors);
      console.log('this.controlInstance.valid: ', this.controlInstance.valid)
  */

 

  ngOnInit() {
     //console.log('inside onInit. this.control: ', this.controlInstance);   
  }


// options is prop that I set manually
  public get message() {
    if (this.controlInstance && this.controlInstance.errors) {
     // if (this.controlInstance.value === "" || this.controlInstance.value === undefined) return null;
    //  if (this.controlInstance.value === "" && !this.controlInstance.errors.hasOwnProperty('required') ) return false;
      for (let prop in this.controlInstance.errors) {
        if (this.controlInstance.errors.hasOwnProperty(prop) && prop !== 'options' && (this.controlInstance.touched || this.isSubmitted)) {
          let validatorOptions = this.controlInstance.errors['options'] || null;
          let args = {
            validatorProp: prop, 
            validatorValue: this.controlInstance.errors[prop],  // for min and max length
            validatorOptions                                     // prop that container custom info
          }
          let message = this.validation.getValidatorErrorMessage(args);

          return message;
        }
      }
    }
    return null;   // returning null means no error
  }

}