import {FormControl, ValidationErrors} from "@angular/forms";

export class Luv2shopValidators {

       static notOnlyWhitespace(control : FormControl): ValidationErrors {

         //check if sting contains only white spaces

         if ((control.value != null) && (control.value.trim().length === 0)){
           return {'notOnlyWhitespace': true};
         }

         else {
           return null;
         }


           }

}
