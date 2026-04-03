import { getState } from '../lib/state';
import { signOut } from '../lib/supabase';
import { router } from '../lib/router';

export function renderNavbar(): string {
  const state = getState();
  const user = state.user;
  
  return `
  <nav class="navbar" id="navbar">
    <a href="/" data-route class="navbar__logo">
      Second<span>Gear</span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    </a>
    <div class="navbar__nav">
      <a href="/cars" data-route class="navbar__link">Buy Car</a>
      <a href="/sell" data-route class="navbar__link">Sell Car</a>
      <a href="/compare" data-route class="navbar__link">Compare</a>
    </div>
    <div class="navbar__actions">
      ${user ? `
        <a href="/dashboard" data-route class="btn btn--ghost btn--sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Dashboard
        </a>
        <button class="btn btn--ghost btn--sm" id="logout-btn">Logout</button>
      ` : `
        <a href="/auth" data-route class="btn btn--ghost btn--sm">Login</a>
        <a href="/auth" data-route class="btn btn--primary btn--sm">Sign Up</a>
      `}
    </div>
  </nav>`;
}

export function initNavbar() {
  // Scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut();
      router.navigate('/');
    });
  }
}
