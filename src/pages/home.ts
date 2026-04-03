import { renderNavbar, initNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';
import { renderCarCard, renderCarCardSkeleton } from '../components/car-card';
import { getFeaturedCars } from '../lib/supabase';
import { addToCompare } from '../lib/state';
import { showToast } from '../components/ui';
import { router } from '../lib/router';
import { DUMMY_CARS } from '../lib/dummy-data';

const BRANDS = ['Maruti', 'Hyundai', 'Honda', 'Toyota', 'BMW', 'Mercedes', 'Audi', 'Tata'];
const BUDGETS = [
  { label: 'Under ₹3L', icon: '💰', min: 0, max: 300000, count: '120+ cars' },
  { label: '₹3L - ₹5L', icon: '🚗', min: 300000, max: 500000, count: '85+ cars' },
  { label: '₹5L - ₹8L', icon: '🚙', min: 500000, max: 800000, count: '200+ cars' },
  { label: '₹8L - ₹12L', icon: '🏎️', min: 800000, max: 1200000, count: '150+ cars' },
  { label: '₹12L - ₹20L', icon: '✨', min: 1200000, max: 2000000, count: '90+ cars' },
  { label: '₹20L+', icon: '👑', min: 2000000, max: 99999999, count: '40+ cars' },
];

export async function renderHomePage() {
  const app = document.getElementById('app')!;
  app.innerHTML = renderNavbar() + `
  <main>
    <section class="hero">
      <h1 class="hero__title">Find Your Perfect<br>Pre-Owned Car</h1>
      <p class="hero__subtitle">India's most trusted marketplace for certified second-hand cars</p>
      <div class="hero__search">
        <input type="text" class="hero__search-input" id="hero-search" placeholder="Search by brand, model, or city..." autocomplete="off">
        <button class="hero__search-btn" id="hero-search-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:6px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Search Cars
        </button>
      </div>
      <div class="hero__stats">
        <div class="hero__stat"><div class="hero__stat-number">1,200+</div><div class="hero__stat-label">Verified Cars</div></div>
        <div class="hero__stat"><div class="hero__stat-number">500+</div><div class="hero__stat-label">Happy Customers</div></div>
        <div class="hero__stat"><div class="hero__stat-number">50+</div><div class="hero__stat-label">Cities</div></div>
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <h2 class="section__title">Browse by Budget</h2>
        <p class="section__subtitle">Find cars that fit your budget perfectly</p>
      </div>
      <div class="budget-grid">
        ${BUDGETS.map(b => `
          <div class="budget-card" data-min="${b.min}" data-max="${b.max}">
            <div class="budget-card__icon">${b.icon}</div>
            <div class="budget-card__label">${b.label}</div>
            <div class="budget-card__count">${b.count}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="section--alt">
      <div class="section__inner">
        <div class="section__header">
          <h2 class="section__title">Browse by Brand</h2>
          <p class="section__subtitle">Explore cars from your favorite brands</p>
        </div>
        <div class="brand-grid">
          ${BRANDS.map(b => `
            <div class="brand-card" data-brand="${b}">
              <div class="brand-card__logo">${b.charAt(0)}</div>
              <div class="brand-card__name">${b}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <h2 class="section__title">Featured Cars</h2>
        <p class="section__subtitle">Hand-picked selections for you</p>
      </div>
      <div class="carousel" id="featured-carousel">
        <div class="car-grid" id="featured-cars">
          ${Array(3).fill(0).map(() => renderCarCardSkeleton()).join('')}
        </div>
      </div>
      <div style="text-align:center;margin-top:32px">
        <a href="/cars" data-route class="btn btn--secondary btn--lg">View All Cars →</a>
      </div>
    </section>

    <section class="section--alt">
      <div class="section__inner">
        <div class="section__header">
          <h2 class="section__title">Why Choose Second Gear?</h2>
          <p class="section__subtitle">Every car goes through our rigorous trust process</p>
        </div>
        <div class="trust-grid">
          <div class="trust-card">
            <div class="trust-card__icon">🔍</div>
            <div class="trust-card__title">200-Point Inspection</div>
            <div class="trust-card__desc">Every car undergoes a comprehensive 200-point inspection by certified mechanics before listing.</div>
          </div>
          <div class="trust-card">
            <div class="trust-card__icon">✅</div>
            <div class="trust-card__title">Verified Sellers</div>
            <div class="trust-card__desc">All sellers are verified with ID proof and address verification for your complete peace of mind.</div>
          </div>
          <div class="trust-card">
            <div class="trust-card__icon">🛡️</div>
            <div class="trust-card__title">6-Month Warranty</div>
            <div class="trust-card__desc">Get up to 6 months engine and transmission warranty on every certified car purchase.</div>
          </div>
          <div class="trust-card">
            <div class="trust-card__icon">💳</div>
            <div class="trust-card__title">Easy Financing</div>
            <div class="trust-card__desc">Get instant loan approvals with EMIs starting as low as ₹4,999/month from our banking partners.</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="sell-cta">
        <div>
          <h2 class="sell-cta__title">Want to Sell Your Car?</h2>
          <p class="sell-cta__desc">Get the best price for your car in just 3 simple steps. Free listing, instant valuation, and connect with genuine buyers.</p>
        </div>
        <a href="/sell" data-route class="btn btn--primary btn--lg">Sell My Car →</a>
      </div>
    </section>
  </main>
  ` + renderFooter();

  initNavbar();
  loadFeaturedCars();
  initHomeInteractions();
}

async function loadFeaturedCars() {
  const container = document.getElementById('featured-cars');
  if (!container) return;

  try {
    const { data } = await getFeaturedCars();
    const cars = data && data.length > 0 ? data : DUMMY_CARS.filter(c => c.featured).slice(0, 6);
    container.innerHTML = cars.map((car: any) => renderCarCard(car)).join('');
  } catch {
    container.innerHTML = DUMMY_CARS.filter(c => c.featured).slice(0, 6).map((car: any) => renderCarCard(car)).join('');
  }
}

function initHomeInteractions() {
  // Search
  document.getElementById('hero-search-btn')?.addEventListener('click', () => {
    const input = document.getElementById('hero-search') as HTMLInputElement;
    if (input.value.trim()) router.navigate(`/cars?search=${encodeURIComponent(input.value.trim())}`);
    else router.navigate('/cars');
  });
  document.getElementById('hero-search')?.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') document.getElementById('hero-search-btn')?.click();
  });

  // Budget cards
  document.querySelectorAll('.budget-card').forEach(card => {
    card.addEventListener('click', () => {
      const min = card.getAttribute('data-min');
      const max = card.getAttribute('data-max');
      router.navigate(`/cars?minPrice=${min}&maxPrice=${max}`);
    });
  });

  // Brand cards
  document.querySelectorAll('.brand-card').forEach(card => {
    card.addEventListener('click', () => {
      const brand = card.getAttribute('data-brand');
      router.navigate(`/cars?brand=${brand}`);
    });
  });

  // Compare buttons
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.compare-add-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-compare-id');
      if (id) {
        const added = addToCompare(id);
        showToast(added ? 'Added to compare' : 'Compare list full (max 3)', added ? 'success' : 'info');
      }
    }
  });
}
