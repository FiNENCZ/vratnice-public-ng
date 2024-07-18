import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { map } from "rxjs";
import { KonfiguraceService } from "../konfigurace.service";

export const canActivateKonfigurace: CanActivateFn =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const konfiguraceService = inject(KonfiguraceService);
    const router = inject(Router);
    
    if (konfiguraceService.isKonfigurace()) {
      return true;
    }
  
    return konfiguraceService.getKonfigurace().pipe(map(konfiguraceDto => {
      if (konfiguraceDto) {
        return true;
      }
      //console.log('Konfiguraci se nepodařilo načíst - asi nejde api');
      return router.createUrlTree(['/nedostupne-api']);
    }
    ));

  };
