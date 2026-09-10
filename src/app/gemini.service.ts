import { Injectable } from '@angular/core';
import { ChatSession, Content, GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environment.prod';
import { ChatMessage } from './chat-storage.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private generativeAI: GoogleGenerativeAI;
  private sessions = new Map<string, ChatSession>();

  constructor() {
    this.generativeAI = new GoogleGenerativeAI(environment.apiKey);
  }

  async sendMessage(chatId: string, prompt: string, priorHistory: ChatMessage[]): Promise<string> {
    const session = this.getSession(chatId, priorHistory);
    const result = await session.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  }

  forgetSession(chatId: string): void {
    this.sessions.delete(chatId);
  }

  private getSession(chatId: string, priorHistory: ChatMessage[]): ChatSession {
    let session = this.sessions.get(chatId);
    if (!session) {
      const model = this.generativeAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const history: Content[] = priorHistory.map(m => ({
        role: m.from === 'user' ? 'user' : 'model',
        parts: [{ text: m.message }]
      }));
      session = model.startChat({ history });
      this.sessions.set(chatId, session);
    }
    return session;
  }
}
