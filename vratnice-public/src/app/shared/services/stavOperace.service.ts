import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { StavOperaceControllerService, StavOperaceDto } from "build/openapi";
import { Subscription, timer } from "rxjs";
import { IStavOperace } from "../interfaces/stav-operace.interface";

@Injectable({
  providedIn: 'root'
})
export class StavOperaceService {

  private readonly vychoziCas: number = 1 * 1000; // 1 sekunda
  private readonly opakovaniCas: number = 2 * 1000; // 5 sekund

  constructor(
    private readonly translateService: TranslateService,
    private readonly stavOperaceControllerService: StavOperaceControllerService
  ) {
  }

  ukoncitTimer(timerSubscription: Subscription) {
    timerSubscription?.unsubscribe();
  }

  spustitTimer(id: StavOperaceDto.IdEnum, stavOperaceComponent: IStavOperace): Subscription {
    var casovac = timer(this.vychoziCas, this.opakovaniCas);
    return casovac.subscribe(
      () => {
        this.onTimeOut(id, stavOperaceComponent);
      }
    );
  }

  private onTimeOut(id: StavOperaceDto.IdEnum, stavOperaceComponent: IStavOperace) {
    this.stavOperaceControllerService.detailStavOperace(id, this.translateService.currentLang)
      .subscribe({
        next: (stavOperaceDto: StavOperaceDto) => {
          this.aktualizaceSpinneru(stavOperaceComponent, stavOperaceDto);
        },
        error: (error: any) => {
        }
      });
  }

  private aktualizaceSpinneru(stavOperaceComponent: IStavOperace, stavOperaceDto: StavOperaceDto): void {
    //console.log("Obecná operace prijata data", stavOperaceDto);
    if (stavOperaceDto?.status == 'IN_PROGRESS' && stavOperaceComponent?.uiService?.isShowSpinner()) {
      stavOperaceComponent?.uiService?.showSpinner(stavOperaceDto?.title, stavOperaceDto?.message, stavOperaceDto?.progress);
    }
  }

}
