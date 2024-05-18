import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environment.prod';
@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private generativeAI:GoogleGenerativeAI;

  private messageHistory : BehaviorSubject<any> = new BehaviorSubject(null);
  constructor() { 
    this.generativeAI = new GoogleGenerativeAI(environment.apiKey);
  }
  
  generateText = async (prompt:string) =>{
    const model = this.generativeAI.getGenerativeModel({model:'gemini-pro'});
    this.messageHistory.next({
      from:'user',
      message:prompt
    })
    const res = await model.generateContent(prompt);
    const response = await res.response;
    const text = response.text();
    console.log(text);
    this.messageHistory.next({
      from:'bot',
      message:text
    })
    
  }

  public getMessageHistory():Observable<any>{
    return this.messageHistory.asObservable();
  }

  
}
