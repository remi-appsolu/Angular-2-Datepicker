"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require("@angular/core");
const animations_1 = require("@angular/animations");
const forms_1 = require("@angular/forms");
const calendar_1 = require("./calendar");
const moment = require("moment");
let DatepickerComponent = class DatepickerComponent {
    constructor(renderer, elementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.DEFAULT_FORMAT = 'YYYY-MM-DD';
        this.dateChange = new core_1.EventEmitter();
        this.placeholder = 'Select a date';
        this.cancelText = 'Cancel';
        this.weekStart = 0;
        this.onSelect = new core_1.EventEmitter();
        this.dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        this.dateFormat = this.DEFAULT_FORMAT;
        this.showCalendar = false;
        this.colors = {
            'black': '#333333',
            'blue': '#1285bf',
            'lightGrey': '#f1f1f1',
            'white': '#ffffff'
        };
        this.accentColor = this.colors['blue'];
        this.altInputStyle = false;
        this.updateDayNames();
        this.months = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', ' December'
        ];
        this.clickListener = renderer.listenGlobal('document', 'click', (event) => this.handleGlobalClick(event));
        this.yearControl = new forms_1.FormControl('', forms_1.Validators.compose([
            forms_1.Validators.required,
            forms_1.Validators.maxLength(4),
            this.yearValidator,
            this.inRangeValidator.bind(this)
        ]));
    }
    get date() { return this.dateVal; }
    ;
    set date(val) {
        this.dateVal = val;
        this.dateChange.emit(val);
    }
    ngOnInit() {
        this.updateDayNames();
        this.syncVisualsWithDate();
    }
    ngOnChanges(changes) {
        if ((changes['date'] || changes['dateFormat'])) {
            this.syncVisualsWithDate();
        }
        if (changes['firstDayOfTheWeek'] || changes['dayNames']) {
            this.updateDayNames();
        }
    }
    ngOnDestroy() {
        this.clickListener();
    }
    closeCalendar() {
        this.showCalendar = false;
        this.syncVisualsWithDate();
    }
    setCurrentValues(date) {
        this.currentMonthNumber = date.getMonth();
        this.currentMonth = this.months[this.currentMonthNumber];
        this.currentYear = date.getFullYear();
        this.yearControl.setValue(this.currentYear);
        const calendarArray = this.calendar.monthDays(this.currentYear, this.currentMonthNumber);
        this.calendarDays = [].concat.apply([], calendarArray);
        this.calendarDays = this.filterInvalidDays(this.calendarDays);
    }
    updateDayNames() {
        this.dayNamesOrdered = this.dayNames.slice();
        if (this.weekStart < 0 || this.weekStart >= this.dayNamesOrdered.length) {
            throw Error(`The weekStart is not in range between ${0} and ${this.dayNamesOrdered.length - 1}`);
        }
        else {
            this.calendar = new calendar_1.Calendar(this.weekStart);
            this.dayNamesOrdered = this.dayNamesOrdered.slice(this.weekStart, this.dayNamesOrdered.length)
                .concat(this.dayNamesOrdered.slice(0, this.weekStart));
        }
    }
    syncVisualsWithDate() {
        if (this.date) {
            this.setInputText(this.date);
            this.setCurrentValues(this.date);
        }
        else {
            this.inputText = '';
            this.setCurrentValues(new Date());
        }
    }
    setCurrentMonth(monthNumber) {
        this.currentMonth = this.months[monthNumber];
        const calendarArray = this.calendar.monthDays(this.currentYear, this.currentMonthNumber);
        this.calendarDays = [].concat.apply([], calendarArray);
        this.calendarDays = this.filterInvalidDays(this.calendarDays);
    }
    setCurrentYear(year) {
        this.currentYear = year;
        this.yearControl.setValue(year);
    }
    setInputText(date) {
        let inputText = "";
        const dateFormat = this.dateFormat;
        if (dateFormat === undefined || dateFormat === null) {
            inputText = moment(date).format(this.DEFAULT_FORMAT);
        }
        else if (typeof dateFormat === 'string') {
            inputText = moment(date).format(dateFormat);
        }
        else if (typeof dateFormat === 'function') {
            inputText = dateFormat(date);
        }
        this.inputText = inputText;
    }
    onArrowClick(direction) {
        const currentMonth = this.currentMonthNumber;
        let newYear = this.currentYear;
        let newMonth;
        if (direction === 'left') {
            if (currentMonth === 0) {
                newYear = this.currentYear - 1;
                newMonth = 11;
            }
            else {
                newMonth = currentMonth - 1;
            }
        }
        else if (direction === 'right') {
            if (currentMonth === 11) {
                newYear = this.currentYear + 1;
                newMonth = 0;
            }
            else {
                newMonth = currentMonth + 1;
            }
        }
        let newDate = new Date(newYear, newMonth);
        let newDateValid;
        if (direction === 'left') {
            newDateValid = !this.rangeStart || newDate.getTime() >= this.rangeStart.getTime();
        }
        else if (direction === 'right') {
            newDateValid = !this.rangeEnd || newDate.getTime() <= this.rangeEnd.getTime();
        }
        if (newDateValid) {
            this.setCurrentYear(newYear);
            this.currentMonthNumber = newMonth;
            this.setCurrentMonth(newMonth);
            this.triggerAnimation(direction);
        }
    }
    isDateValid(date) {
        return (!this.rangeStart || date.getTime() >= this.rangeStart.getTime()) &&
            (!this.rangeEnd || date.getTime() <= this.rangeEnd.getTime());
    }
    filterInvalidDays(calendarDays) {
        let newCalendarDays = [];
        calendarDays.forEach((day) => {
            if (day === 0 || !this.isDateValid(day)) {
                newCalendarDays.push(0);
            }
            else {
                newCalendarDays.push(day);
            }
        });
        return newCalendarDays;
    }
    onCancel() {
        this.closeCalendar();
    }
    onInputClick() {
        this.showCalendar = !this.showCalendar;
    }
    onSelectDay(day) {
        if (this.isDateValid(day)) {
            this.date = day;
            this.onSelect.emit(day);
            this.showCalendar = !this.showCalendar;
        }
    }
    onYearSubmit() {
        if (this.yearControl.valid && +this.yearControl.value !== this.currentYear) {
            this.setCurrentYear(+this.yearControl.value);
            this.setCurrentMonth(this.currentMonthNumber);
        }
        else {
            this.yearControl.setValue(this.currentYear);
        }
    }
    handleGlobalClick(event) {
        const withinElement = this.elementRef.nativeElement.contains(event.target);
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.closeCalendar();
        }
    }
    getDayBackgroundColor(day) {
        let color = this.colors['white'];
        if (this.isChosenDay(day)) {
            color = this.accentColor;
        }
        else if (this.isCurrentDay(day)) {
            color = this.colors['lightGrey'];
        }
        return color;
    }
    getDayFontColor(day) {
        let color = this.colors['black'];
        if (this.isChosenDay(day)) {
            color = this.colors['white'];
        }
        return color;
    }
    isChosenDay(day) {
        if (day) {
            return this.date ? day.toDateString() === this.date.toDateString() : false;
        }
        else {
            return false;
        }
    }
    isCurrentDay(day) {
        if (day) {
            return day.toDateString() === new Date().toDateString();
        }
        else {
            return false;
        }
    }
    isHoveredDay(day) {
        return this.hoveredDay ? this.hoveredDay === day && !this.isChosenDay(day) : false;
    }
    triggerAnimation(direction) {
        this.animate = direction;
        setTimeout(() => this.animate = 'reset', 185);
    }
    inRangeValidator(control) {
        const value = control.value;
        if (this.currentMonthNumber) {
            const tentativeDate = new Date(+value, this.currentMonthNumber);
            if (this.rangeStart && tentativeDate.getTime() < this.rangeStart.getTime()) {
                return { 'yearBeforeRangeStart': true };
            }
            if (this.rangeEnd && tentativeDate.getTime() > this.rangeEnd.getTime()) {
                return { 'yearAfterRangeEnd': true };
            }
            return null;
        }
        return { 'currentMonthMissing': true };
    }
    yearValidator(control) {
        const value = control.value;
        const valid = !isNaN(value) && value >= 1970 && Math.floor(value) === +value;
        if (valid) {
            return null;
        }
        return { 'invalidYear': true };
    }
};
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], DatepickerComponent.prototype, "dateChange", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Date),
    __metadata("design:paramtypes", [])
], DatepickerComponent.prototype, "date", null);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], DatepickerComponent.prototype, "disabled", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], DatepickerComponent.prototype, "accentColor", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], DatepickerComponent.prototype, "altInputStyle", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], DatepickerComponent.prototype, "dateFormat", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], DatepickerComponent.prototype, "fontFamily", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Date)
], DatepickerComponent.prototype, "rangeStart", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Date)
], DatepickerComponent.prototype, "rangeEnd", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], DatepickerComponent.prototype, "placeholder", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], DatepickerComponent.prototype, "inputText", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], DatepickerComponent.prototype, "showCalendar", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], DatepickerComponent.prototype, "cancelText", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], DatepickerComponent.prototype, "weekStart", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], DatepickerComponent.prototype, "onSelect", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], DatepickerComponent.prototype, "calendarDays", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], DatepickerComponent.prototype, "currentMonth", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], DatepickerComponent.prototype, "dayNames", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Date)
], DatepickerComponent.prototype, "hoveredDay", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], DatepickerComponent.prototype, "months", void 0);
DatepickerComponent = __decorate([
    core_1.Component({
        selector: 'material-datepicker',
        animations: [
            animations_1.trigger('calendarAnimation', [
                animations_1.transition('* => left', [
                    animations_1.animate(180, animations_1.keyframes([
                        animations_1.style({ transform: 'translateX(105%)', offset: 0.5 }),
                        animations_1.style({ transform: 'translateX(-130%)', offset: 0.51 }),
                        animations_1.style({ transform: 'translateX(0)', offset: 1 })
                    ]))
                ]),
                animations_1.transition('* => right', [
                    animations_1.animate(180, animations_1.keyframes([
                        animations_1.style({ transform: 'translateX(-105%)', offset: 0.5 }),
                        animations_1.style({ transform: 'translateX(130%)', offset: 0.51 }),
                        animations_1.style({ transform: 'translateX(0)', offset: 1 })
                    ]))
                ])
            ])
        ],
        styles: [
            `.datepicker {
        position: relative;
        display: inline-block;
        color: #2b2b2b;
        font-family: 'Helvetica Neue', 'Helvetica', 'Arial', 'Calibri', 'Roboto';
      }

      .datepicker__calendar {
        position: absolute;
        overflow: hidden;
        z-index: 1000;
        top: 1.9em;
        left: 0;
        height: 23.8em;
        width: 20.5em;
        font-size: 14px;
        background-color: #ffffff;
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        cursor: default;
        -webkit-touch-callout: none;
          -webkit-user-select: none;
             -moz-user-select: none;
              -ms-user-select: none;
                  user-select: none;
      }

      .datepicker__calendar__cancel {
        position: absolute;
        bottom: 1em;
        left: 1.8em;
        color: #d8d8d8;
        cursor: pointer;
        -webkit-transition: 0.37s;
        transition: 0.37s;
      }

      .datepicker__calendar__cancel:hover {
        color: #b1b1b1;
      }

      .datepicker__calendar__content {
        margin-top: 0.4em;
      }

      .datepicker__calendar__labels {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: center;
           -ms-flex-pack: center;
         justify-content: center;
        width: 100%;
      }

      .datepicker__calendar__label {
        display: inline-block;
        width: 2.2em;
        height: 2.2em;
        margin: 0 0.2em;
        line-height: 2.2em;
        text-align: center;
        color: #d8d8d8;
      }

      .datepicker__calendar__month {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-flow: wrap;
            flex-flow: wrap;
        -webkit-box-pack: center;
           -ms-flex-pack: center;
         justify-content: center;
      }

      .datepicker__calendar__month__day {
        display: inline-block;
        width: 2.2em;
        height: 2.2em;
        margin: 0 0.2em 0.4em;
        border-radius: 2.2em;
        line-height: 2.2em;
        text-align: center;
        -webkit-transition: 0.37s;
        transition: 0.37s;
      }

      .datepicker__calendar__nav {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: center;
           -ms-flex-pack: center;
         justify-content: center;
        -webkit-box-align: center;
           -ms-flex-align: center;
              align-items: center;
        height: 3em;
        background-color: #fff;
        border-bottom: 1px solid #e8e8e8;
      }

      .datepicker__calendar__nav__arrow {
        width: 0.8em;
        height: 0.8em;
        cursor: pointer;
        -webkit-transition: 0.37s;
        transition: 0.37s;
      }

      .datepicker__calendar__nav__arrow:hover {
        -webkit-transform: scale(1.05);
                transform: scale(1.05);
      }

      .datepicker__calendar__nav__chevron {
        fill: #bbbbbb;
        -webkit-transition: 0.37s;
        transition: 0.37s;
      }

      .datepicker__calendar__nav__chevron:hover {
        fill: #2b2b2b;
      }

      .datepicker__calendar__nav__header {
        width: 11em;
        margin: 0 1em;
        text-align: center;
      }

      .datepicker__calendar__nav__header__form {
        display: inline-block;
        margin: 0;
      }

      .datepicker__calendar__nav__header__year {
        display: inline-block;
        width: 3em;
        padding: 2px 4px;
        border: 1px solid #ffffff;
        border-radius: 2px;
        font-size: 1em;
        transition: 0.32s;
      }

      .datepicker__calendar__nav__header__year:focus.ng-invalid {
        border: 1px solid #e82525;
      }

      .datepicker__calendar__nav__header__year:focus.ng-valid {
        border: 1px solid #13ad13;
      }

      .datepicker__calendar__nav__header__year:focus {
        outline: none;
      }

      .datepicker__input {
        outline: none;
        border-radius: 0.1rem;
        padding: .2em .6em;
        font-size: 14px;
      }
    `
        ],
        template: `
    <div
      class="datepicker"
      [ngStyle]="{'font-family': fontFamily}"
    >
      <input
        [disabled]="disabled"
        class="datepicker__input"
        [placeholder]="placeholder"
        [ngStyle]="{'color': altInputStyle ? colors['white'] : colors['black'],
                    'background-color': altInputStyle ? accentColor : colors['white'],
                    'border': altInputStyle ? '' : '1px solid #dadada'}"
        (click)="onInputClick()"
        [(ngModel)]="inputText"
        readonly="true"
      >
      <div
        class="datepicker__calendar"
        *ngIf="showCalendar"
      >
        <div class="datepicker__calendar__nav">
          <div
            class="datepicker__calendar__nav__arrow"
            (click)="onArrowClick('left')"
          >
          <svg class="datepicker__calendar__nav__chevron" x="0px" y="0px" viewBox="0 0 50 50">
            <g>
              <path d="M39.7,7.1c0.5,0.5,0.5,1.2,0,1.7L29,19.6c-0.5,0.5-1.2,1.2-1.7,1.7L16.5,32.1c-0.5,0.5-1.2,0.5-1.7,0l-2.3-2.3
                    c-0.5-0.5-1.2-1.2-1.7-1.7l-2.3-2.3c-0.5-0.5-0.5-1.2,0-1.7l10.8-10.8c0.5-0.5,1.2-1.2,1.7-1.7L31.7,0.8c0.5-0.5,1.2-0.5,1.7,0
                    l2.3,2.3c0.5,0.5,1.2,1.2,1.7,1.7L39.7,7.1z"/>
            </g>
            <g>
              <path d="M33.4,49c-0.5,0.5-1.2,0.5-1.7,0L20.9,38.2c-0.5-0.5-1.2-1.2-1.7-1.7L8.4,25.7c-0.5-0.5-0.5-1.2,0-1.7l2.3-2.3
                    c0.5-0.5,1.2-1.2,1.7-1.7l2.3-2.3c0.5-0.5,1.2-0.5,1.7,0l10.8,10.8c0.5,0.5,1.2,1.2,1.7,1.7l10.8,10.8c0.5,0.5,0.5,1.2,0,1.7
                    L37.4,45c-0.5,0.5-1.2,1.2-1.7,1.7L33.4,49z"/>
            </g>
          </svg>
          </div>
          <div class="datepicker__calendar__nav__header">
            <span>{{ currentMonth }}</span>
            <input
              #yearInput
              class="datepicker__calendar__nav__header__year"
              placeholder="Year"
              [formControl]="yearControl"
              (keyup.enter)="yearInput.blur()"
              (blur)="onYearSubmit()"
            />
          </div>
          <div
            class="datepicker__calendar__nav__arrow"
            (click)="onArrowClick('right')"
          >
            <svg class="datepicker__calendar__nav__chevron" x="0px" y="0px" viewBox="0 0 50 50">
              <g>
                <path d="M8.4,7.1c-0.5,0.5-0.5,1.2,0,1.7l10.8,10.8c0.5,0.5,1.2,1.2,1.7,1.7l10.8,10.8c0.5,0.5,1.2,0.5,1.7,0l2.3-2.3
                    c0.5-0.5,1.2-1.2,1.7-1.7l2.3-2.3c0.5-0.5,0.5-1.2,0-1.7L29,13.2c-0.5-0.5-1.2-1.2-1.7-1.7L16.5,0.8c-0.5-0.5-1.2-0.5-1.7,0
                    l-2.3,2.3c-0.5,0.5-1.2,1.2-1.7,1.7L8.4,7.1z"/>
              </g>
              <g>
                <path d="M14.8,49c0.5,0.5,1.2,0.5,1.7,0l10.8-10.8c0.5-0.5,1.2-1.2,1.7-1.7l10.8-10.8c0.5-0.5,0.5-1.2,0-1.7l-2.3-2.3
                    c-0.5-0.5-1.2-1.2-1.7-1.7l-2.3-2.3c-0.5-0.5-1.2-0.5-1.7,0L20.9,28.5c-0.5,0.5-1.2,1.2-1.7,1.7L8.4,40.9c-0.5,0.5-0.5,1.2,0,1.7
                    l2.3,2.3c0.5,0.5,1.2,1.2,1.7,1.7L14.8,49z"/>
              </g>
            </svg>
          </div>
        </div>
        <div
          class="datepicker__calendar__content"
        >
          <div class="datepicker__calendar__labels">
            <div
              class="datepicker__calendar__label"
              *ngFor="let day of dayNamesOrdered"
            >
              {{ day }}
            </div>
          </div>
          <div
            [@calendarAnimation]="animate"
            class="datepicker__calendar__month"
          >
            <div
              *ngFor="let day of calendarDays"
              class="datepicker__calendar__month__day"
              [ngStyle]="{'cursor': day == 0 ? 'initial' : 'pointer',
                          'background-color': getDayBackgroundColor(day),
                          'color': isHoveredDay(day) ? accentColor : getDayFontColor(day),
                          'pointer-events': day == 0 ? 'none' : ''
                          }"
              (click)="onSelectDay(day)"
              (mouseenter)="hoveredDay = day"
              (mouseleave)="hoveredDay = null"
            >
              <span *ngIf="day != 0">
                {{ day.getDate() }}
              </span>
            </div>
          </div>
          <div
            class="datepicker__calendar__cancel"
            (click)="onCancel()"
          >
            {{cancelText}}
          </div>
        </div>
      </div>
    </div>
    `
    }),
    __metadata("design:paramtypes", [core_1.Renderer, core_1.ElementRef])
], DatepickerComponent);
exports.DatepickerComponent = DatepickerComponent;
//# sourceMappingURL=datepicker.component.js.map