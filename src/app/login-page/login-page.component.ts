import { Component } from '@angular/core';
import { GeminiService } from '../gemini.service';
import { FormBuilder, FormControl, Validators,FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  constructor(private geminiSvc:GeminiService,private fb:FormBuilder) {}

  LoginForm = this.fb.group({
    username: new FormControl('',Validators.required),
    password: new FormControl('',Validators.required),
  });

  async onSubmit() {
   let res = await this.geminiSvc.Connect(this.LoginForm.value.username,this.LoginForm.value.password);
    console.log(this.LoginForm.value);
    console.log(res);
    
  }
}
