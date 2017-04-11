"use strict";
const testing_1 = require("@angular/core/testing");
const common_1 = require("@angular/common");
const forms_1 = require("@angular/forms");
const datepicker_component_1 = require("./datepicker.component");
describe('DatepickerComponent', () => {
    let comp;
    let fixture;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({
            declarations: [datepicker_component_1.DatepickerComponent],
            imports: [common_1.CommonModule, forms_1.FormsModule, forms_1.ReactiveFormsModule],
        });
        fixture = testing_1.TestBed.createComponent(datepicker_component_1.DatepickerComponent);
        comp = fixture.componentInstance;
    });
    it('should create component', () => expect(comp).toBeDefined());
    describe('yearValidator', () => {
        const expectedError = { 'invalidYear': true };
        let testControl;
        beforeEach(() => {
            testControl = new forms_1.FormControl('');
        });
        it('validates a valid year', () => {
            testControl.setValue(2015);
            expect(comp.yearValidator(testControl)).toEqual(null);
        });
        it('returns error when given invalid year', () => {
            testControl.setValue(1785);
            expect(comp.yearValidator(testControl)).toEqual(expectedError);
        });
        it('returns error when given a non number type', () => {
            testControl.setValue('abc');
            expect(comp.yearValidator(testControl)).toEqual(expectedError);
        });
    });
    describe('inRangeValidator', () => {
        let testControl;
        beforeEach(() => {
            testControl = new forms_1.FormControl('');
        });
        it('returns error when currentMonthNumber is absent', () => {
            testControl.setValue(2015);
            expect(comp.inRangeValidator(testControl)).toEqual({ 'currentMonthMissing': true });
        });
        it('returns error when rangeStart is set and year is before rangeStart', () => {
            comp.currentMonthNumber = 8;
            comp.rangeStart = new Date(2014, 1);
            testControl.setValue(2012);
            expect(comp.inRangeValidator(testControl)).toEqual({ 'yearBeforeRangeStart': true });
        });
        it('returns error when rangeEnd is set and year is after rangeEnd', () => {
            comp.currentMonthNumber = 8;
            comp.rangeEnd = new Date(2014, 1);
            testControl.setValue(2016);
            expect(comp.inRangeValidator(testControl)).toEqual({ 'yearAfterRangeEnd': true });
        });
        it('validates a valid year with no range set', () => {
            comp.currentMonthNumber = 8;
            testControl.setValue(2015);
            expect(comp.inRangeValidator(testControl)).toEqual(null);
        });
        it('validates a valid year with start and end range present', () => {
            comp.currentMonthNumber = 8;
            comp.rangeStart = new Date(2014, 1);
            comp.rangeEnd = new Date(2016, 1);
            testControl.setValue(2015);
            expect(comp.inRangeValidator(testControl)).toEqual(null);
        });
    });
    describe('setCurrentYear', () => {
        it('sets currentYear', () => {
            const year = 2014;
            comp.setCurrentYear(year);
            expect(comp.currentYear).toEqual(year);
        });
    });
    describe('setInputText', () => {
        it('sets correct inputText when dateFormat equals "YYYY-MM-DD"', () => {
            const day = new Date(2016, 3, 15);
            comp.dateFormat = 'YYYY-MM-DD';
            comp.setInputText(day);
            expect(comp.inputText).toEqual('2016-04-15');
        });
        it('sets correct inputText when dateFormat equals "MM-DD-YYYY"', () => {
            const day = new Date(2016, 3, 15);
            comp.dateFormat = 'MM-DD-YYYY';
            comp.setInputText(day);
            expect(comp.inputText).toEqual('04-15-2016');
        });
        it('sets correct inputText when dateFormat equals "DD-MM-YYYY"', () => {
            const day = new Date(2016, 3, 15);
            comp.dateFormat = 'DD-MM-YYYY';
            comp.setInputText(day);
            expect(comp.inputText).toEqual('15-04-2016');
        });
        it('sets correct inputText when dateFormat is a custom function', () => {
            const day = new Date(2016, 3, 15);
            const func = (date) => date.toString();
            comp.dateFormat = func;
            comp.setInputText(day);
            expect(comp.inputText).toEqual(day.toString());
        });
    });
});
//# sourceMappingURL=datepicker.component.spec.js.map