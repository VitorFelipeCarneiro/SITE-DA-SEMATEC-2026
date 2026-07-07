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
    'video/sematec-hero-01.mp4',
    'video/sematec-hero-02.mp4',
    'video/sematec-hero-03.mp4',
    'video/sematec-hero-04.mp4',
    'video/sematec-hero-05.mp4'
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
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40 || document.body.classList.contains('subpage'));
  }, { passive: true });
}

// ── Voltar ao topo: atalho acessivel para telas menores ──
const backToTop = $('backToTop');
if (backToTop) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const setBackToTopState = () => {
    const isVisible = window.scrollY > 420;
    backToTop.classList.toggle('is-visible', isVisible);
    backToTop.setAttribute('aria-hidden', String(!isVisible));
    backToTop.tabIndex = isVisible ? 0 : -1;
  };

  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion.matches ? 'auto' : 'smooth'
    });
  });

  window.addEventListener('scroll', setBackToTopState, { passive: true });
  setBackToTopState();
}

// ── Mobile menu ──
const burger = $('navBurger');
const links  = $('navLinks');
const navClose = $('navClose');
if (burger && links) {
  const setMenuState = isOpen => {
    burger.classList.toggle('open', isOpen);
    links.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  };

  const closeMenu = () => {
    setMenuState(false);
  };

  burger.addEventListener('click', () => {
    setMenuState(!links.classList.contains('open'));
  });

  if (navClose) navClose.addEventListener('click', closeMenu);

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', event => {
    if (!links.classList.contains('open')) return;
    if (links.contains(event.target) || burger.contains(event.target)) return;
    closeMenu();
  });
}

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
