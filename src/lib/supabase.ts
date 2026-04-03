import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lusxnfrvtkeiqmsxawlu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c3huZnJ2dGtlaXFtc3hhd2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxOTUyNTYsImV4cCI6MjA5MDc3MTI1Nn0.9vC9v0P_qssxvkOskXmzchB4Wv1QP-TJ3whu1ggaVbA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helpers
export async function signUp(email: string, password: string, fullName: string, phone: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone }
    }
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

// Car listing helpers
export interface CarFilters {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  minYear?: number;
  maxYear?: number;
  city?: string;
  bodyType?: string;
  sortBy?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getCars(filters: CarFilters = {}) {
  let query = supabase
    .from('cars')
    .select(`*, car_images(*)`, { count: 'exact' })
    .eq('status', 'active');

  if (filters.brand) query = query.eq('brand', filters.brand);
  if (filters.minPrice) query = query.gte('price', filters.minPrice);
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
  if (filters.fuelType) query = query.eq('fuel_type', filters.fuelType);
  if (filters.transmission) query = query.eq('transmission', filters.transmission);
  if (filters.minYear) query = query.gte('year', filters.minYear);
  if (filters.maxYear) query = query.lte('year', filters.maxYear);
  if (filters.city) query = query.eq('city', filters.city);
  if (filters.bodyType) query = query.eq('body_type', filters.bodyType);
  if (filters.search) query = query.or(`title.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);

  switch (filters.sortBy) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'newest': query = query.order('created_at', { ascending: false }); break;
    case 'popular': query = query.order('views_count', { ascending: false }); break;
    default: query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
  }

  const limit = filters.limit || 12;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  return { data, error, count };
}

export async function getCarById(id: string) {
  const { data, error } = await supabase
    .from('cars')
    .select(`*, car_images(*), profiles!cars_seller_id_fkey(*)`)
    .eq('id', id)
    .single();
  
  // Increment view count
  if (data) {
    supabase.from('cars').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id).then(() => {});
  }
  
  return { data, error };
}

export async function getFeaturedCars() {
  const { data, error } = await supabase
    .from('cars')
    .select(`*, car_images(*)`)
    .eq('status', 'active')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(8);
  return { data, error };
}

export async function getSimilarCars(carId: string, brand: string, priceRange: number) {
  const { data, error } = await supabase
    .from('cars')
    .select(`*, car_images(*)`)
    .eq('status', 'active')
    .neq('id', carId)
    .or(`brand.eq.${brand},price.gte.${priceRange * 0.7},price.lte.${priceRange * 1.3}`)
    .limit(4);
  return { data, error };
}

export async function createCar(carData: any) {
  const { data, error } = await supabase
    .from('cars')
    .insert(carData)
    .select()
    .single();
  return { data, error };
}

export async function updateCar(carId: string, updates: any) {
  const { data, error } = await supabase
    .from('cars')
    .update(updates)
    .eq('id', carId)
    .select()
    .single();
  return { data, error };
}

export async function deleteCar(carId: string) {
  const { error } = await supabase.from('cars').delete().eq('id', carId);
  return { error };
}

export async function getUserCars(userId: string) {
  const { data, error } = await supabase
    .from('cars')
    .select(`*, car_images(*)`)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Favorites
export async function toggleFavorite(userId: string, carId: string) {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('car_id', carId)
    .single();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('favorites').insert({ user_id: userId, car_id: carId });
    return true;
  }
}

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`*, cars(*, car_images(*))`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function isFavorited(userId: string, carId: string) {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('car_id', carId)
    .single();
  return !!data;
}

// Messages
export async function sendMessage(senderId: string, receiverId: string, carId: string, message: string, type: string = 'enquiry') {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, car_id: carId, message, message_type: type })
    .select()
    .single();
  return { data, error };
}

export async function getMessages(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`*, cars(title, brand, model), sender:profiles!messages_sender_id_fkey(full_name, avatar_url), receiver:profiles!messages_receiver_id_fkey(full_name, avatar_url)`)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Recently Viewed
export async function addRecentlyViewed(userId: string, carId: string) {
  // Delete old entry if exists
  await supabase.from('recently_viewed').delete().eq('user_id', userId).eq('car_id', carId);
  // Insert new
  await supabase.from('recently_viewed').insert({ user_id: userId, car_id: carId });
  // Keep only last 20
  const { data } = await supabase
    .from('recently_viewed')
    .select('id')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false });
  if (data && data.length > 20) {
    const toDelete = data.slice(20).map(r => r.id);
    await supabase.from('recently_viewed').delete().in('id', toDelete);
  }
}

export async function getRecentlyViewed(userId: string) {
  const { data, error } = await supabase
    .from('recently_viewed')
    .select(`*, cars(*, car_images(*))`)
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(10);
  return { data, error };
}

// Image upload
export async function uploadCarImage(file: File, carId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${carId}/${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('car-images')
    .upload(fileName, file);
  
  if (error) return { url: null, error };
  
  const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(fileName);
  return { url: publicUrl, error: null };
}
