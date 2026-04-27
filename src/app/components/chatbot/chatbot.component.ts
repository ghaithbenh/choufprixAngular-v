import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product, ChatMessage, ChatLink } from '../../types';
import { ApiClientService } from '../../api/api-client.service';
import { Router } from '@angular/router';

const TUNISIAN_CITIES = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte',
  'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous', 'Nabeul'
];

const INITIAL_MESSAGE: ChatMessage = {
  role: 'bot',
  content: '👋 Bonjour! Je suis votre assistant ChoufPrix. Dites-moi ce que vous cherchez et je vais vous aider à trouver les meilleurs prix en Tunisie! 🛍️',
};

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <!-- Floating toggle button -->
    <div class="fixed bottom-6 right-6 z-50">
      @if (!isOpen()) {
        <button id="chatbot-toggle"
                class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-300 hover:shadow-blue-400 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                (click)="toggleOpen()">
          <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <!-- Notification dot -->
          <span class="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      }

      <!-- Chat window -->
      @if (isOpen()) {
        <div class="w-96 h-[560px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in"
             style="animation: fadeUp 0.3s ease forwards;">

          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h3 class="text-white font-semibold text-sm">Assistant ChoufPrix</h3>
                <div class="flex items-center gap-1.5">
                  <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span class="text-blue-100 text-xs">En ligne</span>
                </div>
              </div>
            </div>
            <button class="text-white/70 hover:text-white transition-colors p-1" (click)="toggleOpen()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- City selector -->
          <div class="px-4 py-2 bg-blue-50 border-b border-blue-100">
            <select class="w-full text-xs bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    [(ngModel)]="city" name="city">
              <option value="">📍 Choisir une ville (optionnel)</option>
              @for (c of cities; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" #messagesContainer>
            @for (msg of messages(); track $index) {
              <div class="flex" [class.justify-end]="msg.role === 'user'" [class.justify-start]="msg.role === 'bot'">
                @if (msg.role === 'bot') {
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1">
                    🤖
                  </div>
                }
                <div>
                  <div class="chatbot-bubble" [class.chatbot-user]="msg.role === 'user'" [class.chatbot-bot]="msg.role === 'bot'">
                    {{ msg.content }}
                  </div>
                  <!-- Product recommendations -->
                  @if (msg.products && msg.products.length > 0) {
                    <div class="mt-2 space-y-2 max-w-xs">
                      @for (product of msg.products.slice(0, 3); track product._id) {
                        <div class="bg-white rounded-xl border border-gray-100 p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                             (click)="navigateToProduct(product._id)">
                          <p class="text-xs font-semibold text-slate-800 line-clamp-2">{{ product.name }}</p>
                          <p class="text-blue-600 font-bold text-sm mt-1">{{ formatPrice(product.price) }}</p>
                        </div>
                      }
                    </div>
                  }
                  <!-- Links -->
                  @if (msg.links && msg.links.length > 0) {
                    <div class="mt-2 flex flex-wrap gap-2">
                      @for (link of msg.links; track link.url) {
                        <a [href]="link.url" target="_blank"
                           class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                          {{ link.label }} →
                        </a>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Loading indicator -->
            @if (isLoading()) {
              <div class="flex justify-start">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs mr-2">
                  🤖
                </div>
                <div class="chatbot-bubble chatbot-bot flex items-center gap-1">
                  <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
              </div>
            }
          </div>

          <!-- Input area -->
          <div class="p-4 border-t border-gray-100 bg-white">
            <div class="flex gap-2">
              <input type="text"
                     [(ngModel)]="inputText"
                     name="chatInput"
                     placeholder="Écrivez votre message..."
                     class="flex-1 input-field !py-2.5 text-sm"
                     (keyup.enter)="sendMessage()"
                     [disabled]="isLoading()">

              <!-- Voice button -->
              <button class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                      [class.bg-red-100]="isListening()"
                      [class.text-red-500]="isListening()"
                      (click)="toggleVoice()"
                      title="Saisie vocale">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>

              <!-- Send button -->
              <button class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                      (click)="sendMessage()"
                      [disabled]="isLoading() || !inputText.trim()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ChatbotComponent implements OnInit {
  isOpen = signal(false);
  messages = signal<ChatMessage[]>([INITIAL_MESSAGE]);
  isLoading = signal(false);
  isListening = signal(false);
  inputText = '';
  city = '';
  cities = TUNISIAN_CITIES;

  private recognition: any;

  constructor(private api: ApiClientService, private router: Router) {}

  ngOnInit(): void {
    // Initialize speech recognition if available
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'fr-FR';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.onresult = (event: any) => {
          this.inputText = event.results[0][0].transcript;
          this.isListening.set(false);
        };
        this.recognition.onerror = () => this.isListening.set(false);
        this.recognition.onend = () => this.isListening.set(false);
      }
    }
  }

  toggleOpen(): void {
    this.isOpen.update(v => !v);
  }

  toggleVoice(): void {
    if (!this.recognition) {
      alert('Reconnaissance vocale non disponible dans ce navigateur');
      return;
    }
    if (this.isListening()) {
      this.recognition.stop();
      this.isListening.set(false);
    } else {
      this.recognition.start();
      this.isListening.set(true);
    }
  }

  sendMessage(): void {
    if (!this.inputText.trim() || this.isLoading()) return;

    const userMsg: ChatMessage = { role: 'user', content: this.inputText.trim() };
    this.messages.update(msgs => [...msgs, userMsg]);
    const userInput = this.inputText.trim();
    this.inputText = '';
    this.isLoading.set(true);

    this.api.post<any>('/chatbot', { message: userInput, city: this.city }).subscribe({
      next: (res) => {
        const botMsg: ChatMessage = {
          role: 'bot',
          content: res.message || 'Je n\'ai pas trouvé de résultats pour votre recherche.',
          products: res.products,
          links: res.links,
        };
        this.messages.update(msgs => [...msgs, botMsg]);
        this.isLoading.set(false);
        this.scrollToBottom();
        this.speak(botMsg.content);
      },
      error: () => {
        const errMsg: ChatMessage = {
          role: 'bot',
          content: 'Désolé, je rencontre des difficultés techniques. Essayez de rechercher directement sur notre site!',
        };
        this.messages.update(msgs => [...msgs, errMsg]);
        this.isLoading.set(false);
      }
    });
  }

  private speak(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && text.length < 200) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }

  navigateToProduct(id: string): void {
    this.router.navigate(['/product', id]);
    this.isOpen.set(false);
  }

  formatPrice(price: number): string {
    return (price / 1000).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DT';
  }
}
