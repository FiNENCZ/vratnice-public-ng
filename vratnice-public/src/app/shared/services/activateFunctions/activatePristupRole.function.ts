import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../auth.service";
import { map } from "rxjs";

export const canActivatePristupRole: CanActivateFn =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

    const roles: string[] = route.data.roles;
    const emptyPage: boolean = route.data.emptyPage

    const authService = inject(AuthService);
    const router = inject(Router);

    var seznamRoli = authService.getRoles();
    if (seznamRoli) {
      var obsahujeRoli = authService.obsahujeRoli(seznamRoli, roles);
      if (!obsahujeRoli) {
        if (emptyPage) {
          return router.createUrlTree(['/private/uvod']);
        }
      }
      return obsahujeRoli;
    }

    return authService.isAuthenticated().pipe(map(appUserDto => {
      var obsahujeRoli = appUserDto !== null && appUserDto.authorities != null && authService.obsahujeRoli(appUserDto.authorities, roles);
      if (!obsahujeRoli) {
        if (emptyPage) {
          return router.createUrlTree(['/private/uvod']);
        }
      }
      return obsahujeRoli;
    }
    ));
  };
