# 🚀 Guide Angular pour ChoufPrix

Bienvenue dans le guide Angular spécifique à ton projet. Ce document est conçu pour t'aider à comprendre comment naviguer et modifier le frontend de ChoufPrix, même si tu n'es pas habitué à Angular.

## 🏗️ Architecture du Projet

Le projet utilise **Angular 17+** avec les dernières fonctionnalités : **Standalone Components** (pas de modules complexes) et **Signals** (gestion d'état moderne).

### Structure des dossiers (`src/app/`) :
- `/pages`: Contient les composants "Pages" entiers (Home, Marketplace, Login, etc.).
- `/components`: Contient les composants réutilisables (ProductCard, Chatbot, Hero, etc.).
- `/api`: Services pour communiquer avec le backend NestJS (`ApiClientService`).
- `/types`: Définitions TypeScript pour les données (Product, User, etc.).
- `/data`: Données statiques (ex: catégories).
- `/services`: Services utilitaires (ex: AuthService).

---

## 🚦 Navigation & Routage (`app.routes.ts`)

Pour ajouter une nouvelle page ou changer une URL, regarde `src/app/app.routes.ts`.
- **Lien dans HTML** : Utilise `routerLink="/chemin"` au lieu de `href`.
- **Navigation dans TS** : Utilise `this.router.navigate(['/chemin'])`.

---

## 💡 Les Concepts Clés à Connaître

### 1. Composants Standalone
Chaque composant est autonome. Pour utiliser un autre composant ou une directive (comme `CommonModule` ou `FormsModule`), tu dois l'ajouter dans le tableau `imports: [...]` de ton `@Component`.

### 2. Signals (La réactivité moderne)
Au lieu de simples variables, nous utilisons souvent des `signal()`.
- **Déclarer** : `count = signal(0);`
- **Lire** : `this.count()` (n'oublie pas les parenthèses !)
- **Modifier** : `this.count.set(10);` ou `this.count.update(v => v + 1);`
- **Calculé** : `isPositive = computed(() => this.count() > 0);`

### 3. Nouveau Flux de Contrôle (Template HTML)
Plus simple que les anciens `*ngIf` et `*ngFor` :

```html
<!-- Conditionnel -->
@if (isLoading()) {
  <p>Chargement...</p>
} @else {
  <p>Contenu prêt !</p>
}

<!-- Boucles -->
@for (product of products(); track product._id) {
  <app-product-card [product]="product" />
}
```

---

## 🛠️ Actions Courantes

### Créer un nouveau composant
Utilise le terminal :
```bash
ng generate component components/mon-nouveau-composant
# ou
ng g c pages/ma-nouvelle-page
```

### Appeler une API
1. Injecte le service dans le constructeur : `constructor(private api: ApiClientService) {}`
2. Appelle la méthode :
```typescript
this.api.get<Product[]>('/products').subscribe(data => {
  this.products.set(data);
});
```

### Gérer les formulaires
Utilise `[(ngModel)]="maVariable"` pour lier une variable TS à un input HTML. N'oublie pas d'importer `FormsModule` dans ton composant.

---

## 🎨 Styles & UI
Nous utilisons **Tailwind CSS**. Tu peux modifier les classes directement dans les fichiers `.html`. Les styles globaux se trouvent dans `src/styles.css`.

## 🚀 Lancer le projet
```bash
ng serve
```
Puis ouvre `http://localhost:4200`.
