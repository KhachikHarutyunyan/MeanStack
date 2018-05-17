import { AuthGuard } from './../../guards/auth.guard';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  messageClass;
  message;
  processing = false;
  loginMessage = [];
  previousUrl;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private authGuard: AuthGuard
  ) {
    this.createFrom();
  }

  ngOnInit() {
    if (this.authGuard.redirectUrl) {
      this.messageClass = 'alert alert-danger';
      this.message = 'You must be logged in to view that page';
      this.previousUrl = this.authGuard.redirectUrl;
      this.authGuard.redirectUrl = undefined;
    }
  }

  createFrom() {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  disableForm() {
    this.form.controls['username'].disable();
    this.form.controls['password'].disable();
  }

  enableForm() {
    this.form.controls['username'].enable();
    this.form.controls['password'].enable();
  }

  onLoginSubmit() {
    this.processing = true;
    this.disableForm();
    const user = {
      username: this.form.get('username').value,
      password: this.form.get('password').value
    };
    this.authService.login(user)
      .subscribe(data => {
        this.loginMessage.push(data);
        if (!this.loginMessage[0].success) {
          this.messageClass = 'alert alert-danger';
          this.message = this.loginMessage[0].message;
          this.processing = false;
          this.enableForm();
        } else {
          this.messageClass = 'alert alert-success';
          this.message = this.loginMessage[0].message;
          this.authService.storeUserData(this.loginMessage[0].token, this.loginMessage[0].user);
          setTimeout(() => {
            if (this.previousUrl) {
              this.router.navigate([this.previousUrl]);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }, 2000);
        }
      });
  }

}
