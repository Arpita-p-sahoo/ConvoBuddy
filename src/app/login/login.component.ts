import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  mode: 'signin' | 'signup' = 'signin';
  showPassword = false;

  setMode(mode: 'signin' | 'signup'): void {
    this.mode = mode;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
