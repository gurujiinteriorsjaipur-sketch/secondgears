import './styles/main.css';
import { router } from './lib/router';
import { initAuth, subscribe, getState } from './lib/state';
import { renderHomePage } from './pages/home';
import { renderListingsPage } from './pages/listings';
import { renderDetailPage } from './pages/detail';
import { renderAuthPage } from './pages/auth';
import { renderDashboardPage } from './pages/dashboard';
import { renderSellPage } from './pages/sell';
import { renderComparePage } from './pages/compare';

// Compare bar UI
function updateCompareBar() {
  const state = getState();
  let bar = document.getElementById('compare-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'compare-bar';
    bar.id = 'compare-bar';
    document.body.appendChild(bar);
  }
  
  if (state.compareList.length > 0) {
    bar.classList.add('active');
    bar.innerHTML = `
      <div class="compare-bar__items">
        <span style="font-weight:600;">${state.compareList.length}/3 cars selected</span>
      </div>
      <a href="/compare" data-route class="btn btn--primary btn--sm">Compare Now →</a>
    `;
  } else {
    bar.classList.remove('active');
  }
}

// Initialize app
async function init() {
  // Setup routes
  router.addRoute('/', () => renderHomePage());
  router.addRoute('/cars', () => renderListingsPage());
  router.addRoute('/car/:id', (params) => renderDetailPage(params));
  router.addRoute('/auth', () => renderAuthPage());
  router.addRoute('/dashboard', () => renderDashboardPage());
  router.addRoute('/sell', () => renderSellPage());
  router.addRoute('/compare', () => renderComparePage());

  router.setNotFound(() => {
    const app = document.getElementById('app')!;
    app.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;">
        <div>
          <div style="font-size:6rem;font-weight:800;color:var(--surface-container);font-family:var(--font-heading);">404</div>
          <h1 style="font-family:var(--font-heading);margin-bottom:8px;">Page Not Found</h1>
          <p style="color:var(--on-surface-variant);margin-bottom:24px;">The page you're looking for doesn't exist</p>
          <a href="/" data-route class="btn btn--primary">Go Home</a>
        </div>
      </div>`;
  });

  // Subscribe to state for compare bar
  subscribe(updateCompareBar);

  // Init auth then start routing
  await initAuth();
  router.init();
}

init();
