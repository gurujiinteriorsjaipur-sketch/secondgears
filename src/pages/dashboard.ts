import { renderNavbar, initNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';
import { renderCarCard } from '../components/car-card';
import { getUserCars, getFavorites, getMessages, updateProfile, deleteCar } from '../lib/supabase';
import { getState, formatPrice } from '../lib/state';
import { showToast } from '../components/ui';
import { router } from '../lib/router';
import { DUMMY_CARS } from '../lib/dummy-data';

let activeTab = 'listings';

export async function renderDashboardPage() {
  const state = getState();
  if (!state.user) { router.navigate('/auth'); return; }

  const app = document.getElementById('app')!;
  app.innerHTML = renderNavbar() + `
  <div class="dashboard-layout">
    <nav class="dashboard-nav">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:1.5rem;font-weight:700;color:var(--primary);">
          ${(state.profile?.full_name || state.user.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div style="font-weight:700;">${state.profile?.full_name || 'User'}</div>
        <div style="font-size:0.8125rem;color:var(--on-surface-variant);">${state.user.email}</div>
      </div>
      <button class="dashboard-nav__item active" data-tab="listings">🚗 My Listings</button>
      <button class="dashboard-nav__item" data-tab="favorites">♡ Saved Cars</button>
      <button class="dashboard-nav__item" data-tab="messages">💬 Messages</button>
      <button class="dashboard-nav__item" data-tab="profile">👤 Profile</button>
    </nav>
    <div class="dashboard-content" id="dashboard-content">
      <div class="loading-spinner"></div>
    </div>
  </div>
  ` + renderFooter();

  initNavbar();

  document.querySelectorAll('.dashboard-nav__item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.dashboard-nav__item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      activeTab = item.getAttribute('data-tab') || 'listings';
      loadDashboardContent();
    });
  });

  await loadDashboardContent();
}

async function loadDashboardContent() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;
  const state = getState();

  switch (activeTab) {
    case 'listings': {
      let cars: any[] = [];
      try { const { data } = await getUserCars(state.user.id); cars = data || []; } catch { cars = []; }
      if (cars.length === 0) cars = DUMMY_CARS.slice(0, 3);
      
      container.innerHTML = `
        <div class="dashboard-stats">
          <div class="stat-card"><div class="stat-card__value">${cars.length}</div><div class="stat-card__label">Listed Cars</div></div>
          <div class="stat-card"><div class="stat-card__value">${cars.reduce((s: number, c: any) => s + (c.views_count || 0), 0)}</div><div class="stat-card__label">Total Views</div></div>
          <div class="stat-card"><div class="stat-card__value">${cars.filter((c: any) => c.status === 'active').length}</div><div class="stat-card__label">Active Listings</div></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <h2 style="font-family:var(--font-heading);font-size:1.5rem;font-weight:700;">My Listings</h2>
          <a href="/sell" data-route class="btn btn--primary">+ Add New Car</a>
        </div>
        <div class="car-grid">${cars.map((c: any) => `
          <div class="car-card fade-in" style="position:relative;">
            <div style="position:absolute;top:12px;right:12px;z-index:5;display:flex;gap:4px;">
              <span style="padding:4px 10px;border-radius:var(--radius-full);font-size:0.6875rem;font-weight:600;background:${c.status==='active'?'rgba(0,200,83,0.9)':c.status==='pending'?'rgba(255,165,0,0.9)':'rgba(100,100,100,0.9)'};color:white;">${c.status || 'active'}</span>
            </div>
            <div class="car-card__image-wrapper">
              <img src="${c.car_images?.[0]?.image_url || '/images/cars/hyundai-creta.png'}" alt="${c.title}" class="car-card__image" onerror="this.src='/images/cars/hyundai-creta.png'">
            </div>
            <div class="car-card__body">
              <div class="car-card__title">${c.title}</div>
              <div class="car-card__price">${formatPrice(c.price)}</div>
              <div style="display:flex;gap:8px;margin-top:12px;">
                <a href="/car/${c.id}" data-route class="btn btn--secondary btn--sm" style="flex:1">View</a>
                <button class="btn btn--ghost btn--sm delete-listing" data-id="${c.id}" style="flex:1">Delete</button>
              </div>
            </div>
          </div>
        `).join('')}</div>`;
      break;
    }
    case 'favorites': {
      let favs: any[] = [];
      try { const { data } = await getFavorites(state.user.id); favs = data?.map((f: any) => f.cars).filter(Boolean) || []; } catch {}
      container.innerHTML = `<h2 style="font-family:var(--font-heading);font-size:1.5rem;font-weight:700;margin-bottom:24px;">Saved Cars</h2>` +
        (favs.length > 0 ? `<div class="car-grid">${favs.map((c: any) => renderCarCard(c)).join('')}</div>` :
        `<div class="empty-state"><div class="empty-state__icon">♡</div><div class="empty-state__title">No saved cars yet</div><div class="empty-state__desc">Cars you save will appear here</div><a href="/cars" data-route class="btn btn--primary">Browse Cars</a></div>`);
      break;
    }
    case 'messages': {
      let msgs: any[] = [];
      try { const { data } = await getMessages(state.user.id); msgs = data || []; } catch {}
      container.innerHTML = `<h2 style="font-family:var(--font-heading);font-size:1.5rem;font-weight:700;margin-bottom:24px;">Messages</h2>` +
        (msgs.length > 0 ? msgs.map((m: any) => `
          <div style="padding:16px;background:var(--surface-container-lowest);border-radius:var(--radius-md);margin-bottom:12px;display:flex;gap:16px;align-items:start;" class="fade-in">
            <div style="width:40px;height:40px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--primary);flex-shrink:0;">${(m.sender?.full_name||'U').charAt(0)}</div>
            <div><div style="font-weight:600;">${m.sender?.full_name || 'User'} <span style="font-size:0.75rem;color:var(--outline);">· ${m.cars?.title || ''}</span></div><div style="margin-top:4px;color:var(--on-surface-variant);font-size:0.875rem;">${m.message}</div></div>
          </div>`).join('') :
        `<div class="empty-state"><div class="empty-state__icon">💬</div><div class="empty-state__title">No messages yet</div><div class="empty-state__desc">Messages from buyers will appear here</div></div>`);
      break;
    }
    case 'profile': {
      container.innerHTML = `
        <h2 style="font-family:var(--font-heading);font-size:1.5rem;font-weight:700;margin-bottom:24px;">Profile Settings</h2>
        <div style="background:var(--surface-container-lowest);border-radius:var(--radius-lg);padding:32px;max-width:540px;">
          <form id="profile-form">
            <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-input" name="full_name" value="${state.profile?.full_name || ''}"></div>
            <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" value="${state.user.email}" disabled></div>
            <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" name="phone" value="${state.profile?.phone || ''}"></div>
            <div class="form-group"><label class="form-label">City</label><input type="text" class="form-input" name="city" value="${state.profile?.city || ''}"></div>
            <button type="submit" class="btn btn--primary">Save Changes</button>
          </form>
        </div>`;
      document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        await updateProfile(state.user.id, { full_name: fd.get('full_name'), phone: fd.get('phone'), city: fd.get('city') });
        showToast('Profile updated!', 'success');
      });
      break;
    }
  }
}
