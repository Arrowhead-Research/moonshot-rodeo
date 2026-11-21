document.documentElement.classList.add('js');

// Mobile navigation
const menu = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
function setMenu(open) {
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.querySelector('.menu-text').textContent = open ? 'Close' : 'Menu';
}
menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menu.focus(); }
});

// Countdown to presentation day
const countdown = document.querySelector('[data-countdown]');
if (countdown) {
  const target = new Date(countdown.dataset.countdown).getTime();
  const units = { days: 864e5, hours: 36e5, minutes: 6e4 };
  const tick = () => {
    let remaining = Math.max(0, target - Date.now());
    if (remaining === 0) { countdown.hidden = true; return; }
    for (const [unit, size] of Object.entries(units)) {
      const value = Math.floor(remaining / size);
      remaining -= value * size;
      countdown.querySelector(`[data-unit="${unit}"]`).textContent = unit === 'days' ? value : String(value).padStart(2, '0');
    }
  };
  tick();
  setInterval(tick, 30000);
}

// Sticky mobile CTA appears once the first call to action scrolls away
const sticky = document.querySelector('[data-sticky-cta]');
const firstCta = document.querySelector('.hero-actions');
const closing = document.querySelector('.closing');
if (sticky && firstCta && 'IntersectionObserver' in window) {
  sticky.hidden = false;
  let pastHero = false, atClosing = false;
  const update = () => sticky.classList.toggle('is-visible', pastHero && !atClosing);
  new IntersectionObserver(([entry]) => { pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0; update(); }).observe(firstCta);
  if (closing) new IntersectionObserver(([entry]) => { atClosing = entry.isIntersecting; update(); }).observe(closing);
}

// Reveal content on scroll
const revealables = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  revealables.forEach((element, index) => {
    element.style.transitionDelay = `${(index % 4) * 70}ms`;
    observer.observe(element);
  });
} else {
  revealables.forEach(element => element.classList.add('is-in'));
}

// Highlight the active track in the build sprint sub-navigation
const trackLinks = [...document.querySelectorAll('.track-nav a')];
if (trackLinks.length && 'IntersectionObserver' in window) {
  const byId = new Map(trackLinks.map(link => [link.hash.slice(1), link]));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) trackLinks.forEach(link => link.classList.toggle('is-active', link === byId.get(entry.target.id)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  byId.forEach((_, id) => { const section = document.getElementById(id); if (section) observer.observe(section); });
}

// Lightweight engagement events for any analytics tag added later (e.g. gtag or dataLayer)
document.addEventListener('click', event => {
  const cta = event.target.closest('[data-cta]');
  if (!cta) return;
  const detail = { event: 'cta_click', cta: cta.dataset.cta, href: cta.href };
  (window.dataLayer = window.dataLayer || []).push(detail);
});
