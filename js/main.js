/* ============================================
   HUMMING COB — Scripts principaux
   ============================================ */

// Navbar scroll effect : ombre au scroll + masquage auto (scroll bas = cache, scroll haut = revient)
const navbar = document.querySelector('.navbar');
if (navbar) {
  let lastScrollY = window.scrollY;
  let ticking = false;
  const HIDE_THRESHOLD = 120; // pas de masquage tant qu'on n'a pas assez scrollé

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      navbar.classList.toggle('scrolled', currentScrollY > 40);

      const mobileMenuOpen = document.querySelector('.nav-links')?.classList.contains('open');
      if (!mobileMenuOpen) {
        const scrollingDown = currentScrollY > lastScrollY;
        if (scrollingDown && currentScrollY > HIDE_THRESHOLD) {
          navbar.classList.add('nav-hidden');
        } else {
          navbar.classList.remove('nav-hidden');
        }
      }

      lastScrollY = currentScrollY;
      ticking = false;
    });
  });
}

// "Aller plus loin" : au survol/focus d'une carte, l'image dédiée remplace
// le dégradé par défaut dans le panneau de gauche (.explore-visual-img)
const exploreVisualImg = document.getElementById('exploreVisualImg');
if (exploreVisualImg) {
  // Sélection PERSISTANTE : la carte survolée/focus devient la sélection et son
  // image reste affichée (pas de retour au repos au mouseleave). La carte active
  // porte .is-selected (éclairage rosé). Au chargement, "Notre élevage" est
  // sélectionnée par défaut → une vraie photo accueille le visiteur.
  const exploreCards = document.querySelectorAll('.explore-card[data-visual-bg]');
  const selectCard = (card) => {
    const bgUrl = card.getAttribute('data-visual-bg');
    exploreVisualImg.style.backgroundImage = `url('${bgUrl}')`;
    exploreVisualImg.classList.add('active');
    exploreCards.forEach(c => c.classList.toggle('is-selected', c === card));
  };
  exploreCards.forEach(card => {
    // --card-img : image en tête de carte sur mobile (voir style.css). On résout
    // en URL absolue (via document.baseURI) car un url() relatif dans une variable
    // CSS serait résolu depuis la feuille (css/) et non depuis la page → 404.
    const cardImgUrl = new URL(card.getAttribute('data-visual-bg'), document.baseURI).href;
    card.style.setProperty('--card-img', `url("${cardImgUrl}")`);
    card.addEventListener('mouseenter', () => selectCard(card));
    card.addEventListener('focus', () => selectCard(card));
  });
  const defaultCard =
    document.querySelector('.explore-card[data-visual-bg="img/explore-elevage.jpg"]')
    || exploreCards[0];
  if (defaultCard) selectCard(defaultCard);
}

// Menu mobile
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    const isOpen = navLinks.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(4.5px, 4.5px)' : '';
    spans[1].style.opacity  = isOpen ? '0' : '1';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(4.5px, -4.5px)' : '';
    // Fermer les sous-menus au close
    if (!isOpen) navLinks.querySelectorAll('.has-dropdown.open').forEach(el => el.classList.remove('open'));
  });
  // Fermer au clic sur un lien
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', e => {
      const parentDropdown = a.parentElement.classList.contains('has-dropdown') ? a.parentElement : null;
      // Lien "Nos chevaux" / "Outils" : pas de destination propre (href="#") —
      // on empêche TOUJOURS le saut vers "#" (qui remonte sinon la page en
      // haut), pas seulement quand le menu mobile est ouvert. Sur desktop le
      // survol suffit à afficher le sous-menu, ce clic ne doit rien faire
      // d'autre que (éventuellement) toggle l'état pour le mobile.
      const isPureToggle = a.getAttribute('href') === '#';
      if (isPureToggle) e.preventDefault();

      if (parentDropdown && navLinks.classList.contains('open')) {
        const caret = a.querySelector('.nav-caret');
        if (isPureToggle || (caret && caret.contains(e.target))) {
          const isOpen = parentDropdown.classList.toggle('open');
          a.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        } else {
          // Clic sur le texte d'un lien avec vraie destination → naviguer + fermer le menu
          navLinks.classList.remove('open');
          navLinks.querySelectorAll('.has-dropdown.open').forEach(el => el.classList.remove('open'));
        }
      } else {
        navLinks.classList.remove('open');
      }
    });
  });
}

