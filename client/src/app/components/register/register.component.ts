import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validator, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  message;
  messageClass;
  processing = false;
  emailValid;
  emailMessage;
  usernameValid;
  usernameMessage;

  userDataMessage = [];
  checkEmailMessage = [];
  checkUsernameMessage = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
    ) {
    this.createForm();
  }

  ngOnInit() {}

  createForm() {
    this.form = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(30),
        this.validateEmail
      ])],
      username: ['', Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
        this.validateUsername
      ])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(35),
        this.validatePassword
      ])],
      confirm: ['', Validators.required]
    }, { validator: this.matchingPasswords('password', 'confirm') });
  }

  disableForm() {
    this.form.controls['email'].disable();
    this.form.controls['username'].disable();
    this.form.controls['password'].disable();
    this.form.controls['confirm'].disable();
  }

  enableForm() {
    this.form.controls['email'].enable();
    this.form.controls['username'].enable();
    this.form.controls['password'].enable();
    this.form.controls['confirm'].enable();
  }

  validateEmail(controls) {
     // tslint:disable-next-line:max-line-length
     const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
     if (regExp.test(controls.value)) {
      return null;
     } else {
       return { 'validateEmail': true };
     }
  }

  validateUsername(controls) {
    const regExp = new RegExp(/^[a-zA-Z0-9]+$/);
    if (regExp.test(controls.value)) {
      return null;
    } else {
      return { 'validateUsername': true };
    }
  }

  validatePassword(controls) {
    const regExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/);
    if (regExp.test(controls.value)) {
      return null;
    } else {
      return { 'validatePassword': true };
    }
  }

  matchingPasswords(password, confirm) {
    return (group: FormGroup) => {
      if (group.controls[password].value === group.controls[confirm].value) {
        return null;
      } else {
        return { 'matchingPasswords': true };
      }
    };
  }

  onRegisterSubmit() {
    this.processing = true;
    this.disableForm();
    const user = {
      email: this.form.get('email').value,
      username: this.form.get('username').value,
      password: this.form.get('password').value,
    };
    this.authService.registerUser(user).subscribe(data => {
      this.userDataMessage.push(data);
      if (!this.userDataMessage[0].success) {
        this.messageClass = 'alert alert-danger';
        this.message = this.userDataMessage[0].message;
        this.processing = false;
        this.enableForm();
      } else {
        this.messageClass = 'alert alert-success';
        this.message = this.userDataMessage[0].message;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
  }

  checkEmail() {
    this.authService.checkEmail(this.form.get('email').value)
      .subscribe(data => {
        this.checkEmailMessage.push(data);
        if (!this.checkEmailMessage[0].success) {
          this.emailValid = false;
          this.emailMessage = this.checkEmailMessage[0].message;
        } else {
          this.emailValid = true;
          this.emailMessage = this.checkEmailMessage[0].message;
        }
      });
  }

  checkUsername() {
    this.authService.checkUsername(this.form.get('username').value)
      .subscribe(data => {
        this.checkUsernameMessage.push(data);
        if (!this.checkUsernameMessage[0].success) {
          this.usernameValid = false;
          this.usernameMessage = this.checkUsernameMessage[0].message;
        } else {
          this.usernameValid = true;
          this.usernameMessage = this.checkUsernameMessage[0].message;
        }
      });
  }

}
