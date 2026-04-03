import { renderNavbar, initNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';
import { renderCarCard } from '../components/car-card';
import { getCarById, getSimilarCars, toggleFavorite, sendMessage } from '../lib/supabase';
import { formatPrice, formatKm, calculateEMI, getState, addToCompare, addToRecentlyViewed } from '../lib/state';
import { DUMMY_CARS } from '../lib/dummy-data';
import { showToast, showModal } from '../components/ui';
import { router } from '../lib/router';

export async function renderDetailPage(params?: Record<string, string>) {
  const carId = params?.id || '';
  const app = document.getElementById('app')!;
  
  app.innerHTML = renderNavbar() + `<div style="max-width:1280px;margin:0 auto;padding:32px 2rem;"><div class="loading-spinner"></div></div>`;
  initNavbar();

  let car: any;
  try {
    const { data } = await getCarById(carId);
    car = data;
  } catch {}
  
  if (!car) car = DUMMY_CARS.find(c => c.id === carId) || DUMMY_CARS[0];

  const specs = car.specifications || {};
  const emi = calculateEMI(car.price);
  const img = car.car_images?.[0]?.image_url || `/images/cars/${car.brand?.toLowerCase()}-${car.model?.toLowerCase().replace(/\s+/g,'-')}.png`;

  addToRecentlyViewed(carId);

  app.innerHTML = renderNavbar() + `
  <main>
    <div style="max-width:1280px;margin:0 auto;padding:16px 2rem;">
      <a href="/cars" data-route style="display:inline-flex;align-items:center;gap:6px;color:var(--on-surface-variant);font-size:0.875rem;margin-bottom:16px;">
        ← Back to listings
      </a>
    </div>
    <div class="detail-layout">
      <div>
        <div class="detail-gallery">
          <img src="${img}" alt="${car.title}" class="detail-gallery__main" id="main-image" onerror="this.src='/images/cars/hyundai-creta.png'">
        </div>
        <div class="detail-gallery__thumbs">
          ${(car.car_images || [{image_url: img}]).map((img: any, i: number) => `
            <div class="detail-gallery__thumb ${i === 0 ? 'active' : ''}" data-img="${img.image_url}">
              <img src="${img.image_url}" alt="Thumbnail ${i+1}" onerror="this.src='/images/cars/hyundai-creta.png'">
            </div>
          `).join('')}
        </div>

        <div style="margin-top:32px;">
          <h1 style="font-family:var(--font-heading);font-size:1.75rem;font-weight:800;">${car.year} ${car.brand} ${car.model}</h1>
          <div class="detail-trust-badges">
            ${car.is_verified ? '<span class="detail-trust-badge">✅ Verified Seller</span>' : ''}
            ${car.is_inspected ? '<span class="detail-trust-badge">🔍 Inspected</span>' : ''}
            ${car.has_warranty ? '<span class="detail-trust-badge">🛡️ Warranty</span>' : ''}
          </div>
        </div>

        <div class="detail-specs-grid">
          <div class="detail-spec"><div class="detail-spec__label">Year</div><div class="detail-spec__value">${car.year}</div></div>
          <div class="detail-spec"><div class="detail-spec__label">Fuel Type</div><div class="detail-spec__value">${car.fuel_type}</div></div>
          <div class="detail-spec"><div class="detail-spec__label">Transmission</div><div class="detail-spec__value">${car.transmission}</div></div>
          <div class="detail-spec"><div class="detail-spec__label">KM Driven</div><div class="detail-spec__value">${formatKm(car.km_driven)}</div></div>
          <div class="detail-spec"><div class="detail-spec__label">Owner</div><div class="detail-spec__value">${car.owner_number}${car.owner_number===1?'st':car.owner_number===2?'nd':'rd'}</div></div>
          <div class="detail-spec"><div class="detail-spec__label">Body Type</div><div class="detail-spec__value">${car.body_type || 'Sedan'}</div></div>
        </div>

        <div style="margin:32px 0;">
          <h3 style="font-weight:700;margin-bottom:16px;">About this car</h3>
          <p style="color:var(--on-surface-variant);line-height:1.8;">${car.description || 'No description provided.'}</p>
        </div>

        ${specs.engine ? `
        <div style="margin:32px 0;">
          <h3 style="font-weight:700;margin-bottom:16px;">Specifications</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            ${Object.entries(specs).map(([k,v]) => `
              <div style="display:flex;justify-content:space-between;padding:12px 16px;background:var(--surface-container-low);border-radius:var(--radius-md);">
                <span style="color:var(--on-surface-variant);text-transform:capitalize;">${k}</span>
                <span style="font-weight:600;">${v}</span>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <div class="emi-calc">
          <h3 style="font-weight:700;margin-bottom:20px;">EMI Calculator</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
            <div class="form-group">
              <label class="form-label">Down Payment (₹)</label>
              <input type="number" class="form-input" id="emi-down" value="${Math.round(car.price * 0.2)}" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Interest Rate (%)</label>
              <input type="number" class="form-input" id="emi-rate" value="9.5" min="1" max="20" step="0.5">
            </div>
            <div class="form-group">
              <label class="form-label">Tenure (months)</label>
              <select class="form-select" id="emi-tenure">
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
                <option value="48">48 months</option>
                <option value="60" selected>60 months</option>
                <option value="72">72 months</option>
                <option value="84">84 months</option>
              </select>
            </div>
          </div>
          <div class="emi-calc__result">
            <div style="font-size:0.875rem;color:var(--on-surface-variant);margin-bottom:4px;">Your Monthly EMI</div>
            <div class="emi-calc__amount" id="emi-result">₹${emi.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div style="margin-top:48px;">
          <h3 style="font-weight:700;margin-bottom:24px;">Similar Cars</h3>
          <div class="car-grid" id="similar-cars"><div class="loading-spinner"></div></div>
        </div>
      </div>

      <div class="detail-sidebar">
        <div class="detail-price-card">
          <div class="detail-price">${formatPrice(car.price)}</div>
          <div class="detail-emi">EMI starts at ₹${emi.toLocaleString('en-IN')}/month</div>
          <div class="detail-actions">
            <button class="btn btn--primary btn--lg" style="width:100%" id="contact-seller-btn">
              📞 Contact Seller
            </button>
            <button class="btn btn--secondary btn--lg" style="width:100%" id="test-drive-btn">
              🚗 Schedule Test Drive
            </button>
            <div style="display:flex;gap:8px;">
              <button class="btn btn--ghost" style="flex:1" id="fav-btn">♡ Save</button>
              <button class="btn btn--ghost" style="flex:1" id="compare-btn">⚖ Compare</button>
              <button class="btn btn--ghost" style="flex:1" id="share-btn">↗ Share</button>
            </div>
          </div>
        </div>
        <div class="detail-seller">
          <div class="detail-seller__header">
            <div class="detail-seller__avatar">${(car.profiles?.full_name || 'S').charAt(0)}</div>
            <div>
              <div style="font-weight:700;">${car.profiles?.full_name || 'Verified Seller'}</div>
              <div style="font-size:0.8125rem;color:var(--on-surface-variant);">${car.city}</div>
            </div>
          </div>
          <div style="font-size:0.875rem;color:var(--on-surface-variant);">
            Member since 2024 · ${car.is_verified ? '✅ Verified' : ''}
          </div>
        </div>
      </div>
    </div>
  </main>
  ` + renderFooter();

  initNavbar();
  initDetailInteractions(car);
  loadSimilarCars(car);
}

function initDetailInteractions(car: any) {
  // Thumbnail gallery
  document.querySelectorAll('.detail-gallery__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.detail-gallery__thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const mainImg = document.getElementById('main-image') as HTMLImageElement;
      if (mainImg) mainImg.src = thumb.getAttribute('data-img') || '';
    });
  });

  // EMI Calculator
  const calcEMI = () => {
    const down = Number((document.getElementById('emi-down') as HTMLInputElement).value);
    const rate = Number((document.getElementById('emi-rate') as HTMLInputElement).value);
    const tenure = Number((document.getElementById('emi-tenure') as HTMLSelectElement).value);
    const principal = car.price - down;
    const emi = calculateEMI(principal > 0 ? principal : 0, rate, tenure);
    document.getElementById('emi-result')!.textContent = `₹${emi.toLocaleString('en-IN')}`;
  };
  document.getElementById('emi-down')?.addEventListener('input', calcEMI);
  document.getElementById('emi-rate')?.addEventListener('input', calcEMI);
  document.getElementById('emi-tenure')?.addEventListener('change', calcEMI);

  // Contact Seller
  document.getElementById('contact-seller-btn')?.addEventListener('click', () => {
    const state = getState();
    if (!state.user) { showToast('Please login to contact seller', 'info'); router.navigate('/auth'); return; }
    showModal('Contact Seller', `
      <div class="form-group"><label class="form-label">Your Message</label>
        <textarea class="form-textarea" name="message" placeholder="Hi, I'm interested in this ${car.brand} ${car.model}..." required></textarea>
      </div>
      <button type="submit" class="btn btn--primary" style="width:100%">Send Message</button>
    `, async (formData) => {
      const msg = formData.get('message') as string;
      if (msg && car.seller_id) await sendMessage(state.user.id, car.seller_id, car.id, msg, 'enquiry');
      showToast('Message sent to seller!', 'success');
    });
  });

  // Test Drive
  document.getElementById('test-drive-btn')?.addEventListener('click', () => {
    const state = getState();
    if (!state.user) { showToast('Please login to schedule a test drive', 'info'); router.navigate('/auth'); return; }
    showModal('Schedule Test Drive', `
      <div class="form-group"><label class="form-label">Preferred Date</label><input type="date" class="form-input" name="date" required></div>
      <div class="form-group"><label class="form-label">Preferred Time</label><select class="form-select" name="time"><option>10:00 AM</option><option>12:00 PM</option><option>2:00 PM</option><option>4:00 PM</option></select></div>
      <div class="form-group"><label class="form-label">Phone Number</label><input type="tel" class="form-input" name="phone" required></div>
      <button type="submit" class="btn btn--primary" style="width:100%">Schedule Test Drive</button>
    `, async (_formData) => {
      showToast('Test drive scheduled successfully!', 'success');
    });
  });

  // Favorite
  document.getElementById('fav-btn')?.addEventListener('click', async () => {
    const state = getState();
    if (!state.user) { showToast('Please login first', 'info'); router.navigate('/auth'); return; }
    const isFav = await toggleFavorite(state.user.id, car.id);
    showToast(isFav ? 'Added to saved cars!' : 'Removed from saved cars', isFav ? 'success' : 'info');
  });

  // Compare
  document.getElementById('compare-btn')?.addEventListener('click', () => {
    const added = addToCompare(car.id);
    showToast(added ? 'Added to compare list' : 'Compare list is full (max 3)', added ? 'success' : 'info');
  });

  // Share
  document.getElementById('share-btn')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link copied to clipboard!', 'success');
  });
}

async function loadSimilarCars(car: any) {
  const container = document.getElementById('similar-cars');
  if (!container) return;
  try {
    const { data } = await getSimilarCars(car.id, car.brand, car.price);
    const cars = data && data.length > 0 ? data : DUMMY_CARS.filter(c => c.id !== car.id && (c.brand === car.brand || Math.abs(c.price - car.price) < car.price * 0.3)).slice(0, 4);
    container.innerHTML = cars.map((c: any) => renderCarCard(c)).join('') || '<p style="color:var(--on-surface-variant)">No similar cars found</p>';
  } catch {
    const simCars = DUMMY_CARS.filter(c => c.id !== car.id && c.brand === car.brand).slice(0, 4);
    container.innerHTML = simCars.map((c: any) => renderCarCard(c)).join('');
  }
}