// Mise en évidence de la page active dans la nav
(function () {
  const links = document.querySelectorAll('.nav-links a');
  if (!links.length) return;
  const path = location.pathname.toLowerCase();

  // Correspondance exacte (pages avec un vrai lien dans la nav, y compris
  // dans les sous-menus déroulants "Nos chevaux" / "Outils").
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href === '#' || href.indexOf('#') !== -1) return;
    const resolved = new URL(href, location.href).pathname.toLowerCase();
    if (resolved === path) a.classList.add('nav-active');
  });

  // Fiches individuelles (reproducteurs/*, poulains/*) : pas de lien direct
  // dans la nav → on active le lien de catégorie correspondant.
  function activateCategory(matchHref) {
    links.forEach(a => {
      const href = (a.getAttribute('href') || '').replace(/^\.\.\//, '').toLowerCase();
      if (href === matchHref) a.classList.add('nav-active');
    });
  }
  if (path.indexOf('/reproducteurs/') !== -1) activateCategory('reproducteurs.html');
  if (path.indexOf('/poulains/') !== -1) activateCategory('poulains.html');

  // Propage l'état actif d'un sous-lien vers son menu déroulant parent
  // ("Nos chevaux" / "Outils"), quel que soit le nombre de dropdowns.
  document.querySelectorAll('.nav-links .has-dropdown').forEach(dropdown => {
    if (dropdown.querySelector('.nav-dropdown a.nav-active')) {
      const parentLink = dropdown.querySelector(':scope > a');
      if (parentLink) parentLink.classList.add('nav-active');
    }
  });

})();

// Révélation au scroll (Intersection Observer)
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
}

