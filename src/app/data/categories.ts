import { TopCategory } from '../types';

export const TOP_CATEGORIES: TopCategory[] = [
  {
    slug: 'tech',
    label: 'Tech & Electronics',
    icon: '💻',
    parentCategory: 'Informatique',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: 'Ordinateurs, composants & accessoires'
  },
  {
    slug: 'home',
    label: 'Home & Appliances',
    icon: '🏠',
    parentCategory: 'Maison',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    description: 'Electroménager, meubles & déco'
  },
  {
    slug: 'fashion',
    label: 'Fashion',
    icon: '👗',
    parentCategory: 'Mode',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    description: 'Vêtements, chaussures & sacs'
  },
  {
    slug: 'beauty',
    label: 'Beauty & Health',
    icon: '💄',
    parentCategory: 'Beauté',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    description: 'Cosmétiques, soin & santé'
  },
  {
    slug: 'auto',
    label: 'Auto & Moto',
    icon: '🚗',
    parentCategory: 'Auto',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    description: 'Voitures, pièces & accessoires'
  },
  {
    slug: 'secondhand',
    label: 'Second Hand',
    icon: '♻️',
    parentCategory: 'Tayara',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
    description: 'Occasions & articles d\'occasion'
  },
];

export const ALL_CATEGORIES: TopCategory[] = [
  ...TOP_CATEGORIES,
  {
    slug: 'telephonie',
    label: 'Téléphonie & Mobile',
    icon: '📱',
    parentCategory: 'Téléphonie',
    color: 'sky',
    gradient: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
    description: 'Smartphones & accessoires mobiles'
  },
  {
    slug: 'gaming',
    label: 'Gaming',
    icon: '🎮',
    parentCategory: 'Gaming',
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
    description: 'Consoles, jeux & périphériques'
  },
  {
    slug: 'impression',
    label: 'Impression & Print',
    icon: '🖨️',
    parentCategory: 'Impression',
    color: 'cyan',
    gradient: 'from-cyan-500 to-teal-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    description: 'Imprimantes, encre & papier'
  },
  {
    slug: 'reseau',
    label: 'Réseau & Connectivity',
    icon: '🌐',
    parentCategory: 'Réseau',
    color: 'indigo',
    gradient: 'from-indigo-500 to-violet-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    description: 'Routeurs, câbles & réseaux'
  },
  {
    slug: 'audio-video',
    label: 'Audio & Vidéo',
    icon: '🎵',
    parentCategory: 'Audio & Vidéo',
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    description: 'Son, image & multimédia'
  },
  {
    slug: 'securite',
    label: 'Sécurité & Alarme',
    icon: '🔒',
    parentCategory: 'Sécurité',
    color: 'slate',
    gradient: 'from-slate-500 to-gray-700',
    bgLight: 'bg-slate-50',
    textColor: 'text-slate-600',
    description: 'Caméras, alarmes & sécurité'
  },
  {
    slug: 'bureautique',
    label: 'Bureautique',
    icon: '🖥️',
    parentCategory: 'Bureautique',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
    description: 'Bureau, fournitures & logiciels'
  },
  {
    slug: 'autres',
    label: 'Autres & Divers',
    icon: '📦',
    parentCategory: 'Autres',
    color: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    description: 'Divers & produits variés'
  },
  {
    slug: 'animaux',
    label: 'Animaux & Pets',
    icon: '🐾',
    parentCategory: 'Animaux',
    color: 'lime',
    gradient: 'from-lime-500 to-green-600',
    bgLight: 'bg-lime-50',
    textColor: 'text-lime-600',
    description: 'Animaux, nourriture & accessoires'
  },
];

export function getCategoryBySlug(slug: string): TopCategory | undefined {
  return ALL_CATEGORIES.find(cat => cat.slug === slug);
}

export function getCategoryGradientClass(category: TopCategory): string {
  return `bg-gradient-to-br ${category.gradient}`;
}
