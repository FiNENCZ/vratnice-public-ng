import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'hodinyMinutySekundyKomplet'
})
export class HodinyMinutySekundyKompletPipe implements PipeTransform {

  transform(value: number): string {
    const hodiny: number = Math.floor(value / 3600);
    const minuty: number = Math.floor((value - hodiny * 3600) / 60);
    const sekundy: number = Math.floor((value - hodiny * 3600 - minuty * 60));
    var vysledek: string = sekundy.toString() + "s";
    if (minuty > 0) {
      vysledek = minuty.toString() + "m" + vysledek;
    }
    if (hodiny > 0) {
      vysledek = hodiny.toString() + "h" + vysledek;
    }
    return vysledek;
    //return hodiny.toString().padStart(2, '0') + ":" + minuty.toString().padStart(2, '0') + ":" + sekundy.toString().padStart(2, '0');
  }
}
