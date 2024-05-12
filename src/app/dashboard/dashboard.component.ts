import { Component, Inject, inject } from '@angular/core';
import { GeminiService } from '../gemini.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  prompt:string = '';
  chatHistory:any[] = [];
  loading:boolean = false;

  geminiSvc:GeminiService = inject(GeminiService);
  constructor() { 
    this.geminiSvc.getMessageHistory().subscribe((data)=>{
      if (data) {
        this.chatHistory.push(data);
      }
    })
  }

  async GetResponse(){
    if (this.prompt) {
      this.loading = true;
      const data = this.prompt;
      this.prompt = '';
      await this.geminiSvc.generateText(data);
      this.loading = false;
    }
  }

  FormatResponse(response: string): string {
    const result = response.replaceAll('**',' '); 
    return result; 
  }


}
