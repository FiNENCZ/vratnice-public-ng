import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgForm } from '@angular/forms';
import { isSvatek } from '../../functions/svatky.function';


export const CALENDAR_COMPONENT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CalendarComponent),
  multi: true
};

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  providers: [CALENDAR_COMPONENT_VALUE_ACCESSOR],
  styleUrls: []
})

export class CalendarComponent implements ControlValueAccessor {

  @Input() idCalendar!: string;
  @Input() labelText!: string;
  @Input() validatorMessageText?: string;  
  @Input() showButtonBar: boolean = true;
  @Input() hideLabel: boolean = false;
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;
  @Input() showSvatky: boolean = false;
  @Input() showTime: boolean = false;
  @Input() timeOnly: boolean = false;
  @Input() yearOnly: boolean = false;
  @Input() defaultDate: Date = new Date();
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() form?: NgForm;
  @Output() onBlurEvent = new EventEmitter<any>();
  @Output() onSelectEvent = new EventEmitter<any>();

  @Input() hodnota!: any;

  isSvatek = isSvatek;

  constructor() { }

  private _onChange = (value: any | null) => undefined;
  public registerOnChange(fn: (value: any | null) => undefined): void {
    this._onChange = fn;
  }

  private _onTouched = () => undefined;
  public registerOnTouched(fn: () => undefined): void {
    this._onTouched = fn;
  }

  writeValue(value: any): void {
    //console.log("writeValue", value);
    this.hodnota = value;
    //this._onChange(value);
  }

  setDisabledState?(isDisabled: boolean): void {

  }

  protected modelChange(value: any) {
    //console.log("modelChange", value);
    //this.hodnotaChange?.emit(value);
    this.writeValue(value);
    this._onChange(value);
    //this.onChangeEvent?.emit(value);
  }

  protected onChange(event: any) {
    this._onChange(event.value);
  }

  protected obBlur(event: any) {
    this.onBlurEvent?.emit(event.value);
  }

  protected onSelect(event: any) {
    this.onSelectEvent?.emit(event.value);
  }
}
