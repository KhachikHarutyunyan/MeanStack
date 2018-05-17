import { AuthService } from './../services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class NotAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    if (!this.authService.loggedIn()) {
      this.router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  }
}
