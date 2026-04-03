import { renderNavbar, initNavbar } from '../components/navbar';
import { signIn, signUp, signInWithGoogle } from '../lib/supabase';
import { showToast } from '../components/ui';
import { router } from '../lib/router';

export async function renderAuthPage() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
  <div class="auth-layout">
    <div class="auth-hero">
      <div style="position:relative;z-index:1;text-align:center;">
        <div style="font-family:var(--font-heading);font-size:2.5rem;font-weight:800;margin-bottom:16px;">Second<span style="color:rgba(255,255,255,0.7);">Gear</span></div>
        <p style="font-size:1.125rem;opacity:0.9;max-width:360px;">Join India's most trusted pre-owned car marketplace</p>
        <div style="margin-top:48px;display:flex;gap:32px;justify-content:center;">
          <div><div style="font-size:2rem;font-weight:800;">1200+</div><div style="font-size:0.8125rem;opacity:0.7;">Verified Cars</div></div>
          <div><div style="font-size:2rem;font-weight:800;">500+</div><div style="font-size:0.8125rem;opacity:0.7;">Happy Buyers</div></div>
        </div>
      </div>
    </div>
    <div class="auth-form-wrapper">
      <a href="/" data-route style="display:inline-block;margin-bottom:24px;color:var(--on-surface-variant);font-size:0.875rem;">← Back to Home</a>
      <h2 style="font-family:var(--font-heading);font-size:1.75rem;font-weight:800;margin-bottom:8px;">Welcome</h2>
      <p style="color:var(--on-surface-variant);margin-bottom:32px;">Sign in to your account or create a new one</p>
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">Login</button>
        <button class="auth-tab" data-tab="signup">Sign Up</button>
      </div>
      <div id="auth-form-container">
        <div id="login-form">
          <button class="btn--google" id="google-login-btn">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <div class="auth-divider">or</div>
          <form id="login-email-form">
            <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" name="email" required placeholder="you@example.com"></div>
            <div class="form-group"><label class="form-label">Password</label><input type="password" class="form-input" name="password" required placeholder="Enter your password"></div>
            <div style="text-align:right;margin-bottom:16px;"><a href="#" style="font-size:0.8125rem;color:var(--primary);">Forgot password?</a></div>
            <button type="submit" class="btn btn--primary btn--lg" style="width:100%">Login</button>
          </form>
        </div>
        <div id="signup-form" style="display:none;">
          <button class="btn--google" id="google-signup-btn">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <div class="auth-divider">or</div>
          <form id="signup-email-form">
            <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-input" name="fullName" required placeholder="John Doe"></div>
            <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" name="email" required placeholder="you@example.com"></div>
            <div class="form-group"><label class="form-label">Phone (optional)</label><input type="tel" class="form-input" name="phone" placeholder="+91 98765 43210"></div>
            <div class="form-group"><label class="form-label">Password</label><input type="password" class="form-input" name="password" required placeholder="Min 6 characters" minlength="6"></div>
            <button type="submit" class="btn btn--primary btn--lg" style="width:100%;margin-top:8px;">Create Account</button>
          </form>
        </div>
      </div>
    </div>
  </div>`;

  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      (document.getElementById('login-form') as HTMLElement).style.display = target === 'login' ? 'block' : 'none';
      (document.getElementById('signup-form') as HTMLElement).style.display = target === 'signup' ? 'block' : 'none';
    });
  });

  // Google auth
  document.getElementById('google-login-btn')?.addEventListener('click', async () => { await signInWithGoogle(); });
  document.getElementById('google-signup-btn')?.addEventListener('click', async () => { await signInWithGoogle(); });

  // Email login
  document.getElementById('login-email-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const { error } = await signIn(fd.get('email') as string, fd.get('password') as string);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Welcome back!', 'success');
    router.navigate('/dashboard');
  });

  // Email signup
  document.getElementById('signup-email-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const { error } = await signUp(fd.get('email') as string, fd.get('password') as string, fd.get('fullName') as string, fd.get('phone') as string);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Account created! Check your email to verify.', 'success');
    router.navigate('/');
  });
}