// ── Lightbox carrousel ──────────────────────────────────────────────────────
(function () {
  let lbImages = [], lbCaptions = [], lbIdx = 0;

  // Overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:3000;align-items:center;justify-content:center;padding:1.5rem;';

  // Image
  const lbImg = document.createElement('img');
  lbImg.style.cssText = 'max-width:82vw;max-height:84vh;object-fit:contain;border-radius:6px;box-shadow:0 12px 60px rgba(0,0,0,.9);cursor:default;transition:opacity .18s;';

  // Caption
  const lbCap = document.createElement('div');
  lbCap.style.cssText = 'position:absolute;bottom:2.4rem;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.65);font-size:.78rem;letter-spacing:.06em;text-align:center;max-width:80vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;';

  // Compteur
  const counter = document.createElement('div');
  counter.style.cssText = 'position:absolute;bottom:1rem;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.35);font-size:.68rem;letter-spacing:.14em;pointer-events:none;';

  // Boutons
  function makeBtn(label, extra) {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = 'position:absolute;background:rgba(255,255,255,.12);border:none;color:#fff;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;' + extra;
    b.addEventListener('mouseenter', () => b.style.background = 'rgba(255,255,255,.28)');
    b.addEventListener('mouseleave', () => b.style.background = 'rgba(255,255,255,.12)');
    return b;
  }
  const closeBtn = makeBtn('✕', 'top:1rem;right:1.5rem;font-size:1.3rem;width:38px;height:38px;');
  const prevBtn  = makeBtn('‹', 'left:1rem;top:50%;transform:translateY(-50%);font-size:2.4rem;width:48px;height:48px;');
  const nextBtn  = makeBtn('›', 'right:1rem;top:50%;transform:translateY(-50%);font-size:2.4rem;width:48px;height:48px;');

  overlay.append(closeBtn, prevBtn, lbImg, nextBtn, lbCap, counter);
  document.body.appendChild(overlay);

  function openLb(images, idx, captions) {
    lbImages = images; lbIdx = idx; lbCaptions = captions || [];
    show();
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
  function go(n) { lbIdx = (n + lbImages.length) % lbImages.length; show(); }
  function show() {
    lbImg.style.opacity = '0';
    setTimeout(() => { lbImg.src = lbImages[lbIdx]; lbImg.style.opacity = '1'; }, 80);
    const cap = lbCaptions[lbIdx] || '';
    lbCap.textContent = cap;
    lbCap.style.display = cap ? 'block' : 'none';
    counter.textContent = lbImages.length > 1 ? (lbIdx + 1) + ' / ' + lbImages.length : '';
    prevBtn.style.display = lbImages.length > 1 ? 'flex' : 'none';
    nextBtn.style.display = lbImages.length > 1 ? 'flex' : 'none';
  }

  // Swipe
  let touchX = 0;
  overlay.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, {passive:true});
  overlay.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) go(lbIdx + (dx < 0 ? 1 : -1));
  }, {passive:true});

  closeBtn.addEventListener('click', e => { e.stopPropagation(); closeLb(); });
  prevBtn.addEventListener('click',  e => { e.stopPropagation(); go(lbIdx - 1); });
  nextBtn.addEventListener('click',  e => { e.stopPropagation(); go(lbIdx + 1); });
  overlay.addEventListener('click', closeLb);
  lbImg.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('keydown', e => {
    if (overlay.style.display === 'none') return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowLeft')  go(lbIdx - 1);
    if (e.key === 'ArrowRight') go(lbIdx + 1);
  });

  // Un seul handler par CONTENEUR — lit quelle image est active au moment du clic.
  // Pas de handler par img → aucun problème de slides empilés/opacité.
  const carousels = [
    { containerSel: '#qsnSlides', imgsSel: '#qsnSlides .qsn-slide img', activeSel: '#qsnSlides .qsn-slide.active img'},
    { containerSel: '#horseSlides', imgsSel: '#horseSlides .ar-slide img', activeSel: '#horseSlides .ar-slide.active img' },
    { containerSel: '#heroSlides', imgsSel: '#heroSlides .hero-slide img', activeSel: '#heroSlides .hero-slide.active img' },
    { containerSel: '#kaSlides', imgsSel: '#kaSlides .ka-slide img', activeSel: '#kaSlides .ka-slide.active img'},
    { containerSel: '#rvSlides', imgsSel: '#rvSlides .rv-slide img', activeSel: '#rvSlides .rv-slide.active img'},
    { containerSel: '#jbSlides', imgsSel: '#jbSlides .jb-slide img', activeSel: '#jbSlides .jb-slide.active img'},
  ];

  carousels.forEach(({ containerSel, imgsSel, activeSel }) => {
    const container = document.querySelector(containerSel);
    if (!container) return;
    const allImgs = Array.from(document.querySelectorAll(imgsSel));
    const srcs = allImgs.map(i => i.src);
    const caps = allImgs.map(i => i.dataset.cap || i.parentElement.dataset.cap || '');
    container.style.cursor = 'zoom-in';
    container.addEventListener('click', e => {
      if (e.target.closest('button')) return;     // ignorer flèches prev/next
      const activeImg = document.querySelector(activeSel);
      if (!activeImg) return;
      const idx = srcs.indexOf(activeImg.src);
      openLb(srcs, idx >= 0 ? idx : 0, caps);
    });
  });
})();

// ── Carousel cheval ────────────────────────────────────────────────────────────
(function () {
  const slidesEl = document.getElementById('horseSlides');
  if (!slidesEl) return;

  const slides   = slidesEl.querySelectorAll('.ar-slide');
  const thumbsEl = document.getElementById('horseThumbs');
  const capEl    = document.getElementById('horseCap');
  let cur = 0;

  // Génère les vignettes
  slides.forEach((sl, i) => {
    const img = sl.querySelector('img');
    const th  = document.createElement('img');
    th.src = img.src; th.alt = img.alt;
    th.className = 'ar-thumb' + (i === 0 ? ' active' : '');
    th.addEventListener('click', () => goTo(i));
    thumbsEl.appendChild(th);
  });

  // Initialise la légende sur la première slide
  if (capEl) capEl.textContent = slides[0].querySelector('img').dataset.cap || '';

  function goTo(n) {
    slides[cur].classList.remove('active');
    thumbsEl.querySelectorAll('.ar-thumb')[cur].classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
    thumbsEl.querySelectorAll('.ar-thumb')[cur].classList.add('active');
    if (capEl) capEl.textContent = slides[cur].querySelector('img').dataset.cap || '';
  }

  document.getElementById('horsePrev').addEventListener('click', () => goTo(cur - 1));
  document.getElementById('horseNext').addEventListener('click', () => goTo(cur + 1));

  // Swipe tactile
  let ts = 0;
  slidesEl.addEventListener('touchstart', e => { ts = e.touches[0].clientX; }, {passive:true});
  slidesEl.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - ts;
    if (Math.abs(dx) > 40) goTo(cur + (dx < 0 ? 1 : -1));
  }, {passive:true});
})();

