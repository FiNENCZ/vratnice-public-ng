import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'hodinyMinuty'
})
export class HodinyMinutyPipe implements PipeTransform {

  //value v minutách
  transform(value: number | undefined): string {
    if (value == undefined) return "";
    var zaporne: boolean = false;
    if (value < 0) {
      zaporne = true;
      value = value * -1;
    }
    const hodiny: number = Math.floor(value / 60);
    const minuty: number = Math.ceil(value - hodiny * 60);
    return (zaporne ? '-' : '') + hodiny.toString().padStart(2, '0') + ":" + minuty.toString().padStart(2, '0');
  }
}
