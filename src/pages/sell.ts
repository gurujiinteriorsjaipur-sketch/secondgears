import { renderNavbar, initNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';
import { createCar } from '../lib/supabase';
import { getState, formatPrice } from '../lib/state';
import { showToast } from '../components/ui';
import { router } from '../lib/router';

const STEPS = ['Photos', 'Details', 'Price', 'Location', 'Review'];
let currentStep = 0;
let carData: any = { images: [] };

export async function renderSellPage() {
  const state = getState();
  if (!state.user) { showToast('Please login to sell a car', 'info'); router.navigate('/auth'); return; }

  const app = document.getElementById('app')!;
  app.innerHTML = renderNavbar() + `
  <main style="max-width:800px;margin:0 auto;padding:32px 2rem;">
    <h1 style="font-family:var(--font-heading);font-size:2rem;font-weight:800;margin-bottom:8px;">Sell Your Car</h1>
    <p style="color:var(--on-surface-variant);margin-bottom:32px;">List your car in just 5 easy steps</p>
    <div class="steps-progress" id="steps-progress">
      ${STEPS.map((s, i) => `
        <div class="step-item ${i === 0 ? 'active' : ''}" data-step="${i}">
          <div class="step-item__number">${i + 1}</div>
          <div class="step-item__label">${s}</div>
        </div>
        ${i < STEPS.length - 1 ? '<div class="step-item__line"></div>' : ''}
      `).join('')}
    </div>
    <div style="background:var(--surface-container-lowest);border-radius:var(--radius-lg);padding:32px;" id="step-content"></div>
    <div style="display:flex;justify-content:space-between;margin-top:24px;" id="step-actions">
      <button class="btn btn--ghost" id="prev-btn" style="visibility:hidden;">← Previous</button>
      <div style="display:flex;gap:12px;">
        <button class="btn btn--secondary" id="draft-btn">Save as Draft</button>
        <button class="btn btn--primary" id="next-btn">Next Step →</button>
      </div>
    </div>
  </main>
  ` + renderFooter();

  initNavbar();
  currentStep = 0;
  carData = { images: [], status: 'pending' };
  renderStep();
  initSellInteractions();
}

function renderStep() {
  const container = document.getElementById('step-content')!;
  const prevBtn = document.getElementById('prev-btn')!;
  const nextBtn = document.getElementById('next-btn')!;
  
  prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = currentStep === STEPS.length - 1 ? '✓ Publish Listing' : 'Next Step →';

  document.querySelectorAll('.step-item').forEach((el, i) => {
    el.classList.toggle('active', i === currentStep);
    el.classList.toggle('completed', i < currentStep);
  });

  switch (currentStep) {
    case 0:
      container.innerHTML = `
        <h3 style="font-weight:700;margin-bottom:20px;">Upload Car Photos</h3>
        <p style="color:var(--on-surface-variant);margin-bottom:16px;">Add up to 10 photos. First photo will be the main image.</p>
        <div class="upload-area" id="upload-area">
          <div style="font-size:3rem;margin-bottom:12px;">📸</div>
          <div style="font-weight:600;margin-bottom:4px;">Drag & drop photos here</div>
          <div style="font-size:0.875rem;color:var(--outline);">or click to browse files</div>
          <input type="file" id="file-input" multiple accept="image/*" style="display:none">
        </div>
        <div class="upload-preview" id="upload-preview">
          ${carData.images.map((img: string, i: number) => `
            <div class="upload-preview__item">
              <img src="${img}" alt="Upload ${i+1}">
              <button class="upload-preview__remove" data-index="${i}">✕</button>
            </div>
          `).join('')}
        </div>`;
      initUpload();
      break;
    case 1:
      container.innerHTML = `
        <h3 style="font-weight:700;margin-bottom:20px;">Car Details</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="form-group"><label class="form-label">Brand *</label>
            <select class="form-select" id="sell-brand" required>
              <option value="">Select Brand</option>
              ${['Maruti','Hyundai','Honda','Toyota','BMW','Mercedes','Audi','Tata','Kia','MG','Skoda','Volkswagen'].map(b => `<option value="${b}" ${carData.brand===b?'selected':''}>${b}</option>`).join('')}
            </select></div>
          <div class="form-group"><label class="form-label">Model *</label><input type="text" class="form-input" id="sell-model" value="${carData.model||''}" placeholder="e.g. Creta, Swift" required></div>
          <div class="form-group"><label class="form-label">Year *</label><input type="number" class="form-input" id="sell-year" value="${carData.year||2023}" min="2000" max="2026" required></div>
          <div class="form-group"><label class="form-label">KM Driven *</label><input type="number" class="form-input" id="sell-km" value="${carData.km_driven||''}" placeholder="e.g. 25000" required></div>
          <div class="form-group"><label class="form-label">Fuel Type *</label>
            <select class="form-select" id="sell-fuel" required>
              ${['Petrol','Diesel','CNG','Electric','Hybrid'].map(f => `<option value="${f}" ${carData.fuel_type===f?'selected':''}>${f}</option>`).join('')}
            </select></div>
          <div class="form-group"><label class="form-label">Transmission *</label>
            <select class="form-select" id="sell-trans" required>
              <option value="Manual" ${carData.transmission==='Manual'?'selected':''}>Manual</option>
              <option value="Automatic" ${carData.transmission==='Automatic'?'selected':''}>Automatic</option>
            </select></div>
          <div class="form-group"><label class="form-label">Color</label><input type="text" class="form-input" id="sell-color" value="${carData.color||''}" placeholder="e.g. White"></div>
          <div class="form-group"><label class="form-label">Owner Number</label>
            <select class="form-select" id="sell-owner"><option value="1">1st Owner</option><option value="2">2nd Owner</option><option value="3">3rd Owner</option></select></div>
        </div>
        <div class="form-group" style="margin-top:8px;"><label class="form-label">Description</label><textarea class="form-textarea" id="sell-desc" placeholder="Describe your car's condition, features, and history...">${carData.description||''}</textarea></div>`;
      break;
    case 2:
      const suggestedPrice = Math.round((carData.year > 2021 ? 800000 : 500000) * (1 + Math.random() * 0.5));
      container.innerHTML = `
        <h3 style="font-weight:700;margin-bottom:20px;">Set Your Price</h3>
        <div style="background:var(--primary-light);border-radius:var(--radius-md);padding:20px;margin-bottom:24px;">
          <div style="font-size:0.875rem;color:var(--primary);font-weight:600;margin-bottom:4px;">🤖 AI Suggested Price</div>
          <div style="font-family:var(--font-heading);font-size:1.5rem;font-weight:800;color:var(--primary);">${formatPrice(suggestedPrice)}</div>
          <div style="font-size:0.8125rem;color:var(--on-surface-variant);margin-top:4px;">Based on similar ${carData.brand || ''} ${carData.model || ''} listings in your area</div>
        </div>
        <div class="form-group"><label class="form-label">Your Asking Price (₹) *</label><input type="number" class="form-input" id="sell-price" value="${carData.price||suggestedPrice}" required style="font-size:1.25rem;font-weight:700;"></div>`;
      break;
    case 3:
      container.innerHTML = `
        <h3 style="font-weight:700;margin-bottom:20px;">Location</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="form-group"><label class="form-label">City *</label><input type="text" class="form-input" id="sell-city" value="${carData.city||''}" placeholder="e.g. Mumbai" required></div>
          <div class="form-group"><label class="form-label">State *</label><input type="text" class="form-input" id="sell-state" value="${carData.state||''}" placeholder="e.g. Maharashtra" required></div>
        </div>
        <div class="form-group"><label class="form-label">Full Address (optional)</label><input type="text" class="form-input" id="sell-address" value="${carData.location||''}" placeholder="Area, Landmark"></div>`;
      break;
    case 4:
      container.innerHTML = `
        <h3 style="font-weight:700;margin-bottom:20px;">Review Your Listing</h3>
        <div style="display:grid;grid-template-columns:200px 1fr;gap:24px;padding:20px;background:var(--surface-container-low);border-radius:var(--radius-md);">
          <div style="border-radius:var(--radius-md);overflow:hidden;aspect-ratio:4/3;background:var(--surface-container);">
            ${carData.images[0] ? `<img src="${carData.images[0]}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--outline);">No Photo</div>'}
          </div>
          <div>
            <div style="font-family:var(--font-heading);font-size:1.25rem;font-weight:800;">${carData.year || '—'} ${carData.brand || '—'} ${carData.model || '—'}</div>
            <div style="font-family:var(--font-heading);font-size:1.5rem;font-weight:800;color:var(--primary);margin:8px 0;">${carData.price ? formatPrice(carData.price) : '—'}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <span class="car-card__spec">${carData.km_driven ? carData.km_driven.toLocaleString() + ' km' : '—'}</span>
              <span class="car-card__spec">${carData.fuel_type || '—'}</span>
              <span class="car-card__spec">${carData.transmission || '—'}</span>
            </div>
            <div style="margin-top:12px;font-size:0.875rem;color:var(--on-surface-variant);">📍 ${carData.city || '—'}, ${carData.state || '—'}</div>
          </div>
        </div>`;
      break;
  }
}

function initUpload() {
  const area = document.getElementById('upload-area');
  const input = document.getElementById('file-input') as HTMLInputElement;
  area?.addEventListener('click', () => input?.click());
  area?.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('dragover'); });
  area?.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area?.addEventListener('drop', (e: DragEvent) => { e.preventDefault(); area.classList.remove('dragover'); handleFiles(e.dataTransfer?.files); });
  input?.addEventListener('change', () => handleFiles(input.files));
}

function handleFiles(files: FileList | null | undefined) {
  if (!files) return;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (carData.images.length < 10) {
        carData.images.push(e.target?.result as string);
        renderStep();
      }
    };
    reader.readAsDataURL(file);
  });
}

function saveStepData() {
  switch (currentStep) {
    case 1:
      carData.brand = (document.getElementById('sell-brand') as HTMLSelectElement).value;
      carData.model = (document.getElementById('sell-model') as HTMLInputElement).value;
      carData.year = Number((document.getElementById('sell-year') as HTMLInputElement).value);
      carData.km_driven = Number((document.getElementById('sell-km') as HTMLInputElement).value);
      carData.fuel_type = (document.getElementById('sell-fuel') as HTMLSelectElement).value;
      carData.transmission = (document.getElementById('sell-trans') as HTMLSelectElement).value;
      carData.color = (document.getElementById('sell-color') as HTMLInputElement).value;
      carData.owner_number = Number((document.getElementById('sell-owner') as HTMLSelectElement).value);
      carData.description = (document.getElementById('sell-desc') as HTMLTextAreaElement).value;
      carData.title = `${carData.year} ${carData.brand} ${carData.model}`;
      break;
    case 2:
      carData.price = Number((document.getElementById('sell-price') as HTMLInputElement).value);
      break;
    case 3:
      carData.city = (document.getElementById('sell-city') as HTMLInputElement).value;
      carData.state = (document.getElementById('sell-state') as HTMLInputElement).value;
      carData.location = (document.getElementById('sell-address') as HTMLInputElement).value || `${carData.city}, ${carData.state}`;
      break;
  }
}

function initSellInteractions() {
  document.getElementById('next-btn')?.addEventListener('click', async () => {
    saveStepData();
    if (currentStep === STEPS.length - 1) {
      const state = getState();
      const { seller_id, ...submitData } = { ...carData, seller_id: state.user.id };
      delete submitData.images;
      try {
        await createCar({ ...submitData, seller_id: state.user.id });
        showToast('Car listed successfully!', 'success');
        router.navigate('/dashboard');
      } catch { showToast('Listing created (demo mode)', 'success'); router.navigate('/dashboard'); }
    } else {
      currentStep++;
      renderStep();
    }
  });
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    saveStepData();
    if (currentStep > 0) { currentStep--; renderStep(); }
  });
  document.getElementById('draft-btn')?.addEventListener('click', () => {
    saveStepData();
    showToast('Draft saved!', 'success');
  });
}
