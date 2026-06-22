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

// ── Data-processing light grids ──
const gridTargets = [
  ...$$('.focus-card'),
  ...$$('.act-card'),
  ...$$('#submissoes .sub-gradient'),
  ...$$('.price-top'),
  ...$$('.call-hero'),
  ...$$('.registration-hero')
];

gridTargets.forEach((target, targetIndex) => {
  const grid = document.createElement('div');
  grid.className = 'data-grid';

  const compactGrid = target.matches('.price-top, #submissoes .sub-gradient');
  const heroGrid = target.matches('.call-hero, .registration-hero');
  const activityGrid = target.matches('.act-card');
  const columns = heroGrid ? 38 : compactGrid ? 26 : 28;
  const rows = heroGrid ? 12 : compactGrid ? 11 : 13;
  const squares = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const square = document.createElement('span');
      const left = 6 + (x / (columns - 1)) * 88;
      const top = 8 + (y / (rows - 1)) * 78;

      square.style.left = `${left}%`;
      square.style.top = `${top}%`;
      const blinkBase = activityGrid ? 2900 : 2400;
      const blinkRange = activityGrid ? 3100 : 2600;
      square.style.setProperty('--blink-duration', `${blinkBase + Math.random() * blinkRange}ms`);
      square.style.setProperty('--blink-delay', `${Math.random() * -(blinkBase + blinkRange)}ms`);
      grid.appendChild(square);
      squares.push({ el: square, x: left, y: top, seed: Math.random() * Math.PI * 2 });
    }
  }

  target.appendChild(grid);

  let frame = 0;
  let shapeFrame = 0;
  let pointer = null;
  const shapeWidth = heroGrid ? 240 : compactGrid ? 172 : 206;
  const shapeHeight = heroGrid ? 132 : compactGrid ? 100 : 118;

  const clearLights = () => {
    squares.forEach(({ el }) => {
      el.classList.remove('is-lit');
    });
  };

  const renderLights = time => {
    if (frame) return;

    frame = window.requestAnimationFrame(() => {
      const rect = grid.getBoundingClientRect();

      if (!pointer) {
        frame = 0;
        return;
      }

      if (
        pointer.x < rect.left ||
        pointer.x > rect.right ||
        pointer.y < rect.top ||
        pointer.y > rect.bottom
      ) {
        clearLights();
        frame = 0;
        return;
      }

      const pointerX = pointer.x - rect.left;
      const pointerY = pointer.y - rect.top;
      const t = time * 0.001;
      const exponent = 2.2 + ((Math.sin(t * 1.15 + targetIndex) + 1) / 2) * 4.8;

      squares.forEach(({ el, x, y, seed }) => {
        const squareX = (x / 100) * rect.width;
        const squareY = (y / 100) * rect.height;
        const dx = (squareX - pointerX) / shapeWidth;
        const dy = (squareY - pointerY) / shapeHeight;
        const angle = Math.atan2(dy, dx);
        const wave =
          0.86 +
          Math.sin(angle * 3 + t * 2.2 + seed) * 0.12 +
          Math.cos(angle * 5 - t * 1.7 + seed * 0.7) * 0.1 +
          Math.sin((dx - dy) * 4 + t * 1.35 + seed) * 0.06;
        const superellipse = Math.pow(Math.abs(dx), exponent) + Math.pow(Math.abs(dy), exponent);
        const insideOrganicShape = superellipse <= wave;

        if (insideOrganicShape) {
          el.classList.add('is-lit');
        } else {
          el.classList.remove('is-lit');
        }
      });

      frame = 0;
    });
  };

  const animateShape = time => {
    if (!pointer) return;
    renderLights(time);
    shapeFrame = window.requestAnimationFrame(animateShape);
  };

  const pointerHost = target.matches('#submissoes .sub-gradient') ? target.closest('.sub-card') || target : target;
  pointerHost.addEventListener('pointermove', event => {
    pointer = { x: event.clientX, y: event.clientY };
    if (!shapeFrame) shapeFrame = window.requestAnimationFrame(animateShape);
  });
  pointerHost.addEventListener('pointerleave', () => {
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    if (shapeFrame) {
      window.cancelAnimationFrame(shapeFrame);
      shapeFrame = 0;
    }
    pointer = null;
    clearLights();
  });
});

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
