import { Injectable } from '@angular/core';

export interface ChatMessage {
  from: 'user' | 'bot';
  message: string;
  time: number;
}

export interface StoredChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatStorageService {

  private readonly storageKey = 'convobuddy-chats-v1';

  getAll(): StoredChat[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const chats: StoredChat[] = raw ? JSON.parse(raw) : [];
      return chats.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  save(chat: StoredChat): void {
    const chats = this.getAll().filter(c => c.id !== chat.id);
    chats.push(chat);
    this.writeAll(chats);
  }

  delete(id: string): void {
    this.writeAll(this.getAll().filter(c => c.id !== id));
  }

  createId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private writeAll(chats: StoredChat[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(chats));
    } catch {
      /* storage unavailable or full — history just won't persist */
    }
  }
}