// ── Modal descendants (foal-card) ──────────────────────────────────────────────
(function () {
  if (!document.querySelector('.foal-card')) return;

  // Injection HTML (évite de dupliquer dans chaque page)
  document.body.insertAdjacentHTML('beforeend', `
    <div id="foal-modal">
      <div id="foal-panel">
        <div id="foal-panel-img-wrap">
          <button id="foal-modal-close" aria-label="Fermer">✕</button>
          <button class="foal-nav" id="foal-prev">&#8249;</button>
          <img id="foal-panel-img" src="" alt="">
          <button class="foal-nav" id="foal-next">&#8250;</button>
        </div>
        <div id="foal-panel-info">
          <h3 id="foal-panel-name"></h3>
          <p id="foal-panel-desc"></p>
          <p id="foal-panel-counter"></p>
        </div>
      </div>
    </div>`);

  const modal  = document.getElementById('foal-modal');
  const mImg   = document.getElementById('foal-panel-img');
  const mName  = document.getElementById('foal-panel-name');
  const mDesc  = document.getElementById('foal-panel-desc');
  const mCount = document.getElementById('foal-panel-counter');
  const mPrev  = document.getElementById('foal-prev');
  const mNext  = document.getElementById('foal-next');
  let mImgs = [], mIdx = 0;

  function openModal(name, desc, imgs, startIdx) {
    mImgs = imgs; mIdx = (startIdx >= 0 && startIdx < imgs.length) ? startIdx : 0;
    mName.textContent = name;
    mDesc.textContent = desc;
    update();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  function update() {
    mImg.src = mImgs[mIdx];
    mCount.textContent = mImgs.length > 1 ? (mIdx + 1) + ' / ' + mImgs.length : '';
    mPrev.classList.toggle('hidden', mImgs.length <= 1);
    mNext.classList.toggle('hidden', mImgs.length <= 1);
  }
  function go(n) { mIdx = (n + mImgs.length) % mImgs.length; update(); }

  document.getElementById('foal-modal-close').addEventListener('click', closeModal);
  mPrev.addEventListener('click', e => { e.stopPropagation(); go(mIdx - 1); });
  mNext.addEventListener('click', e => { e.stopPropagation(); go(mIdx + 1); });
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape')     closeModal();
    if (e.key === 'ArrowLeft')  go(mIdx - 1);
    if (e.key === 'ArrowRight') go(mIdx + 1);
  });

  document.querySelectorAll('.foal-card').forEach(card => {
    card.addEventListener('click', () => {
      const imgs = JSON.parse(card.dataset.images);
      openModal(card.dataset.name, card.dataset.desc, imgs, 0);
    });
  });
})();

// Bouton de partage natif
const shareBtn = document.querySelector('.footer-share');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const url = window.location.href;
    const svg = shareBtn.innerHTML;

    // 1. Web Share API (mobile natif)
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url }); return; } catch {}
    }

    // 2. Clipboard API (HTTPS / localhost)
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      // 3. Fallback execCommand (file://, navigateurs anciens)
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {}
    }

    if (copied) {
      shareBtn.innerHTML = '✓';
      setTimeout(() => { shareBtn.innerHTML = svg; }, 1800);
    }
  });
}

