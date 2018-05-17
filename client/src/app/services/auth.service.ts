import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // domain = 'http://localhost:8080/'; posle zagruzki v xeroku put v@daiot oshibku dubliruem...
  domain = '';
  authToken;
  user;
  options;

  constructor(
    private http: HttpClient,
    public jwtHelper: JwtHelperService
  ) { }

  createAuthenticationHeaders() {
    this.loadToken();
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'authorization': this.authToken
      })
    };
  }

  loadToken() {
    const token = localStorage.getItem('token');
    this.authToken = token;
  }

  registerUser(user) {
    return this.http.post(this.domain + 'authentication/register', user);
  }

  checkUsername(username) {
    return this.http.get(this.domain + 'authentication/checkUsername/' + username);
  }

  checkEmail(email) {
    return this.http.get(this.domain + 'authentication/checkEmail/' + email);
  }

  login(user) {
    return this.http.post(this.domain + 'authentication/login', user);
  }

  logout() {
    this.user = null;
    this.authToken = null;
    localStorage.clear();
  }

  storeUserData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  getProfile() {
    this.createAuthenticationHeaders();
    return this.http.get(this.domain + 'authentication/profile', this.options);
  }

  loggedIn() {
    const userToken = localStorage.getItem('token');
    return this.jwtHelper.isTokenExpired(userToken);
  }

  getPublicProfile(username) {
    this.createAuthenticationHeaders();
    return this.http.get(this.domain + 'authentication/publicProfile/' + username, this.options);
  }

}
