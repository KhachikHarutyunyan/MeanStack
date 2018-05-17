import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user = [];
  username;
  email;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.getProfile()
      .subscribe(profile => {
        this.user.push(profile);
        this.username = this.user[0].user.username;
        this.email = this.user[0].user.email;
      });
  }

}
