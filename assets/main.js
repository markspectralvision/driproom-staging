const BOOKING_URL = ''; // TODO: Set the verified Acuity Drip Room booking URL here.

(() => {
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.nav-links');
  const burger = document.querySelector('.menu-toggle');
  const dropdown = document.querySelector('.has-dropdown');
  const dropToggle = dropdown?.querySelector('.dropdown-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    const source = heroVideo.querySelector('source');
    const videoSrc = source.getAttribute('src');
    const showPoster = () => heroVideo.classList.remove('is-playing');
    const syncHeroMotion = () => {
      heroVideo.autoplay = !reducedMotion.matches;
      heroVideo.muted = true;
      if (reducedMotion.matches) {
        heroVideo.pause();
        source.removeAttribute('src');
        heroVideo.load();
        showPoster();
      } else {
        if (!source.hasAttribute('src')) {
          source.setAttribute('src', videoSrc);
          heroVideo.load();
        }
        heroVideo.play().catch(showPoster);
      }
    };
    heroVideo.addEventListener('playing', () => {
      if (reducedMotion.matches) heroVideo.pause();
      else heroVideo.classList.add('is-playing');
    });
    heroVideo.addEventListener('pause', showPoster);
    heroVideo.addEventListener('error', showPoster);
    source.addEventListener('error', showPoster);
    reducedMotion.addEventListener('change', syncHeroMotion);
    syncHeroMotion();
  }
  const desktop = window.matchMedia('(min-width: 1520px)');
  let closeTimer;
  const setDropdown = (open) => {
    clearTimeout(closeTimer);
    dropdown?.classList.toggle('open', open);
    dropToggle?.setAttribute('aria-expanded', String(open));
  };
  const setMenu = (open) => {
    menu?.classList.toggle('open', open);
    burger?.setAttribute('aria-expanded', String(open));
    burger?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open) setDropdown(false);
  };
  burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  dropToggle?.addEventListener('click', () => setDropdown(dropToggle.getAttribute('aria-expanded') !== 'true'));
  dropdown?.addEventListener('mouseenter', () => { if (desktop.matches) setDropdown(true); });
  dropdown?.addEventListener('mouseleave', () => { if (desktop.matches) closeTimer = setTimeout(() => setDropdown(false), 300); });
  dropdown?.addEventListener('focusin', (event) => {
    if (desktop.matches && event.target !== dropToggle) setDropdown(true);
  });
  dropdown?.addEventListener('focusout', (event) => {
    if (!dropdown.contains(event.relatedTarget)) closeTimer = setTimeout(() => setDropdown(false), 300);
  });
  document.addEventListener('click', (event) => {
    if (!header?.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (dropdown?.classList.contains('open')) {
      setDropdown(false);
      dropToggle?.focus();
    } else if (menu?.classList.contains('open')) {
      setMenu(false);
      burger?.focus();
    }
  });
  desktop.addEventListener('change', () => setMenu(false));
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  document.querySelectorAll('[data-book]').forEach(a => {
    if (BOOKING_URL) a.href = BOOKING_URL;
    a.addEventListener('click', () => {
      setMenu(false);
      if (!BOOKING_URL) {
        const state = document.querySelector('#book .booking-state');
        if (state) state.focus({ preventScroll: true });
      }
    });
  });

  // Header and reading progress only. The Liquid Spectrum hero runs in CSS.
  const progress = document.querySelector('.progress-line');
  const updatePageChrome = () => {
    header?.classList.toggle('scrolled', window.scrollY > 35);
    const length = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${length > 0 ? window.scrollY / length : 0})`;
  };
  window.addEventListener('scroll', updatePageChrome, { passive: true });
  window.addEventListener('resize', updatePageChrome, { passive: true });
  window.addEventListener('pageshow', updatePageChrome);
  updatePageChrome();

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.06 });
    document.documentElement.classList.add('motion-ready');
    reveals.forEach(el => revealObserver.observe(el));
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) {
        document.documentElement.classList.remove('motion-ready');
        reveals.forEach(el => el.classList.add('visible'));
        revealObserver.disconnect();
      }
    });
  } else reveals.forEach(el => el.classList.add('visible'));

  document.querySelectorAll('[data-menu]').forEach(container => {
    const filters = container.querySelectorAll('[data-filter]');
    const cards = container.querySelectorAll('[data-category]');
    filters.forEach(button => button.addEventListener('click', () => {
      filters.forEach(el => el.setAttribute('aria-pressed', String(el === button)));
      let count = 0;
      cards.forEach(card => {
        const show = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
        card.hidden = !show;
        if (show) { count++; card.classList.add('visible'); }
      });
      const status = container.querySelector('.filter-count');
      if (status) status.textContent = `Showing ${count} ${count === 1 ? 'drip' : 'drips'}${button.dataset.filter === 'all' ? '.' : ` for ${button.textContent.toLowerCase()}.`}`;
    }));
  });

  document.querySelectorAll('.faq-list').forEach(list => {
    list.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => {
      if (detail.open) list.querySelectorAll('details').forEach(other => { if (other !== detail) other.open = false; });
    }));
  });
  const jumpLinks = document.querySelectorAll('.jump-nav a');
  if ('IntersectionObserver' in window && jumpLinks.length) {
    const jumpObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) jumpLinks.forEach(a => {
          if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    jumpLinks.forEach(a => { const section = document.getElementById(a.hash.slice(1)); if (section) jumpObserver.observe(section); });
  }

})();
