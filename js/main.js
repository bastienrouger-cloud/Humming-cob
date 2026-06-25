/* ============================================
   HUMMING COB — Scripts principaux
   ============================================ */

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
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
      if (parentDropdown && navLinks.classList.contains('open')) {
        const caret = a.querySelector('.nav-caret');
        if (caret && caret.contains(e.target)) {
          // Clic sur le caret uniquement → toggle sous-menu, pas de navigation
          e.preventDefault();
          parentDropdown.classList.toggle('open');
        } else {
          // Clic sur le texte → naviguer + fermer le menu
          navLinks.classList.remove('open');
          navLinks.querySelectorAll('.has-dropdown.open').forEach(el => el.classList.remove('open'));
        }
      } else {
        navLinks.classList.remove('open');
      }
    });
  });
}

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
