export function renderFooter(): string {
  return `
  <footer class="footer">
    <div class="footer__grid">
      <div>
        <div class="footer__brand">Second<span>Gear</span></div>
        <p class="footer__desc">India's most trusted pre-owned car marketplace. Every car is inspected, certified, and backed by warranty. Buy and sell with confidence.</p>
      </div>
      <div>
        <div class="footer__title">Quick Links</div>
        <a href="/cars" data-route class="footer__link">Buy Cars</a>
        <a href="/sell" data-route class="footer__link">Sell Your Car</a>
        <a href="/compare" data-route class="footer__link">Compare Cars</a>
        <a href="/auth" data-route class="footer__link">Login / Sign Up</a>
      </div>
      <div>
        <div class="footer__title">Popular Brands</div>
        <a href="/cars?brand=Maruti" data-route class="footer__link">Maruti Suzuki</a>
        <a href="/cars?brand=Hyundai" data-route class="footer__link">Hyundai</a>
        <a href="/cars?brand=Honda" data-route class="footer__link">Honda</a>
        <a href="/cars?brand=Toyota" data-route class="footer__link">Toyota</a>
        <a href="/cars?brand=BMW" data-route class="footer__link">BMW</a>
      </div>
      <div>
        <div class="footer__title">Support</div>
        <a href="#" class="footer__link">Help Center</a>
        <a href="#" class="footer__link">Contact Us</a>
        <a href="#" class="footer__link">Privacy Policy</a>
        <a href="#" class="footer__link">Terms of Service</a>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© 2026 Second Gear. All rights reserved.</span>
      <span>Made with ♥ in India</span>
    </div>
  </footer>`;
}
