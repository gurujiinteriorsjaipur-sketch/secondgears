import { renderNavbar, initNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';
import { renderCarCard, renderCarCardSkeleton } from '../components/car-card';
import { getCars } from '../lib/supabase';
import { DUMMY_CARS } from '../lib/dummy-data';
import { addToCompare } from '../lib/state';
import { showToast } from '../components/ui';

const BRANDS = ['Maruti', 'Hyundai', 'Honda', 'Toyota', 'BMW', 'Mercedes', 'Audi', 'Tata'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Minivan'];

let currentFilters: any = {};
let currentPage = 0;

export async function renderListingsPage() {
  const params = new URLSearchParams(window.location.search);
  currentFilters = {
    brand: params.get('brand') || '',
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    fuelType: params.get('fuelType') || '',
    transmission: params.get('transmission') || '',
    search: params.get('search') || '',
    sortBy: params.get('sort') || 'newest',
  };

  const app = document.getElementById('app')!;
  app.innerHTML = renderNavbar() + `
  <main style="max-width:1280px;margin:0 auto;padding:32px 2rem;">
    <div style="margin-bottom:24px;">
      <h1 style="font-family:var(--font-heading);font-size:1.75rem;font-weight:800;">
        ${currentFilters.brand ? currentFilters.brand + ' Cars' : currentFilters.search ? `Results for "${currentFilters.search}"` : 'All Cars'}
      </h1>
      <p style="color:var(--on-surface-variant);margin-top:4px;" id="results-count">Loading...</p>
    </div>
    <div class="listings-layout">
      <aside class="filter-sidebar" id="filter-sidebar">
        <h3 style="font-weight:700;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">
          Filters <button class="btn btn--ghost btn--sm" id="clear-filters">Clear All</button>
        </h3>
        <div class="filter-group">
          <div class="filter-group__title">Price Range</div>
          <input type="range" class="filter-range" id="filter-price" min="0" max="10000000" step="100000" value="${currentFilters.maxPrice || 10000000}">
          <div class="filter-range-labels"><span>₹0</span><span id="price-label">₹${((currentFilters.maxPrice || 10000000) / 100000).toFixed(0)}L</span></div>
        </div>
        <div class="filter-group">
          <div class="filter-group__title">Brand</div>
          ${BRANDS.map(b => `<label class="filter-checkbox"><input type="checkbox" name="brand" value="${b}" ${currentFilters.brand === b ? 'checked' : ''}> ${b}</label>`).join('')}
        </div>
        <div class="filter-group">
          <div class="filter-group__title">Fuel Type</div>
          ${FUEL_TYPES.map(f => `<label class="filter-checkbox"><input type="checkbox" name="fuelType" value="${f}" ${currentFilters.fuelType === f ? 'checked' : ''}> ${f}</label>`).join('')}
        </div>
        <div class="filter-group">
          <div class="filter-group__title">Transmission</div>
          <label class="filter-checkbox"><input type="checkbox" name="transmission" value="Manual" ${currentFilters.transmission === 'Manual' ? 'checked' : ''}> Manual</label>
          <label class="filter-checkbox"><input type="checkbox" name="transmission" value="Automatic" ${currentFilters.transmission === 'Automatic' ? 'checked' : ''}> Automatic</label>
        </div>
        <div class="filter-group">
          <div class="filter-group__title">Body Type</div>
          ${BODY_TYPES.map(b => `<label class="filter-checkbox"><input type="checkbox" name="bodyType" value="${b}"> ${b}</label>`).join('')}
        </div>
        <button class="btn btn--primary" style="width:100%" id="apply-filters">Apply Filters</button>
      </aside>
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <div style="display:flex;gap:8px;align-items:center;">
            <span style="font-size:0.875rem;color:var(--on-surface-variant);">Sort by:</span>
            <select class="form-select" style="width:auto;padding:8px 12px;" id="sort-select">
              <option value="newest" ${currentFilters.sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
              <option value="price_asc" ${currentFilters.sortBy === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price_desc" ${currentFilters.sortBy === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
              <option value="popular" ${currentFilters.sortBy === 'popular' ? 'selected' : ''}>Most Popular</option>
            </select>
          </div>
        </div>
        <div class="car-grid" id="car-listings">
          ${Array(6).fill(0).map(() => renderCarCardSkeleton()).join('')}
        </div>
        <div style="text-align:center;margin-top:32px;" id="pagination"></div>
      </div>
    </div>
  </main>
  ` + renderFooter();

  initNavbar();
  await loadCars();
  initFilters();
}

async function loadCars() {
  const container = document.getElementById('car-listings');
  const countEl = document.getElementById('results-count');
  if (!container) return;

  try {
    const { data, count } = await getCars({ ...currentFilters, limit: 12, offset: currentPage * 12 });
    let cars = data && data.length > 0 ? data : filterDummyCars();
    const total = count || cars.length;
    
    if (!data || data.length === 0) cars = filterDummyCars();
    
    if (countEl) countEl.textContent = `${total} cars found`;
    
    if (cars.length === 0) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">🚗</div><div class="empty-state__title">No cars found</div><div class="empty-state__desc">Try adjusting your filters</div></div>`;
    } else {
      container.innerHTML = cars.map((car: any) => renderCarCard(car)).join('');
    }
  } catch {
    const cars = filterDummyCars();
    if (countEl) countEl.textContent = `${cars.length} cars found`;
    container.innerHTML = cars.map((car: any) => renderCarCard(car)).join('');
  }
}

function filterDummyCars(): any[] {
  let cars = [...DUMMY_CARS];
  if (currentFilters.brand) cars = cars.filter(c => c.brand === currentFilters.brand);
  if (currentFilters.minPrice) cars = cars.filter(c => c.price >= currentFilters.minPrice);
  if (currentFilters.maxPrice) cars = cars.filter(c => c.price <= currentFilters.maxPrice);
  if (currentFilters.fuelType) cars = cars.filter(c => c.fuel_type === currentFilters.fuelType);
  if (currentFilters.transmission) cars = cars.filter(c => c.transmission === currentFilters.transmission);
  if (currentFilters.search) {
    const s = currentFilters.search.toLowerCase();
    cars = cars.filter(c => c.title.toLowerCase().includes(s) || c.brand.toLowerCase().includes(s) || c.model.toLowerCase().includes(s));
  }
  switch (currentFilters.sortBy) {
    case 'price_asc': cars.sort((a, b) => a.price - b.price); break;
    case 'price_desc': cars.sort((a, b) => b.price - a.price); break;
    case 'popular': cars.sort((a, b) => b.views_count - a.views_count); break;
  }
  return cars;
}

function initFilters() {
  document.getElementById('apply-filters')?.addEventListener('click', applyFilters);
  document.getElementById('clear-filters')?.addEventListener('click', () => {
    document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach((cb: any) => cb.checked = false);
    (document.getElementById('filter-price') as HTMLInputElement).value = '10000000';
    currentFilters = { sortBy: 'newest' };
    loadCars();
  });
  document.getElementById('filter-price')?.addEventListener('input', (e) => {
    const val = Number((e.target as HTMLInputElement).value);
    document.getElementById('price-label')!.textContent = `₹${(val / 100000).toFixed(0)}L`;
  });
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    currentFilters.sortBy = (e.target as HTMLSelectElement).value;
    loadCars();
  });
}

function applyFilters() {
  const checkedBrand = document.querySelector<HTMLInputElement>('.filter-sidebar input[name="brand"]:checked');
  const checkedFuel = document.querySelector<HTMLInputElement>('.filter-sidebar input[name="fuelType"]:checked');
  const checkedTrans = document.querySelector<HTMLInputElement>('.filter-sidebar input[name="transmission"]:checked');
  const priceVal = Number((document.getElementById('filter-price') as HTMLInputElement).value);

  currentFilters.brand = checkedBrand?.value || '';
  currentFilters.fuelType = checkedFuel?.value || '';
  currentFilters.transmission = checkedTrans?.value || '';
  currentFilters.maxPrice = priceVal < 10000000 ? priceVal : undefined;
  currentPage = 0;
  loadCars();
}
