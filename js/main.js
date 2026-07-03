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

// ── Hero: slideshow de vídeos em crossfade ──
const heroStage = document.querySelector('.hero-video-stage');
if (heroStage) {
  const slides = Array.from(heroStage.querySelectorAll('video'));
  const playlist = [
    'video/hero-bg.mp4',
    'video/corn-field.mp4',
    'video/greenhouse-lab.mp4',
    'video/wind-turbines.mp4',
    'video/biotech-lab.mp4',
    'video/solar-farm.mp4',
    'video/textile-factory.mp4'
  ];

  const setSource = (videoEl, src) => {
    const source = videoEl.querySelector('source');
    if (source.getAttribute('src') === src) return;
    source.setAttribute('src', src);
    videoEl.load();
    videoEl.play().catch(() => {});
  };

  let activeSlot = 0;
  let nextIndex = 1 % playlist.length;
  setSource(slides[1], playlist[nextIndex]);

  const advanceSlide = () => {
    const idleSlot = activeSlot === 0 ? 1 : 0;
    slides[idleSlot].classList.add('is-active');
    slides[activeSlot].classList.remove('is-active');
    activeSlot = idleSlot;

    nextIndex = (nextIndex + 1) % playlist.length;
    const slotToPreload = activeSlot === 0 ? 1 : 0;
    setTimeout(() => setSource(slides[slotToPreload], playlist[nextIndex]), 1500);
  };

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(advanceSlide, 7000);
  }
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

// ── Carrossel de palestras em destaque ──
const talkCarousel = document.querySelector('.talk-carousel');
if (talkCarousel) {
  const talkSlides = Array.from(talkCarousel.querySelectorAll('.talk-slide'));
  const talkDots = Array.from(talkCarousel.querySelectorAll('[data-talk-slide]'));
  const talkArrows = Array.from(talkCarousel.querySelectorAll('[data-talk-dir]'));
  let activeTalk = Math.max(0, talkSlides.findIndex(slide => slide.classList.contains('is-active')));
  let talkTimer = null;

  const showTalk = index => {
    if (!talkSlides.length) return;
    activeTalk = (index + talkSlides.length) % talkSlides.length;
    talkSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeTalk);
    });
    talkDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeTalk);
    });
  };

  const startTalkTimer = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.clearInterval(talkTimer);
    talkTimer = window.setInterval(() => showTalk(activeTalk + 1), 5200);
  };

  talkDots.forEach(dot => {
    dot.addEventListener('click', () => {
      showTalk(Number(dot.dataset.talkSlide));
      startTalkTimer();
    });
  });

  talkArrows.forEach(arrow => {
    arrow.addEventListener('click', () => {
      showTalk(activeTalk + Number(arrow.dataset.talkDir));
      startTalkTimer();
    });
  });

  showTalk(activeTalk);
  startTalkTimer();
}

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

// ── Hero living hill scene ──
const hero = $('hero');
const heroGrass = $('heroGrass');
const heroFlowers = $('heroFlowers');
const heroButterflies = $('heroButterflies');

if (hero && heroGrass && heroFlowers && heroButterflies) {
  let seed = 2026;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const buildBlade = index => {
    const blade = document.createElement('span');
    blade.className = 'grass-blade';
    blade.style.setProperty('--x', (random() * 100).toFixed(2) + '%');
    blade.style.setProperty('--h', (24 + random() * 64).toFixed(1) + 'px');
    blade.style.setProperty('--w', (1.2 + random() * 2.4).toFixed(2) + 'px');
    blade.style.setProperty('--lean', (-10 + random() * 20).toFixed(2) + 'deg');
    blade.style.setProperty('--delay', (-random() * 5).toFixed(2) + 's');
    blade.style.setProperty('--dur', (2.8 + random() * 3.8).toFixed(2) + 's');
    blade.style.setProperty('--shade', index % 3);
    return blade;
  };

  const buildFlower = () => {
    const flower = document.createElement('span');
    flower.className = 'hero-flower';
    flower.style.setProperty('--x', (4 + random() * 92).toFixed(2) + '%');
    flower.style.setProperty('--y', (4 + random() * 42).toFixed(2) + '%');
    flower.style.setProperty('--s', (0.62 + random() * 0.72).toFixed(2));
    flower.style.setProperty('--delay', (-random() * 6).toFixed(2) + 's');
    flower.style.setProperty('--dur', (3 + random() * 4).toFixed(2) + 's');
    flower.style.setProperty('--hue', Math.floor(random() * 4));
    return flower;
  };

  const buildButterfly = index => {
    const butterfly = document.createElement('span');
    butterfly.className = 'butterfly butterfly-' + (index + 1);
    butterfly.innerHTML = '<i></i>';
    butterfly.style.setProperty('--x', (10 + random() * 78).toFixed(2) + '%');
    butterfly.style.setProperty('--y', (25 + random() * 48).toFixed(2) + '%');
    butterfly.style.setProperty('--s', (0.62 + random() * 0.9).toFixed(2));
    butterfly.style.setProperty('--delay', (-random() * 12).toFixed(2) + 's');
    butterfly.style.setProperty('--dur', (12 + random() * 10).toFixed(2) + 's');
    butterfly.style.setProperty('--hue', Math.floor(random() * 360));
    return butterfly;
  };

  const fillLayer = (layer, total, builder) => {
    layer.textContent = '';
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < total; index++) {
      fragment.appendChild(builder(index));
    }
    layer.appendChild(fragment);
  };

  fillLayer(heroGrass, 150, buildBlade);
  fillLayer(heroFlowers, 42, buildFlower);
  fillLayer(heroButterflies, 7, buildButterfly);
}

// ── Nuvem de tópicos viva: flutuação orgânica + palavra em destaque ──
const topicEls = Array.from($$('.topic'));
if (topicEls.length) {
  const spotlight = $('topicSpotlight');
  if (spotlight && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let lastEl = null;
    const highlightNext = () => {
      spotlight.classList.add('is-fading');
      setTimeout(() => {
        let next = topicEls[Math.floor(Math.random() * topicEls.length)];
        while (topicEls.length > 1 && next === lastEl) {
          next = topicEls[Math.floor(Math.random() * topicEls.length)];
        }
        spotlight.textContent = next.textContent;
        if (lastEl) lastEl.classList.remove('topic-active');
        next.classList.add('topic-active');
        lastEl = next;
        spotlight.classList.remove('is-fading');
      }, 420);
    };
    highlightNext();
    setInterval(highlightNext, 2600);
  }
}
