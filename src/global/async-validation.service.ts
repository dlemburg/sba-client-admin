import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { API, ROUTES } from './api.service';

@Injectable()
export class AsyncValidation {

// had to allow inheritance (no static methods) to work with my existing API service
constructor(private API: API) { }

    public isEmailNotUniqueAsync(control: FormControl): any {
        return (control: FormControl) => {
            const email = control.value;
            return this.API.stack(ROUTES.getEmailUnique + `/${email}`, "GET")
                .subscribe(
                    (response) => {
                        if (response.data.isUnique) {
                            return null;
                        } else return {isEmailNotUnique: true, options: "Email"}
                    }, (err) => {
                        console.log(err);
                        return null;
                    });
        }
    }

    public isNameNotUniqueAsync(table: string): any {
        return (control: FormControl) => {

            return this.API.stack(ROUTES.getNameUniqueOwner + `/${table}/${control.value}`, "GET")
                .subscribe(
                    (response) => {
                        if (response.data.isUnique) {
                            return null;
                        } else return {isNameNotUnique: true, options: table}
                    }, (err) => {
                        console.log(err);
                        return null;
                    });
        }
    }

    public isNameNotUniqueEditAsync(table: string, originalValue: string): any {
        return (control: FormControl) => {
            // originalValue must have value and not equal the current control.value (b/c on edit, name will always match first value)
            debugger;
            if (originalValue !== null && control.value !== originalValue) {
                return this.API.stack(ROUTES.getNameUniqueOwner + `/${table}/${control.value}`, "GET")
                    .subscribe(
                        (response) => {
                            if (response.data.isUnique) {
                                return null;
                            } else return {isNameNotUnique: true, options: table}
                        }, (err) => {
                            console.log(err);
                            return null;
                        });
            }
        }
    }
}