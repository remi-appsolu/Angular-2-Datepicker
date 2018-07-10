import { CommonModule }   from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { DatepickerComponent } from './datepicker.component';
import {MatIconModule} from '@angular/material';
//import {MaterialModule} from '@angular/material';


export * from './datepicker.component';

@NgModule({
  declarations: [ DatepickerComponent ],
  exports: [ DatepickerComponent ],
  imports: [ CommonModule, FormsModule, ReactiveFormsModule,
     //MaterialModule, 
    MatIconModule,
 ]
})
export class DatepickerModule { }
