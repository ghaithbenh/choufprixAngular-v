// Price formatting: millimes → TND display
export function formatPrice(priceInMillimes: number): string {
  const tnd = priceInMillimes / 1000;
  return tnd.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DT';
}

// Time formatting
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `il y a ${minutes}m`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7) return `il y a ${days}j`;
  return date.toLocaleDateString('fr-TN');
}

// Truncate text
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

// Get store badge class
export function getStoreBadgeClass(source: string): string {
  switch (source?.toLowerCase()) {
    case 'mytek': return 'store-badge-mytek';
    case 'tunisianet': return 'store-badge-tunisianet';
    case 'scoop': return 'store-badge-scoop';
    case 'user': return 'store-badge-communaute';
    default: return 'store-badge-default';
  }
}

// Get store glow class
export function getStoreGlowClass(source: string): string {
  switch (source?.toLowerCase()) {
    case 'mytek': return 'glow-mytek';
    case 'tunisianet': return 'glow-tunisianet';
    case 'scoop': return 'glow-scoop';
    default: return '';
  }
}

// Format store name for display
export function formatStoreName(source: string): string {
  if (!source) return 'Store';
  if (source.toLowerCase() === 'user') return 'Communauté';
  return source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
}
