import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'hodinyMinutySekundy'
})
export class HodinyMinutySekundyPipe implements PipeTransform {

  transform(value: number): string {
    const hodiny: number = Math.floor(value / 3600);
    const minuty: number = Math.floor((value - hodiny * 3600) / 60);
    if (hodiny == 0 && minuty == 0) {
      const sekundy: number = Math.floor((value - hodiny * 3600 - minuty * 60));
      if (sekundy == 0)
        return "";
      return sekundy.toString() + "s";
    }
    if (hodiny == 0) {
      return minuty.toString() + "m";
    } else {
      return hodiny.toString() + ":" + minuty.toString().padStart(2, '0');
    }
  }
}
