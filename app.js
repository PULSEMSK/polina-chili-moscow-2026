(() => {
  'use strict';

  const menu = document.querySelector('#mobile-menu');
  const menuButton = document.querySelector('.menu-toggle');
  const gallery = document.querySelector('.lightbox');
  const photos = [...document.querySelectorAll('[data-photo] img')];
  let photoIndex = 0;
  const updateScrollLock = () => document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));

  menuButton.addEventListener('click', () => {
    menu.showModal();
    menuButton.setAttribute('aria-expanded', 'true');
    updateScrollLock();
  });
  menu.querySelector('[data-close-menu]').addEventListener('click', () => menu.close());
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.close()));
  menu.addEventListener('close', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    updateScrollLock();
  });
  matchMedia('(min-width: 801px)').addEventListener('change', event => {
    if (event.matches && menu.open) menu.close();
  });

  function showPhoto(index) {
    photoIndex = (index + photos.length) % photos.length;
    const original = photos[photoIndex];
    const enlarged = gallery.querySelector('img');
    enlarged.src = original.currentSrc || original.src;
    enlarged.alt = original.alt;
    gallery.querySelector('.gallery-count').textContent = `${photoIndex + 1} / ${photos.length}`;
  }
  document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
    showPhoto(Number(button.dataset.photo));
    gallery.showModal();
    updateScrollLock();
  }));
  gallery.querySelector('[data-close-gallery]').addEventListener('click', () => gallery.close());
  gallery.querySelector('.gallery-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
  gallery.querySelector('.gallery-next').addEventListener('click', () => showPhoto(photoIndex + 1));
  gallery.addEventListener('close', updateScrollLock);
  gallery.addEventListener('click', event => { if (event.target === gallery) gallery.close(); });
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let touchStart = null;
  gallery.addEventListener('touchstart', event => { touchStart = event.touches[0].clientX; }, { passive: true });
  gallery.addEventListener('touchend', event => {
    if (touchStart === null) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 65) showPhoto(photoIndex + (distance > 0 ? -1 : 1));
    touchStart = null;
  }, { passive: true });

  // Content stays visible if JavaScript or IntersectionObserver is unavailable
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      const siblings = [...element.parentElement.children].filter(child => child.hasAttribute('data-reveal'));
      element.style.setProperty('--delay', `${Math.min(siblings.indexOf(element), 2) * 110}ms`);
      element.classList.add('reveal-ready');
      observer.observe(element);
    });
  }

  const party = document.querySelector('.party-collage');
  const scene = party?.querySelector('.party-scene');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  if (party && scene) {
    if ('IntersectionObserver' in window) {
      const partyObserver = new IntersectionObserver(([entry]) => {
        party.classList.toggle('is-in-view', entry.isIntersecting);
      }, { threshold: 0.15 });
      partyObserver.observe(party);
    } else party.classList.add('is-in-view');
    let frame = 0;
    party.addEventListener('pointermove', event => {
      if (!finePointer.matches) return;
      cancelAnimationFrame(frame);
      const { clientX, clientY } = event;
      frame = requestAnimationFrame(() => {
        const box = party.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (clientX - box.left) / box.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (clientY - box.top) / box.height * 2 - 1));
        scene.style.setProperty('--party-rx', `${-y * (motionPreference.matches ? 2 : 4)}deg`);
        scene.style.setProperty('--party-ry', `${x * (motionPreference.matches ? 2.5 : 5)}deg`);
      });
    });
    const resetParty = () => {
      cancelAnimationFrame(frame);
      scene.style.removeProperty('--party-rx');
      scene.style.removeProperty('--party-ry');
    };
    party.addEventListener('pointerleave', resetParty);
    motionPreference.addEventListener('change', resetParty);
  }
  const paperVideo = document.querySelector('.paper-video');
  const updatePaperMotion = () => {
    if (!paperVideo) return;
    if (document.hidden) { paperVideo.pause(); return; }
    paperVideo.muted = true;
    paperVideo.defaultMuted = true;
    paperVideo.playsInline = true;
    paperVideo.playbackRate = motionPreference.matches ? 0.75 : 1;
    if (!paperVideo.getAttribute('src')) paperVideo.src = paperVideo.dataset.src;
    if (paperVideo.paused) paperVideo.play().catch(() => paperVideo.parentElement.classList.remove('is-playing'));
  };
  paperVideo?.addEventListener('playing', () => paperVideo.parentElement.classList.add('is-playing'));
  paperVideo?.addEventListener('error', () => paperVideo.parentElement.classList.remove('is-playing'));
  // Browsers that defer muted autoplay retry on the first interaction
  ['pointerdown', 'touchstart', 'keydown'].forEach(event => document.addEventListener(event, updatePaperMotion, {passive:true}));
  motionPreference.addEventListener('change', updatePaperMotion);
  const updatePageMotion = () => {
    document.documentElement.classList.toggle('page-paused', document.hidden);
    updatePaperMotion();
  };
  document.addEventListener('visibilitychange', updatePageMotion);
  updatePageMotion();

  const config = window.CHILI_TICKETS;
  if (!config) return;
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const incoming = new URLSearchParams(location.search);
  const storageKey = 'polina-chili-attribution';
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch (_) { /* storage is optional */ }
  keys.forEach(key => { if (incoming.get(key)) saved[key] = incoming.get(key); });
  try { sessionStorage.setItem(storageKey, JSON.stringify(saved)); } catch (_) { /* private browsing fallback */ }
  const destination = new URL(config.url);
  keys.forEach(key => { if (typeof saved[key] === 'string' && saved[key]) destination.searchParams.set(key, saved[key]); });
  if (incoming.get('yclid')) destination.searchParams.set('yclid', incoming.get('yclid'));

  document.querySelectorAll('[data-buy]').forEach(link => {
    link.href = destination.href;
  });

  // Qtickets owns the checkout modal, as on the CHEBANOV landing pages.
  const sdkURL = 'https://cdn.qtickets.tech/openapi.js';
  let ready = false;
  let loading = false;
  let error = '';
  let timer;
  const installAttribution = () => {
    const jq = window.jQueryQtickets;
    if (typeof jq !== 'function') return;
    jq(document).off('qtickets.openapi.prepareRequest.polinaChili');
    jq(document).on('qtickets.openapi.prepareRequest.polinaChili', (_event, request) => {
      if (!request || String(request.event_id) !== String(config.eventId)) return;
      Object.keys(request).filter(key => key.startsWith('utm_')).forEach(key => delete request[key]);
      destination.searchParams.forEach((value, key) => { if (key.startsWith('utm_')) request[key] = value; });
      request.base_color = config.color;
      request.lang = request.lang || 'ru';
      request.site_url = location.href;
      if (document.referrer) request.site_referer = document.referrer;
      if (incoming.get('yclid')) {
        if (!request.ads || typeof request.ads !== 'object') request.ads = {};
        request.ads.yclid = incoming.get('yclid');
      }
    });
  };
  const init = () => {
    if (typeof window.qTickets?.init !== 'function') return false;
    try {
      window.qTickets.init();
      installAttribution();
      if (typeof window.jQueryQtickets === 'function') window.jQueryQtickets(() => setTimeout(installAttribution, 0));
      ready = true; loading = false; error = '';
      return true;
    } catch (err) { error = String(err); return false; }
  };
  const load = () => {
    if (loading || init()) return;
    loading = true;
    const deadline = Date.now() + 15000;
    const check = () => {
      clearTimeout(timer);
      if (init()) return;
      if (Date.now() >= deadline) { loading = false; error = error || 'SDK timeout'; return; }
      timer = setTimeout(check, 100);
    };
    const script = document.createElement('script');
    script.src = sdkURL; script.async = true;
    script.addEventListener('load', check, { once: true });
    script.addEventListener('error', () => { clearTimeout(timer); loading = false; error = 'SDK network error'; }, { once: true });
    document.head.append(script);
    check();
  };
  const officialLink = link => {
    link.href = destination.href;
    link.removeAttribute('target');
    link.setAttribute('aria-haspopup', 'dialog');
  };
  document.querySelectorAll('[data-buy]').forEach(officialLink);
  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[data-buy]') : null;
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    // Release our menu's top layer before Qtickets displays its own modal.
    if (menu.open) menu.close();
    officialLink(link);
    if (!ready) {
      // A trusted click still opens the checkout if its SDK is blocked or late.
      link.target = '_blank';
      event.stopImmediatePropagation();
      setTimeout(() => officialLink(link), 0);
      return;
    }
    installAttribution();
    // Do not intercept default/bubbling: the official SDK owns the purchase flow.
  }, true);
  window.polinaChiliTickets = { getStatus: () => ({ ready, loading, error, eventId: config.eventId }) };
  load();
})();
