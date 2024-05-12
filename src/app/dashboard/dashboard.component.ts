import { Component, Inject, inject } from '@angular/core';
import { GeminiService } from '../gemini.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  prompt:string = '';
  geminiSvc:GeminiService = inject(GeminiService);
  constructor() { }

  GetResponse(){
    if (this.prompt) {
       this.geminiSvc.generateText(this.prompt);
    }
  }
}
