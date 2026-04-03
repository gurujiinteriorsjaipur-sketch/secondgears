// Global State Management
import { supabase, getCurrentUser, getProfile } from './supabase';

export interface AppState {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  compareList: string[];
  recentlyViewed: string[];
}

const state: AppState = {
  user: null,
  profile: null,
  isLoading: true,
  compareList: JSON.parse(localStorage.getItem('sg_compare') || '[]'),
  recentlyViewed: JSON.parse(localStorage.getItem('sg_recent') || '[]'),
};

type Listener = (state: AppState) => void;
const listeners: Listener[] = [];

export function getState(): AppState {
  return { ...state };
}

export function subscribe(listener: Listener) {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function notify() {
  listeners.forEach(l => l(getState()));
}

export async function initAuth() {
  state.isLoading = true;
  notify();

  const user = await getCurrentUser();
  state.user = user;
  
  if (user) {
    const { data: profile } = await getProfile(user.id);
    state.profile = profile;
  }
  
  state.isLoading = false;
  notify();

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    state.user = session?.user || null;
    if (session?.user) {
      const { data: profile } = await getProfile(session.user.id);
      state.profile = profile;
    } else {
      state.profile = null;
    }
    notify();
  });
}

export function addToCompare(carId: string) {
  if (state.compareList.length >= 3) return false;
  if (state.compareList.includes(carId)) return false;
  state.compareList.push(carId);
  localStorage.setItem('sg_compare', JSON.stringify(state.compareList));
  notify();
  return true;
}

export function removeFromCompare(carId: string) {
  state.compareList = state.compareList.filter(id => id !== carId);
  localStorage.setItem('sg_compare', JSON.stringify(state.compareList));
  notify();
}

export function clearCompare() {
  state.compareList = [];
  localStorage.setItem('sg_compare', JSON.stringify(state.compareList));
  notify();
}

export function addToRecentlyViewed(carId: string) {
  state.recentlyViewed = [carId, ...state.recentlyViewed.filter(id => id !== carId)].slice(0, 20);
  localStorage.setItem('sg_recent', JSON.stringify(state.recentlyViewed));
  notify();
}

// Format helpers
export function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakh`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatKm(km: number): string {
  if (km >= 100000) return `${(km / 100000).toFixed(1)} Lakh km`;
  return `${km.toLocaleString('en-IN')} km`;
}

export function calculateEMI(principal: number, ratePercent: number = 9.5, tenureMonths: number = 60): number {
  const r = ratePercent / 100 / 12;
  const emi = principal * r * Math.pow(1 + r, tenureMonths) / (Math.pow(1 + r, tenureMonths) - 1);
  return Math.round(emi);
}