// ── Photo pedigree — zoom plein écran ─────────────────────────────────────────
(function () {
  const photos = document.querySelectorAll('.pedigree-node-photo');
  if (!photos.length) return;

  const ov = document.createElement('div');
  ov.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:3000;align-items:center;justify-content:center;cursor:zoom-out;';
  const img = document.createElement('img');
  img.style.cssText = 'max-width:88vw;max-height:88vh;object-fit:contain;border-radius:8px;box-shadow:0 16px 60px rgba(0,0,0,.9);cursor:default;';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = 'position:absolute;top:1rem;right:1.5rem;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:1.3rem;width:38px;height:38px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;';
  ov.append(closeBtn, img);
  document.body.appendChild(ov);

  function open(src) { img.src = src; ov.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  function close()   { ov.style.display = 'none'; document.body.style.overflow = ''; }

  photos.forEach(p => p.addEventListener('click', () => open(p.src)));
  closeBtn.addEventListener('click', e => { e.stopPropagation(); close(); });
  ov.addEventListener('click', close);
  img.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('keydown', e => { if (ov.style.display !== 'none' && e.key === 'Escape') close(); });
})();

// Formulaire contact — feedback visuel simple
const form = document.querySelector('.contact-form form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Message envoyé ✦';
    btn.style.background = '#7A9E7E';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Envoyer';
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
}

/* ============================================
   NAV2 — navigation secondaire des fiches chevaux
   ============================================
   Trois comportements :
   1. nav2 collée sous la navbar, et remontée en haut quand la navbar se cache
   2. lien actif mis en évidence selon la section visible
   3. CTA « Nous contacter » dupliqué dans nav2 (desktop) ou en barre flottante
      (mobile) dès qu'on descend sous son point d'ancrage dans le hero
*/
const nav2 = document.getElementById('nav2');
if (nav2) {
  const navbarEl = document.querySelector('.navbar');
  const ctaAnchor = document.getElementById('ctaAnchor');
  const nav2Cta = document.getElementById('nav2Cta');
  // Bouton jumeau en fin de page (mobile) : le CTA flottant s'efface dès qu'il
  // entre dans le champ, comme s'il venait s'y poser.
  const ctaEnd = document.getElementById('ctaEnd');
  const root = document.documentElement;

  // --- 1. Mesures : hauteur réelle de la navbar et de nav2 ---
  // Attention : --nav2-h ne doit JAMAIS servir à dimensionner nav2 elle-même
  // (min-height, padding...), sinon mesure et style s'auto-alimentent et la
  // barre gonfle à chaque passage. Il sert uniquement au calcul des offsets.
  // --nav-h n'est PAS mesuré ici : il est figé dans le CSS (.navbar a une
  // hauteur explicite). Une mesure JS dépendrait du chargement du logo et
  // décalerait nav2 de façon imprévisible.
  const measure = () => {
    root.style.setProperty('--nav2-h', nav2.offsetHeight + 'px');
  };
  measure();
  window.addEventListener('resize', measure);

  // --- 2. Lien actif : IntersectionObserver sur les sections cibles ---
  const links = [...nav2.querySelectorAll('.nav2-links a')];
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (sections.length) {
    const setActive = id => links.forEach(a =>
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id)
    );

    const observer = new IntersectionObserver(entries => {
      // La section active est la plus haute de celles actuellement visibles
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    }, {
      // Bande de détection sous les deux navs
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    });
    sections.forEach(s => observer.observe(s));
  }

  // --- 3. Position de nav2 + bascule du CTA ---
  let nav2Ticking = false;
  const updateNav2 = () => {
    const navHidden = navbarEl && navbarEl.classList.contains('nav-hidden');
    const navH = navbarEl ? navbarEl.offsetHeight : 0;
    // Quand la navbar se cache, nav2 prend sa place en haut de l'écran
    root.style.setProperty('--nav2-top', navHidden ? '0px' : navH + 'px');

    // nav2 est "collée" dès que son haut atteint sa position d'accroche
    const stuck = nav2.getBoundingClientRect().top <= (navHidden ? 1 : navH + 1);
    nav2.classList.toggle('is-stuck', stuck);

    // CTA : visible dès que l'ancre du hero est passée sous la nav2.
    // Tant qu'on est au-dessus de l'ancre, le bouton reste à sa place d'origine.
    if (ctaAnchor && nav2Cta) {
      const anchorBottom = ctaAnchor.getBoundingClientRect().bottom;
      const seuil = (navHidden ? 0 : navH) + nav2.offsetHeight;
      let montrer = anchorBottom < seuil;

      // Arrivé sur le bouton de fin de page, le flottant s'efface. offsetParent
      // vaut null quand .cta-end est en display:none (donc au-dessus de 768px) :
      // le test est ainsi automatiquement neutre sur desktop.
      if (montrer && ctaEnd && ctaEnd.offsetParent !== null) {
        if (ctaEnd.getBoundingClientRect().top < window.innerHeight) montrer = false;
      }

      nav2Cta.classList.toggle('is-visible', montrer);
      // Le clone reste hors du parcours clavier tant qu'il est masqué
      const shown = nav2Cta.classList.contains('is-visible');
      nav2Cta.setAttribute('aria-hidden', shown ? 'false' : 'true');
      nav2Cta.tabIndex = shown ? 0 : -1;
    }

    nav2Ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (nav2Ticking) return;
    nav2Ticking = true;
    window.requestAnimationFrame(updateNav2);
  }, { passive: true });

  updateNav2();
}


