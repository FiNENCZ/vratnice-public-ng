import { Injectable } from '@angular/core';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SpinnerComponent } from '../components/spinner.component';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  private spinnerRef: OverlayRef = this.cdkSpinnerCreate();
  constructor(
    private overlay: Overlay,
  ) { }

  private cdkSpinnerCreate(): OverlayRef  {
    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    })
  }

  isShowSpinner(){
    return this.spinnerRef.hasAttached();
  }

  async showSpinner(nadpis?: string, message?: string, progress?: number) {
    //console.log(this.spinnerRef);
    const bodyElement = document.body;
    if (!this.spinnerRef.hasAttached()) {
      var componentPortal = new ComponentPortal(SpinnerComponent);
      bodyElement.classList.remove("body-overflow-hidden");
      bodyElement.classList.add("body-overflow-hidden");
      this.spinnerRef.attach(componentPortal);
    }
    if (nadpis) {
      this.spinnerRef.overlayElement.getElementsByClassName("spinner-nadpis").item(0)!.innerHTML = nadpis;
    } else {
      this.spinnerRef.overlayElement.getElementsByClassName("spinner-nadpis").item(0)!.innerHTML = "";
    }
    if (message) {
      if (progress) {
        this.spinnerRef.overlayElement.getElementsByClassName("spinner-message").item(0)!.innerHTML = message + " " + progress + "%";
      } else {
        this.spinnerRef.overlayElement.getElementsByClassName("spinner-message").item(0)!.innerHTML = message;
      }
    } else {
      this.spinnerRef.overlayElement.getElementsByClassName("spinner-message").item(0)!.innerHTML = "";
    }
    if (nadpis || message) {
      bodyElement.classList.remove("blur-efekt");
      bodyElement.classList.add("blur-efekt");
    } else {
      bodyElement.classList.remove("blur-efekt");
    }
  }

  async stopSpinner() {
    const bodyElement = document.body;
    bodyElement.classList.remove("body-overflow-hidden");
    bodyElement.classList.remove("blur-efekt");
    this.spinnerRef.detach();
  }

}
