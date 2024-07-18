import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../auth.service";
import { map } from "rxjs";
import { saveUrlPresmerovaniLoginFunction } from "../../functions/url-presmerovani-login.function";

export const canActivateAuth: CanActivateFn =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn() && !authService.isExpired()) {
      return true;
    }

    return authService.isAuthenticated().pipe(map(authenticated => {
      if (authenticated) {
        return true;
      }
      //Uložení poslední stránky do session nastavení prohlížeče pro opětovné přesměrování po přihlášení
      saveUrlPresmerovaniLoginFunction();
      return router.createUrlTree(['/login-sso']);
    }
    ));
  };
