import { AuthService } from './../services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';


@Injectable()
export class AuthGuard implements CanActivate {

  redirectUrl;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    router: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
      if (!this.authService.loggedIn()) {
        return true;
      } else {
        this.redirectUrl = state.url;
        this.router.navigate(['/login']);
        return false;
      }
  }
}
