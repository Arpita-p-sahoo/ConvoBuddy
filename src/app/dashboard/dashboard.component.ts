import { AfterViewChecked, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { GeminiService } from '../gemini.service';
import { ChatMessage, ChatStorageService, StoredChat } from '../chat-storage.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewChecked {

  prompt: string = '';
  chats: StoredChat[] = [];
  activeChatId: string | null = null;
  chatHistory: ChatMessage[] = [];
  loading: boolean = false;
  darkMode: boolean = false;
  copiedMessageIndex: number | null = null;
  sidebarOpen: boolean = false;

  readonly suggestions: string[] = [
    'Explain async/await in JavaScript',
    'Write a Python function to reverse a string',
    'Give me healthy dinner ideas',
    'Summarize the plot of Inception'
  ];

  @ViewChild('chatContainer') private chatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputField') private inputField!: ElementRef<HTMLTextAreaElement>;

  geminiSvc: GeminiService = inject(GeminiService);
  private chatStorage: ChatStorageService = inject(ChatStorageService);

  constructor() {
    this.initTheme();
    this.chats = this.chatStorage.getAll();
    if (this.chats.length) {
      this.loadChat(this.chats[0]);
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private initTheme(): void {
    try {
      const saved = localStorage.getItem('convobuddy-theme');
      this.darkMode = saved
        ? saved === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme();
    } catch {
      this.darkMode = false;
    }
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    this.applyTheme();
    try {
      localStorage.setItem('convobuddy-theme', this.darkMode ? 'dark' : 'light');
    } catch { /* ignore storage errors */ }
  }

  private applyTheme(): void {
    document.documentElement.classList.toggle('dark', this.darkMode);
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error(err);
    }
  }

  async GetResponse(): Promise<void> {
    const value = this.prompt.trim();
    if (!value || this.loading) return;

    this.loading = true;
    this.prompt = '';
    this.resetInputHeight();

    const chatId = this.activeChatId ?? this.chatStorage.createId();
    const priorHistory = [...this.chatHistory];
    this.activeChatId = chatId;
    this.chatHistory.push({ from: 'user', message: value, time: Date.now() });

    try {
      const reply = await this.geminiSvc.sendMessage(chatId, value, priorHistory);
      this.chatHistory.push({ from: 'bot', message: reply, time: Date.now() });
    } catch (err) {
      console.error(err);
      this.chatHistory.push({
        from: 'bot',
        message: 'Sorry, something went wrong while getting a response. Please try again.',
        time: Date.now()
      });
    }

    this.persistActiveChat(value);
    this.loading = false;
    setTimeout(() => this.inputField?.nativeElement.focus());
  }

  private persistActiveChat(firstPrompt: string): void {
    if (!this.activeChatId) return;
    const existing = this.chats.find(c => c.id === this.activeChatId);
    const chat: StoredChat = {
      id: this.activeChatId,
      title: existing?.title ?? this.makeTitle(firstPrompt),
      messages: this.chatHistory,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now()
    };
    this.chatStorage.save(chat);
    this.chats = this.chatStorage.getAll();
  }

  private makeTitle(text: string): string {
    const clean = text.replace(/\s+/g, ' ').trim();
    return clean.length > 42 ? clean.slice(0, 42) + '…' : clean;
  }

  private loadChat(chat: StoredChat): void {
    this.activeChatId = chat.id;
    this.chatHistory = [...chat.messages];
  }

  selectChat(id: string): void {
    if (id === this.activeChatId) {
      this.sidebarOpen = false;
      return;
    }
    const chat = this.chats.find(c => c.id === id);
    if (!chat) return;
    this.loadChat(chat);
    this.sidebarOpen = false;
  }

  deleteChat(id: string, event: Event): void {
    event.stopPropagation();
    this.chatStorage.delete(id);
    this.geminiSvc.forgetSession(id);
    this.chats = this.chats.filter(c => c.id !== id);

    if (this.activeChatId === id) {
      if (this.chats.length) {
        this.loadChat(this.chats[0]);
      } else {
        this.activeChatId = null;
        this.chatHistory = [];
      }
    }
  }

  trackByChatId(_index: number, chat: StoredChat): string {
    return chat.id;
  }

  useSuggestion(text: string): void {
    this.prompt = text;
    this.sidebarOpen = false;
    setTimeout(() => this.inputField?.nativeElement.focus());
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  startNewChat(): void {
    this.activeChatId = null;
    this.chatHistory = [];
    this.sidebarOpen = false;
    setTimeout(() => this.inputField?.nativeElement.focus());
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.GetResponse();
    }
  }

  autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
  }

  private resetInputHeight(): void {
    setTimeout(() => {
      const el = this.inputField?.nativeElement;
      if (el) el.style.height = 'auto';
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  async copyMessage(text: string, index: number): Promise<void> {
    await this.copyToClipboard(text);
    this.copiedMessageIndex = index;
    setTimeout(() => {
      if (this.copiedMessageIndex === index) this.copiedMessageIndex = null;
    }, 1600);
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  onChatAreaClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const copyBtn = target.closest('.code-block__copy') as HTMLElement | null;
    if (!copyBtn) return;

    const codeBlock = copyBtn.closest('.code-block');
    const codeEl = codeBlock?.querySelector('code');
    const code = codeEl?.textContent ?? '';

    this.copyToClipboard(code).then(() => {
      const label = copyBtn.querySelector('span');
      if (!label) return;
      const original = label.textContent;
      label.textContent = 'Copied!';
      copyBtn.classList.add('code-block__copy--done');
      setTimeout(() => {
        label.textContent = original;
        copyBtn.classList.remove('code-block__copy--done');
      }, 1600);
    });
  }
}
