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
  });
  // Fermer au clic sur un lien
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
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
  let lbImages = [], lbIdx = 0;

  // Overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:3000;align-items:center;justify-content:center;padding:1.5rem;';

  // Image
  const lbImg = document.createElement('img');
  lbImg.style.cssText = 'max-width:82vw;max-height:88vh;object-fit:contain;border-radius:6px;box-shadow:0 12px 60px rgba(0,0,0,.9);cursor:default;transition:opacity .18s;';

  // Compteur
  const counter = document.createElement('div');
  counter.style.cssText = 'position:absolute;bottom:1.2rem;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.5);font-size:.72rem;letter-spacing:.14em;';

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

  overlay.append(closeBtn, prevBtn, lbImg, nextBtn, counter);
  document.body.appendChild(overlay);

  function openLb(images, idx) {
    lbImages = images; lbIdx = idx;
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
    { containerSel: '#arSlides', imgsSel: '#arSlides .ar-slide img', activeSel: '#arSlides .ar-slide.active img' },
    { containerSel: '#avMain',   imgsSel: '#avMain img[data-cap]',   activeSel: '#avMain img.on'                },
    { containerSel: '#kaSlides', imgsSel: '#kaSlides .ka-slide img', activeSel: '#kaSlides .ka-slide.active img'},
    { containerSel: '#suSlides', imgsSel: '#suSlides .su-slide img', activeSel: '#suSlides .su-slide.active img'},
    { containerSel: '#saSlides', imgsSel: '#saSlides .sa-slide img', activeSel: '#saSlides .sa-slide.active img'},
    { containerSel: '#rjSlides', imgsSel: '#rjSlides .rj-slide img', activeSel: '#rjSlides .rj-slide.active img'},
    { containerSel: '#rvSlides', imgsSel: '#rvSlides .rv-slide img', activeSel: '#rvSlides .rv-slide.active img'},
    { containerSel: '#jbSlides', imgsSel: '#jbSlides .jb-slide img', activeSel: '#jbSlides .jb-slide.active img'},
  ];

  carousels.forEach(({ containerSel, imgsSel, activeSel }) => {
    const container = document.querySelector(containerSel);
    if (!container) return;
    const srcs = Array.from(document.querySelectorAll(imgsSel)).map(i => i.src);
    container.style.cursor = 'zoom-in';
    container.addEventListener('click', e => {
      if (e.target.closest('button')) return;     // ignorer flèches prev/next
      const activeImg = document.querySelector(activeSel);
      if (!activeImg) return;
      const idx = srcs.indexOf(activeImg.src);
      openLb(srcs, idx >= 0 ? idx : 0);
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