/* ============================================
   CARROUSEL DU HERO (fiches chevaux)
   ============================================
   Une seule horloge : l'animation CSS de la minuterie. C'est sa fin
   (animationend) qui déclenche le changement de photo.

   Pourquoi pas un setInterval en parallèle : la barre et le minuteur
   dériveraient l'un de l'autre dès qu'on met en pause. Au survol l'animation
   se fige et reprend où elle en était, alors qu'un setInterval relancé
   repartirait pour un tour complet — d'où un décalage entre la barre pleine
   et le changement d'image.

   La lightbox est gérée plus haut, par le bloc "Lightbox carrousel".
*/
(function () {
  const wrap = document.getElementById('heroSlides');
  if (!wrap) return;

  const slides = Array.from(wrap.querySelectorAll('.hero-slide'));

  // Fond flouté par slide (rendu "contain") : on recopie le src de chaque photo
  // dans --slide-bg, utilisé par .hero-slide::before pour remplir le cadre.
  slides.forEach(sl => {
    const img = sl.querySelector('img');
    if (img) sl.style.setProperty('--slide-bg', `url("${img.getAttribute('src')}")`);
  });

  if (slides.length < 2) return;

  const timerEl = document.getElementById('heroTimer');
  const capEl = document.getElementById('heroCap');
  const carousel = wrap.closest('.hero-carousel');
  const DELAY = 5000;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, fallback = null;

  const segs = slides.map(() => {
    const seg = document.createElement('span');
    seg.className = 'hero-dot';
    seg.appendChild(document.createElement('i'));
    timerEl && timerEl.appendChild(seg);
    return seg;
  });
  if (timerEl) timerEl.style.setProperty('--hero-delay', DELAY + 'ms');

  const paintTimer = () => segs.forEach((seg, i) => {
    seg.classList.remove('done', 'running');
    if (i < cur) seg.classList.add('done');
    if (i === cur) {
      // Reflow forcé : sans lui, réappliquer la même classe ne relance pas
      // le keyframe et l'animation reste figée à sa fin.
      void seg.offsetWidth;
      seg.classList.add('running');
    }
  });

  const goTo = n => {
    slides[cur].classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
    // Les légendes vivent sur les <img> (data-cap), déjà utilisées par la lightbox
    if (capEl) capEl.textContent = slides[cur].querySelector('img')?.dataset.cap || '';
    paintTimer();
    if (reduced) restartFallback();
  };

  // Sans animation (préférence système), il faut bien une horloge de secours
  function restartFallback() {
    clearTimeout(fallback);
    fallback = setTimeout(() => goTo(cur + 1), DELAY);
  }

  // L'animation de la barre en cours arrive à son terme → photo suivante
  timerEl && timerEl.addEventListener('animationend', e => {
    if (e.target.parentElement.classList.contains('running')) goTo(cur + 1);
  });

  const pause = () => {
    carousel && carousel.classList.add('is-paused');
    clearTimeout(fallback);
  };
  const resume = () => {
    carousel && carousel.classList.remove('is-paused');
    if (reduced) restartFallback();
  };

  goTo(0);

  wrap.querySelector('.hero-prev')?.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation(); goTo(cur - 1);
  });
  wrap.querySelector('.hero-next')?.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation(); goTo(cur + 1);
  });

  wrap.addEventListener('mouseenter', pause);
  wrap.addEventListener('mouseleave', resume);
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());

  let tx = 0;
  wrap.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) goTo(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();

/* ============================================
   PÉDIGRÉE REPLIABLE (fiches chevaux)
   ============================================
   Un bouton par parent : chacun ne déplie que sa propre branche.
   L'état replié vient du HTML, ce script ne fait que le basculer.
*/
document.querySelectorAll('.ped-toggle').forEach(btn => {
  const parent = btn.closest('.ped-parent');
  if (!parent) return;
  const label = btn.querySelector('.ped-toggle-label');

  btn.addEventListener('click', () => {
    const open = parent.classList.toggle('is-collapsed') === false;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (label) label.textContent = open ? 'Masquer les ascendants' : 'Voir les ascendants';
  });
});
