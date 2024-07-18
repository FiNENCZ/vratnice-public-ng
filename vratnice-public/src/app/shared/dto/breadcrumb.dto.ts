export class BreadcrumbDto {
  translate: boolean;
  nazevZdroj: string;
  nazev: string = "";
  nazevTitle: string = "";
  url: string;

  constructor(nazevZdroj: string, translate: boolean, url: string) {
    this.nazevZdroj = nazevZdroj;
    this.translate = translate;
    this.url = url;
  }

}
