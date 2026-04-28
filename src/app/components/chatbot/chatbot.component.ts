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
  templateUrl: './chatbot.component.html'
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
