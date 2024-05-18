import { AfterViewChecked, Component, ElementRef, Inject, Pipe, PipeTransform, ViewChild, inject } from '@angular/core';
import { GeminiService } from '../gemini.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewChecked {

  prompt: string = '';
  chatHistory: any[] = [];
  loading: boolean = false;
  chatContainerHeight: number = 0;

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('inputField') private inputField!: ElementRef;

  geminiSvc: GeminiService = inject(GeminiService);
  constructor(private sanitizer: DomSanitizer) {
    this.geminiSvc.getMessageHistory().subscribe((data) => {
      if (data) {
        this.chatHistory.push(data);
      }
    })
  }
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }


  // After view checked lifecycle hook
  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error(err);
    }
  }
  async GetResponse() {
    if (this.prompt) {
      this.loading = true;
      const data = this.prompt;
      this.prompt = '';
      await this.geminiSvc.generateText(data);
      this.loading = false;
    }
  }



}
