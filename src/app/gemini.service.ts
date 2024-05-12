import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private generativeAI:GoogleGenerativeAI;
  constructor() { 
    this.generativeAI = new GoogleGenerativeAI('AIzaSyBbP-pXBCRq6JUOtz6bZp_VkWt6ClDOa4o');
  }
  
  generateText = async (prompt:string) =>{
    const model = this.generativeAI.getGenerativeModel({model:'gemini-pro'});
    const res = await model.generateContent(prompt);
    const response = await res.response;
    const text = response.text();
    console.log(text);
    
  }
}
