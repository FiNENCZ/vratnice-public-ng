import { Component, inject } from '@angular/core';
import { RecaptchaModule, ReCaptchaV3Service } from 'ng-recaptcha';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [RecaptchaModule],
  templateUrl: './captcha.component.html',
  styleUrl: './captcha.component.scss'
})
export class CaptchaComponent {
  siteKey = "6LdxRCEqAAAAAPod-t3GRdvUAJ8QbhYvAdIr6cgO";
  
  recaptchaService = inject(ReCaptchaV3Service);
  executeRecaptcha() {
    this.recaptchaService.execute('').subscribe((token) => {
      console.log(token);
    })
  }

  executeRecaptchaVisible(token: any) {
    console.log(token);
  }
}
