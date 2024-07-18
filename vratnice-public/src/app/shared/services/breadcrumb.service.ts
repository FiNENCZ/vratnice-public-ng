import { Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BreadcrumbDto } from '../dto/breadcrumb.dto';
import { BreadcrumbTypVlozeniEnum } from '../enums/breadcrumb-typ-vlozeni.enum';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {

  breadcrumb: BreadcrumbDto[] | null = null;

  constructor(
    private readonly translateService: TranslateService
  ) {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.breadcrumb?.forEach(polozkaBreadcrumb => {
        if (polozkaBreadcrumb.translate) {
          this.translateService.get(polozkaBreadcrumb.nazevZdroj).subscribe(
            (res: string) => {
              polozkaBreadcrumb.nazev = res;
              this.nastavNazev(polozkaBreadcrumb, this.breadcrumb?.length! > 1);
            });
        }
      });
    });
  }

  pridejDoBreadcrumb(breadcrumbTypVlozeniEnum: BreadcrumbTypVlozeniEnum, polozka: BreadcrumbDto) {
    if (this.breadcrumb && breadcrumbTypVlozeniEnum == BreadcrumbTypVlozeniEnum.DalsiUroven) {
      this.dejDoBreadcrumb(polozka);
    }

    if (breadcrumbTypVlozeniEnum == BreadcrumbTypVlozeniEnum.PrvniUroven) {
      this.breadcrumb = new Array();
      this.dejDoBreadcrumb(polozka);
    }

    if (!this.breadcrumb && breadcrumbTypVlozeniEnum == BreadcrumbTypVlozeniEnum.PokudChybiPrvni) {
      this.breadcrumb = new Array();
      this.dejDoBreadcrumb(polozka);
    }
  }

  //Pokud je obnovený breadcrumb (po F5) je nejčastěji jeho velikost 1 a musí se zrekonstuovat
  isObnovenyBreadcrumb(): boolean {
    return this.breadcrumb != null && this.breadcrumb.length == 1;
  }

  getPrvniPolozka(): BreadcrumbDto | null {
    return this.breadcrumb![0];
  }

  rekonstrukceBreadcrumb(polozky: BreadcrumbDto[]) {
    if (this.isObnovenyBreadcrumb()) {
      polozky.forEach(polozka => {
        this.dejDoBreadcrumb(polozka);
      });
    }
  }

  private dejDoBreadcrumb(polozka: BreadcrumbDto) {
    //console.log(polozka);
    if (polozka.translate) {
      this.translateService.get(polozka.nazevZdroj).subscribe(
        (res: string) => {
          polozka.nazev = res;
          this.nastavNazev(polozka, this.breadcrumb?.length! > 0);
        });
    } else {
      polozka.nazev = polozka.nazevZdroj;
      this.nastavNazev(polozka, this.breadcrumb?.length! > 0);
    }
    //Pokud je alespoň 1 položka v breadcrampu tak zkrátím i název první
    if (this.breadcrumb?.length! > 0){
      this.nastavNazev(this.getPrvniPolozka()!, true);
    }

    if (this.breadcrumb != null && this.breadcrumb.length > 0 && !this.breadcrumb[this.breadcrumb.length - 1].url)
      this.breadcrumb[this.breadcrumb.length - 1].url = polozka.url;

    var nenalezeno = true;
    var newBreadcumb = new Array();
    for (let index = 0; index < this.breadcrumb!.length; index++) {
      const element = this.breadcrumb![index];
      if (element.url == polozka.url) {
        newBreadcumb.push(element);
        nenalezeno = false;
        break;
      }
      newBreadcumb.push(element);
    }
    this.breadcrumb = newBreadcumb;
    if (nenalezeno) {
      this.breadcrumb.push(polozka);
    }
  }

  private nastavNazev(polozka: BreadcrumbDto, zkracovatNazev: boolean) {
    polozka.nazevTitle = polozka.nazev;
    if (zkracovatNazev && polozka?.nazev?.length > 40) {
      polozka.nazev = polozka.nazev.substring(0, 40 - 1) + "...";
    }
  }

}
