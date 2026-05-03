'use strict';

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// Keep the final event-info sections in the intended order.
const inscricoesSection = $('inscricoes');
const localSection = $('local');
if (inscricoesSection && localSection) {
  const localIsBeforeInscricoes = Boolean(
    localSection.compareDocumentPosition(inscricoesSection) & Node.DOCUMENT_POSITION_FOLLOWING
  );
  if (localIsBeforeInscricoes) inscricoesSection.after(localSection);
}

// ── Navbar scroll ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40 || document.body.classList.contains('subpage'));
}, { passive: true });

// ── Mobile menu ──
const burger = $('navBurger');
const links  = $('navLinks');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  links.classList.toggle('open');
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  burger.classList.remove('open');
  links.classList.remove('open');
}));

// ── Scroll reveal ──
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => revealObs.observe(el));

// ── Schedule tabs ──
$$('.stab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.stab').forEach(b => b.classList.remove('stab-active'));
    btn.classList.add('stab-active');
    $$('.sched-day').forEach(d => d.classList.remove('active'));
    const day = document.getElementById(btn.dataset.tab);
    day.classList.add('active');
    // re-trigger reveals in the new day
    day.querySelectorAll('.reveal').forEach(el => {
      el.classList.remove('visible');
      setTimeout(() => el.classList.add('visible'), 40);
    });
  });
});

// ── Smooth scroll offset ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});
