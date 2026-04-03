import { formatPrice, formatKm, calculateEMI } from '../lib/state';

export function renderCarCard(car: any): string {
  const primaryImage = car.car_images?.find((img: any) => img.is_primary)?.image_url 
    || car.car_images?.[0]?.image_url 
    || `/images/cars/${car.brand?.toLowerCase()}-${car.model?.toLowerCase().replace(/\s+/g, '-')}.png`;
  
  const emi = calculateEMI(car.price);
  
  return `
  <div class="car-card fade-in" data-car-id="${car.id}">
    <div class="car-card__image-wrapper">
      <img src="${primaryImage}" alt="${car.title}" class="car-card__image" loading="lazy" 
        onerror="this.src='/images/cars/hyundai-creta.png'">
      <div class="car-card__badges">
        ${car.is_verified ? '<span class="car-card__badge car-card__badge--verified">✓ Verified</span>' : ''}
        ${car.featured ? '<span class="car-card__badge car-card__badge--featured">Featured</span>' : ''}
      </div>
      <button class="car-card__fav" data-fav-id="${car.id}" aria-label="Add to favorites">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
    </div>
    <a href="/car/${car.id}" data-route class="car-card__body">
      <div class="car-card__title">${car.year} ${car.brand} ${car.model}</div>
      <div class="car-card__price">${formatPrice(car.price)}</div>
      <div class="car-card__emi">EMI from ₹${emi.toLocaleString('en-IN')}/mo</div>
      <div class="car-card__specs">
        <span class="car-card__spec">${car.km_driven ? formatKm(car.km_driven) : 'N/A'}</span>
        <span class="car-card__spec">${car.fuel_type}</span>
        <span class="car-card__spec">${car.transmission}</span>
        <span class="car-card__spec">${car.owner_number}${car.owner_number === 1 ? 'st' : car.owner_number === 2 ? 'nd' : 'rd'} Owner</span>
      </div>
      <div class="car-card__meta">
        <span class="car-card__location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${car.city}
        </span>
        <button class="btn btn--ghost btn--sm compare-add-btn" data-compare-id="${car.id}">+ Compare</button>
      </div>
    </a>
  </div>`;
}

export function renderCarCardSkeleton(): string {
  return `
  <div class="car-card">
    <div class="car-card__image-wrapper skeleton" style="height:200px"></div>
    <div class="car-card__body">
      <div class="skeleton" style="height:20px;width:80%;margin-bottom:8px"></div>
      <div class="skeleton" style="height:24px;width:40%;margin-bottom:8px"></div>
      <div class="skeleton" style="height:14px;width:50%;margin-bottom:16px"></div>
      <div style="display:flex;gap:8px">
        <div class="skeleton" style="height:24px;width:60px;border-radius:999px"></div>
        <div class="skeleton" style="height:24px;width:60px;border-radius:999px"></div>
        <div class="skeleton" style="height:24px;width:60px;border-radius:999px"></div>
      </div>
    </div>
  </div>`;
}
