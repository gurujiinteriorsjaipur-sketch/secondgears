import { renderNavbar, initNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';
import { getState, formatPrice, formatKm, removeFromCompare, clearCompare } from '../lib/state';
import { DUMMY_CARS } from '../lib/dummy-data';

export async function renderComparePage() {
  const state = getState();
  const compareIds = state.compareList;
  const cars = compareIds.map(id => DUMMY_CARS.find(c => c.id === id)).filter(Boolean) as any[];

  const app = document.getElementById('app')!;
  app.innerHTML = renderNavbar() + `
  <main style="max-width:1280px;margin:0 auto;padding:32px 2rem;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;">
      <div>
        <h1 style="font-family:var(--font-heading);font-size:2rem;font-weight:800;">Compare Cars</h1>
        <p style="color:var(--on-surface-variant);">Select up to 3 cars to compare side by side</p>
      </div>
      ${cars.length > 0 ? `<button class="btn btn--ghost" id="clear-compare">Clear All</button>` : ''}
    </div>
    ${cars.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state__icon">⚖</div>
        <div class="empty-state__title">No cars to compare</div>
        <div class="empty-state__desc">Add cars to compare from the listings page using the "+ Compare" button</div>
        <a href="/cars" data-route class="btn btn--primary">Browse Cars</a>
      </div>
    ` : `
      <div style="overflow-x:auto;">
        <table class="compare-table">
          <thead>
            <tr>
              <th style="width:200px;">Feature</th>
              ${cars.map(c => `<th>
                <div style="position:relative;">
                  <img src="${c.car_images?.[0]?.image_url || '/images/cars/hyundai-creta.png'}" style="width:100%;height:150px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:12px;" onerror="this.src='/images/cars/hyundai-creta.png'">
                  <button class="btn btn--ghost btn--sm remove-compare" data-id="${c.id}" style="position:absolute;top:4px;right:4px;background:rgba(255,255,255,0.9);">✕</button>
                  <div style="font-weight:700;">${c.year} ${c.brand} ${c.model}</div>
                  <div style="color:var(--primary);font-weight:800;">${formatPrice(c.price)}</div>
                </div>
              </th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${[
              { label: 'Year', key: 'year' },
              { label: 'Brand', key: 'brand' },
              { label: 'Fuel Type', key: 'fuel_type' },
              { label: 'Transmission', key: 'transmission' },
              { label: 'KM Driven', key: 'km_driven', format: (v: number) => formatKm(v) },
              { label: 'Owner', key: 'owner_number', format: (v: number) => `${v}${v===1?'st':v===2?'nd':'rd'} Owner` },
              { label: 'Body Type', key: 'body_type' },
              { label: 'Color', key: 'color' },
              { label: 'Engine', key: 'specifications.engine' },
              { label: 'Power', key: 'specifications.power' },
              { label: 'Torque', key: 'specifications.torque' },
              { label: 'Mileage', key: 'specifications.mileage' },
              { label: 'Verified', key: 'is_verified', format: (v: boolean) => v ? '✅ Yes' : '❌ No' },
              { label: 'Warranty', key: 'has_warranty', format: (v: boolean) => v ? '✅ Yes' : '❌ No' },
              { label: 'Location', key: 'city' },
            ].map(row => `
              <tr>
                <td style="font-weight:600;color:var(--on-surface-variant);">${row.label}</td>
                ${cars.map(c => {
                  let val: any = c;
                  if (row.key.includes('.')) {
                    for (const k of row.key.split('.')) val = val?.[k];
                  } else {
                    val = c[row.key];
                  }
                  if (row.format) val = (row.format as any)(val);
                  return `<td>${val ?? '—'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}
  </main>
  ` + renderFooter();

  initNavbar();

  document.getElementById('clear-compare')?.addEventListener('click', () => {
    clearCompare();
    renderComparePage();
  });

  document.querySelectorAll('.remove-compare').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCompare(btn.getAttribute('data-id') || '');
      renderComparePage();
    });
  });
}
