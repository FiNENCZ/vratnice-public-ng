import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this._loading.asObservable();


  constructor(
    private spinnerService: NgxSpinnerService
  ) { }

  show() {
    this.spinnerService.show(undefined,
      {
        type: 'ball-clip-rotate',
        bdColor: 'rgba(0,0,0,0.7)',
        color: "#fff",
        size: 'large'
      }
    )
  }

  hide() {
    this.spinnerService.hide();
  }


}
