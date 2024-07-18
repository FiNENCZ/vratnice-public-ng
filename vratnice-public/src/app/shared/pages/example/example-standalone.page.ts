import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputFloatLabelComponent } from './input-float-label/input-float-label.component';
import { CalendarComponent } from '../../components/calendar/calendar-standalone.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-example-page',  
  templateUrl: './example-standalone.page.html',
  standalone: true,
  imports:[CommonModule, FormsModule, InputTextModule, DropdownModule, MultiSelectModule, AutoCompleteModule, CalendarModule, 
    TranslateModule, InputTextareaModule, InputNumberModule, TooltipModule, CalendarComponent, InputFloatLabelComponent]
})

export class ExampleStandalonePage {
  inputText: string = "";
  value?: string;
  cislo?: number;
  datum?: Date;
  heslo?: string;
  hesloVisible: boolean = false;

  cities: City[] | undefined;
  selectedCity: City | undefined;
  selectedCities: City[] | undefined;
  countries: any[] | undefined;
  selectedCountry: any | undefined;

  selectedItem: any;
  selectedItems: any[] | undefined;
  suggestions: any[] | undefined;

  // webSocketAPI?: WebSocketAPI;
  greeting: any;
  name?: string;

  constructor(
    //private readonly greetingRestControllerService: GreetingRestControllerService,
    //private readonly websocketService: WebsocketService
  ) { }

  ngOnInit() {
    // this.webSocketAPI = new WebSocketAPI();
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' }
    ];
    this.countries = [
      { name: 'Australia', code: 'AU' },
      { name: 'Brazil', code: 'BR' },
      { name: 'China', code: 'CN' },
      { name: 'Egypt', code: 'EG' },
      { name: 'France', code: 'FR' },
      { name: 'Germany', code: 'DE' },
      { name: 'India', code: 'IN' },
      { name: 'Japan', code: 'JP' },
      { name: 'Spain', code: 'ES' },
      { name: 'United States', code: 'US' }
    ];
  }

  search(event: AutoCompleteCompleteEvent) {
    this.suggestions = [...Array(10).keys()].map(item => event.query + '-' + item);
  }

  connect() {
    // this.webSocketAPI?._connect(this);
  }

  disconnect() {
    // this.webSocketAPI?._disconnect();
  }

  sendMessage() {
    // this.webSocketAPI?._send(this.name);
  }

  handleMessage(message: any) {
    console.log("handle Message", message);
    this.greeting = message;
  }

  volaniMetody() {
    //this.greetingRestControllerService.detailGreetingRest().subscribe();
  }

}
