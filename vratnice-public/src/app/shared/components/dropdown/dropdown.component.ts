import { Component, EventEmitter, forwardRef, Input, Output, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NgForm, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Dropdown } from 'primeng/dropdown';
import { Observable } from 'rxjs';
//import { dropdownShowScrollFunction } from '../../functions/dropdown-show-scroll.function';

export const DROPDOWN_COMPONENT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DropdownComponent),
  multi: true
};

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  providers: [DROPDOWN_COMPONENT_VALUE_ACCESSOR],
  styleUrls: ['dropdown.component.css']
})

export class DropdownComponent implements ControlValueAccessor {

  @Input() idDropdown!: string;
  @Input() labelText!: string;
  @Input() dataKey!: string;
  @Input() optionLabel!: string;
  @Input() placeholderText?: string;
  @Input() validatorMessageText?: string;
  @Input() divFormLabelGroupClass?: string;
  @Input() pouzeDropdown: boolean = false;
  @Input() filter: boolean = false;
  @Input() required: boolean = false;
  @Input() showClear: boolean = false;  
  @Input() readonly: boolean = false;
  @Input() readonlyCiselnik: boolean = false;
  @Input() virtualScroll: boolean = false;
  @Input() readOnlyTxt?: string;
  @Input() form?: NgForm;
  @Input() filterBy?: string;
  @Input() filterFields?: string[];
  @Input() valuesObservable!: Observable<any[] | any>;
  @Input() values?: any[];
  @Input() nacitani: boolean = false;
  @Input() selectedTemplate?: TemplateRef<any>;
  @Input() itemTemplate?: TemplateRef<any>;
  @Output() onChangeEvent = new EventEmitter<any>();

  @Input() hodnota!: any;
  //@Output() valueChange = new EventEmitter<any>();

  protected readonly virtualScrollItemSize = 37;

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
    this.onChangeEvent?.emit(value);
  }

  protected onChange(event: any) {
    this._onChange(event.value);
  }

  protected filterKeyUp(event: KeyboardEvent, options: any, dropdown: Dropdown) {
    //console.log(event, options, dropdown, dropdown.options, (dropdown as any).optionsToDisplay , event.code);
    if (event.code == "Enter" || event.code == 'NumpadEnter') {
      const optionIndex = dropdown.focusedOptionIndex() !== -1 ? dropdown.findNextOptionIndex(dropdown.focusedOptionIndex()) : dropdown.findFirstFocusedOptionIndex();
      //console.log(optionIndex);
      if (optionIndex == 0) {
        dropdown.changeFocusedOptionIndex(event, optionIndex);
      }
      //dropdown.onArrowDownKey(event);
      //if (dropdown.optionsToDisplay && dropdown.optionsToDisplay.length > 0) {
      //   //Pokud ve výsledném poli není vybraná hodnota nastavím do hodnoty první - když se vybere šipkami nahoru dolu tak hodnota zůstává
      //   if (!dropdown.optionsToDisplay.includes(dropdown.selectedOption)){
      //     dropdown.selectItem(event, dropdown.optionsToDisplay[0])
      //   }
      //}
      //event.preventDefault();
      // event.stopImmediatePropagation();
      // event.stopPropagation();
      //dropdown.hide();
    }
  }

  protected onShow(event: any) {
    let filtrInputText = event?.overlay?.lastElementChild?.querySelector('.p-dropdown-filter.p-inputtext.p-component');
    filtrInputText?.focus();
    //dropdownShowScrollFunction(event);
  }

  protected onHide(event: any, dropdown: Dropdown) {
    //console.log("hide2", event, dropdown);
    //dropdown.focus();
  }


}
