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

// ── Hero cube: self-assembling fractal cube ──
const cubeRig = $('cubeRig');
if (cubeRig) {
  const GRID = 3;
  const STEP = 48;
  const FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  const CENTER = (GRID - 1) / 2;

  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      for (let z = 0; z < GRID; z++) {
        if (x === CENTER && y === CENTER && z === CENTER) continue;

        const dx = x - CENTER, dy = y - CENTER, dz = z - CENTER;
        const mag = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const explode = 30 + Math.random() * 26;

        const gx = dx * STEP, gy = dy * STEP, gz = dz * STEP;
        const ex = gx + (dx / mag) * explode;
        const ey = gy + (dy / mag) * explode;
        const ez = gz + (dz / mag) * explode;

        const cubelet = document.createElement('div');
        cubelet.className = 'cubelet';
        cubelet.style.setProperty('--gx', gx + 'px');
        cubelet.style.setProperty('--gy', gy + 'px');
        cubelet.style.setProperty('--gz', gz + 'px');
        cubelet.style.setProperty('--ex', ex + 'px');
        cubelet.style.setProperty('--ey', ey + 'px');
        cubelet.style.setProperty('--ez', ez + 'px');
        cubelet.style.animationDelay = (Math.random() * 6).toFixed(2) + 's';
        cubelet.style.animationDuration = (5 + Math.random() * 4).toFixed(2) + 's';

        FACES.forEach(face => {
          const faceEl = document.createElement('div');
          faceEl.className = 'cubelet-face ' + face;
          cubelet.appendChild(faceEl);
        });

        cubeRig.appendChild(cubelet);
      }
    }
  }
}
