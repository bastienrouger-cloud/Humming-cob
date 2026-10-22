/* ============================================
   HUMMING COB — Scripts principaux
   ============================================ */

// Navbar scroll effect : ombre au scroll + masquage auto (scroll bas = cache, scroll haut = revient).
// Pages avec <body class="nav-fixe"> (l'accueil, 16/10) : la nav reste toujours visible.
const navbar = document.querySelector('.navbar');
const navFixe = document.body.classList.contains('nav-fixe');
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
      if (!mobileMenuOpen && !navFixe) {
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
  // Fermer le menu au clic sur un lien
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Mise en évidence de la page active dans la nav
(function () {
  const links = document.querySelectorAll('.nav-links a');
  if (!links.length) return;
  const path = location.pathname.toLowerCase();

  // Correspondance exacte (pages avec un vrai lien dans la nav).
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
  // Fiches, anciennes pages de catégorie et « mémoire » → « Nos chevaux »
  if (/\/(reproducteurs|poulains)\/|\/(reproducteurs|poulains|memoire)\.html$/.test(path)) activateCategory('nos-chevaux.html');
  // La frise « Notre histoire » fait partie de L'élevage
  if (/\/frise\.html$/.test(path)) activateCategory('elevage.html');

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
  // Accessible aux autres scripts (ex. l'arbre : photo de la carte du cheval) : ouvrirLightbox([src], 0, [légende])
  window.ouvrirLightbox = openLb;
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

// ── Cartes chevaux → modale (chevaux extérieurs) ──────────────────────────────
// Les cartes sont générées par build.py (<!-- @cartes: … -->). Une carte de
// cheval extérieur (.cc--modale), ou une case de pédigrée (.pg-node--modale), ouvre cette modale, nourrie par js/chevaux.js
// (CHEVAUX) : carrousel des photos + toutes les données connues. Une donnée
// absente n'est pas affichée (pas de « mère : inconnue »).
(function () {
  const cartes = document.querySelectorAll('.cc--modale, .pg-node--modale');
  if (!cartes.length || typeof CHEVAUX === 'undefined') return;

  const PAR_ID = Object.fromEntries(CHEVAUX.map(c => [c.id, c]));
  const scriptMain = document.querySelector('script[src$="js/main.js"]');
  const BASE = scriptMain ? scriptMain.getAttribute('src').replace(/js\/main\.js$/, '') : '';
  const url  = p => BASE + p;
  const esc  = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const dateFr = d => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(d || ''); return m ? `${+m[3]} ${MOIS[+m[2] - 1]} ${m[1]}` : d; };
  const annee = c => { const m = /\d{4}/.exec(c.naissance || ''); return m ? +m[0] : null; };

  // Même règle que build.py (libelle_sexe)
  function libelleSexe(c) {
    const an = annee(c), age = an ? new Date().getFullYear() - an : null;
    if (c.sexe === 'hongre') return 'Hongre';
    if (c.sexe === 'femelle') return (age !== null && age < 3 && c.role !== 'jument') ? 'Pouliche' : 'Jument';
    if (c.role === 'etalon') return 'Étalon';
    return (age !== null && age < 1) ? 'Poulain' : 'Entier';
  }
  function badge(c) {
    const e = c.sexe === 'femelle' ? 'e' : '', par = c.vendeur ? ' par ' + c.vendeur : '';
    // Pastille en contour dans la modale (pleine seulement sur les photos).
    const p = v => `cm-badge pastille pastille--${v} pastille--contour`;
    if (c.statut === 'a-vendre') return `<span class="${p('vente')}">À vendre${esc(par)}</span>`;
    if (c.statut === 'reserve')  return `<span class="${p('reserve')}">Réservé${e}${esc(par)}</span>`;
    if (c.statut === 'vendu')    return `<span class="${p('vendu')}">Vendu${e}${esc(par)}</span>`;
    if (c.statut === 'garde' && c.role === 'poulain') return `<span class="${p('reste')}">Reste à l'élevage</span>`;
    if (c.role === 'memoire')    return '<span class="cm-badge pastille pastille--memoire">En mémoire</span>';
    return '';
  }
  const lienCheval = id => {
    const c = PAR_ID[id];
    if (!c) return '';
    const cl = 'cm-n cm-n--' + (c.sexe === 'femelle' ? 'femelle' : 'male');
    return c.page ? `<a class="${cl}" href="${esc(url(c.page))}">${esc(c.nom)}</a>` : `<span class="${cl}">${esc(c.nom)}</span>`;
  };

  document.body.insertAdjacentHTML('beforeend', `
    <div class="cm" id="cm" hidden>
      <div class="cm-fond" data-fermer></div>
      <div class="cm-boite" role="dialog" aria-modal="true" aria-labelledby="cmNom">
        <button type="button" class="cm-fermer" data-fermer aria-label="Fermer">✕</button>
        <div class="cm-carrousel"></div>
        <div class="cm-infos"></div>
      </div>
    </div>`);
  const cm = document.getElementById('cm');
  const boite = cm.querySelector('.cm-boite');
  const carrousel = cm.querySelector('.cm-carrousel');
  const infos = cm.querySelector('.cm-infos');
  let photos = [], idx = 0, carteOrigine = null;

  function montrer(n) {
    if (!photos.length) return;
    idx = (n + photos.length) % photos.length;
    carrousel.querySelectorAll('.cm-slide').forEach((s, i) => s.classList.toggle('actif', i === idx));
    carrousel.querySelectorAll('.cm-points button').forEach((p, i) => p.classList.toggle('actif', i === idx));
    const cpt = carrousel.querySelector('.cm-compteur');
    if (cpt) cpt.textContent = `${idx + 1} / ${photos.length}`;
  }

  function ouvrir(carte) {
    const c = PAR_ID[carte.dataset.cheval];
    if (!c) return;
    const v = Object.assign({}, c, (c.cartes || {})[carte.dataset.contexte || ''] || {});
    // Une photo = un chemin, ou {src, legende} quand elle a une légende.
    photos = ((v.photos && v.photos.length) ? v.photos : [v.photo || v.photo_arbre].filter(Boolean))
      .map(p => typeof p === 'string' ? { src: p } : p);
    const femelle = c.sexe === 'femelle';
    boite.classList.toggle('is-femelle', femelle);
    boite.classList.toggle('is-memoire', c.role === 'memoire');

    carrousel.innerHTML = photos.map((p, i) => `
      <figure class="cm-slide" style="--bg:url('${esc(url(p.src)).replace(/'/g, '%27')}')">
        <img src="${esc(url(p.src))}" alt="${esc(p.legende ? c.nom + ' — ' + p.legende : c.nom + ' — photo ' + (i + 1))}"${i ? ' loading="lazy"' : ''}>
        ${p.legende ? `<figcaption>${esc(p.legende)}</figcaption>` : ''}
      </figure>`).join('') + (photos.length > 1 ? `
      <button type="button" class="cm-nav cm-prec" aria-label="Photo précédente">‹</button>
      <button type="button" class="cm-nav cm-suiv" aria-label="Photo suivante">›</button>
      <div class="cm-points">${photos.map((_, i) => `<button type="button" aria-label="Photo ${i + 1}"></button>`).join('')}</div>
      <span class="cm-compteur"></span>` : '');

    const nom = nomChevalHTML(c);   // js/chevaux.js (généré par build.py)
    const lignes = [];
    if (c.naissance) lignes.push([c.deces ? 'Vie' : (femelle ? 'Née' : 'Né'), esc(dateFr(c.naissance)) + (c.deces ? ' — ' + esc(c.deces) : '')]);
    if (c.race)   lignes.push(['Race', esc(c.race)]);
    if (c.robe)   lignes.push(['Robe', esc(c.robe)]);
    if (c.taille) lignes.push(['Taille', esc(c.taille)]);
    if (c.pere && PAR_ID[c.pere]) lignes.push(['Père', lienCheval(c.pere)]);
    if (c.mere && PAR_ID[c.mere]) lignes.push(['Mère', lienCheval(c.mere)]);
    if (c.elevage)      lignes.push(['Élevage', esc(c.elevage.replace(/^Élevage\s+/i, ''))]);
    else if (c.origine) lignes.push(['Origine', esc(c.origine)]);
    if (c.papiers) lignes.push(['Papiers', esc(c.papiers)]);
    if (c.registre) lignes.push(['Registre', esc(c.registre)]);
    if (c.distinction) lignes.push(['Distinction', esc(c.distinction)]);   // n'est plus sur la carte du pédigrée
    const texte = v.description || v.resume;
    const arbre = (typeof POSITIONS_ARBRE !== 'undefined' && POSITIONS_ARBRE[c.id])
      ? `<a class="cm-lien" href="${esc(url('arbre-genealogique.html#' + c.id))}">Voir dans l'arbre généalogique
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>` : '';

    infos.innerHTML = `
      <p class="cm-genre">${libelleSexe(c)}${badge(c)}</p>
      <h2 class="cm-nom" id="cmNom">${nom}</h2>
      ${texte ? `<p class="cm-texte">${esc(texte)}</p>` : ''}
      ${lignes.length ? `<dl>${lignes.map(([k, x]) => `<dt>${k}</dt><dd>${x}</dd>`).join('')}</dl>` : ''}
      ${arbre ? `<div class="cm-actions">${arbre}</div>` : ''}`;
    infos.scrollTop = 0;
    montrer(0);
    carteOrigine = carte;
    cm.hidden = false;
    document.body.style.overflow = 'hidden';
    cm.querySelector('.cm-fermer').focus();
  }

  function fermer() {
    cm.hidden = true;
    document.body.style.overflow = '';
    if (carteOrigine) carteOrigine.focus();
  }

  cm.addEventListener('click', e => { if (e.target.closest('[data-fermer]')) fermer(); });
  carrousel.addEventListener('click', e => {
    if (e.target.closest('.cm-prec')) montrer(idx - 1);
    else if (e.target.closest('.cm-suiv')) montrer(idx + 1);
    else {
      const p = e.target.closest('.cm-points button');
      if (p) montrer([...p.parentNode.children].indexOf(p));
    }
  });
  document.addEventListener('keydown', e => {
    if (cm.hidden) return;
    if (e.key === 'Escape')     fermer();
    if (e.key === 'ArrowLeft')  montrer(idx - 1);
    if (e.key === 'ArrowRight') montrer(idx + 1);
  });
  let x0 = null;
  carrousel.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  carrousel.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) montrer(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  cartes.forEach(carte => {
    carte.addEventListener('click', () => ouvrir(carte));
    carte.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrir(carte); }
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

// Formulaires envoyés par Web3Forms sans quitter la page : contact.html et
// livre-dor.html (attribut data-envoi="main.js").
// Contact : ?sujet=<valeur> présélectionne le sujet (liens des fiches : ?sujet=nashi,
// ?sujet=saillie-archy) ; le sujet choisi est repris dans l'objet du mail.
// Textes de réussite / d'échec : data-ok et data-erreur sur le <form> (sinon ceux du contact).
document.querySelectorAll('form[data-envoi="main.js"]').forEach(form => {
  const select = form.querySelector('#sujet');
  const objet = form.querySelector('input[name="subject"]');
  const majObjet = () => {
    if (!select || !objet) return;
    const opt = select.selectedOptions[0];
    objet.value = 'Humming Cob — ' + (opt && opt.value ? opt.textContent.trim() : 'nouveau message');
  };
  if (select) {
    const voulu = new URLSearchParams(location.search).get('sujet');
    if (voulu && select.querySelector(`option[value="${CSS.escape(voulu)}"]`)) select.value = voulu;
    select.addEventListener('change', majObjet);
  }
  majObjet();

  const btn = form.querySelector('button[type=submit]');
  const result = form.querySelector('.form-result');
  const libelle = btn.textContent;
  const texteOk = form.dataset.ok || 'Message envoyé ! Nous vous répondrons dans les meilleurs délais.';
  const texteErreur = form.dataset.erreur || "Le message n'est pas parti. Réessayez, ou écrivez-nous à contact@hummingcob.fr.";
  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';
    let ok = false;
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      ok = (await res.json()).success === true;
    } catch (_) { ok = false; }
    result.hidden = false;
    result.classList.toggle('is-erreur', !ok);
    result.textContent = ok ? texteOk : texteErreur;
    if (ok) { form.reset(); majObjet(); }
    btn.disabled = false;
    btn.textContent = libelle;
  });
});

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
   RANGÉES DE CARTES DÉFILANTES (nos-chevaux.html)
   ============================================
   Défilement natif (doigt, trackpad, molette + Maj). Les flèches avancent
   d'une carte ; elles se cachent si tout tient à l'écran et se grisent en bout
   de rangée. Les classes peut-gauche / peut-droite posent un fondu sur le bord.
*/
document.querySelectorAll('.troupeau').forEach(section => {
  const rangee = section.querySelector('.rangee');
  const fleches = section.querySelector('.troupeau-fleches');
  if (!rangee || !fleches) return;
  const [prec, suiv] = fleches.querySelectorAll('button');

  const pas = () => {
    const carte = rangee.querySelector('.cc');
    const gap = parseFloat(getComputedStyle(rangee).columnGap) || 0;
    return carte ? carte.getBoundingClientRect().width + gap : rangee.clientWidth * 0.8;
  };
  const maj = () => {
    const max = rangee.scrollWidth - rangee.clientWidth;
    const deborde = max > 2;
    const g = deborde && rangee.scrollLeft > 2;
    const d = deborde && rangee.scrollLeft < max - 2;
    fleches.hidden = !deborde;
    prec.disabled = !g;
    suiv.disabled = !d;
    rangee.classList.toggle('peut-gauche', g);
    rangee.classList.toggle('peut-droite', d);
  };

  prec.addEventListener('click', () => rangee.scrollBy({ left: -pas() }));
  suiv.addEventListener('click', () => rangee.scrollBy({ left: pas() }));
  rangee.addEventListener('scroll', maj, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(maj).observe(rangee);
  else window.addEventListener('resize', maj);
  maj();
});

/* ============================================
   CARROUSEL « QUI SOMMES-NOUS » (accueil)
   ============================================
   Déplacé depuis un script écrit dans index.html (16/10), sans changement.
   Fondu entre les photos toutes les 5 s, flèches, glisser au doigt ;
   pause au survol. Ne fait rien hors de l'accueil (#qsnSlides absent).
*/
(function(){
  var wrap = document.getElementById('qsnSlides');
  if (!wrap) return;
  var slides  = Array.from(wrap.querySelectorAll('.qsn-slide'));
  var counter = document.getElementById('qsnCounter');
  if(!slides.length) return;

  var cur = 0, timer;

  slides.forEach(function(s){
    s.style.position   = 'absolute';
    s.style.inset      = '0';
    s.style.display    = 'block';
    s.style.opacity    = '0';
    s.style.transition = 'opacity .6s ease';
  });
  wrap.style.position = 'relative';

  function goTo(n){
    slides[cur].style.opacity = '0';
    slides[cur].classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].style.opacity = '1';
    slides[cur].classList.add('active');
    if(counter) counter.textContent = (cur+1)+' ⁄ '+slides.length;
  }

  function resetTimer(){ clearInterval(timer); timer = setInterval(function(){ goTo(cur+1); }, 5000); }

  goTo(0);
  resetTimer();

  var btnPrev = wrap.querySelector('.qsn-prev');
  var btnNext = wrap.querySelector('.qsn-next');
  if(btnPrev) btnPrev.addEventListener('click', function(e){ e.preventDefault(); goTo(cur-1); resetTimer(); });
  if(btnNext) btnNext.addEventListener('click', function(e){ e.preventDefault(); goTo(cur+1); resetTimer(); });

  wrap.addEventListener('mouseenter', function(){ clearInterval(timer); });
  wrap.addEventListener('mouseleave', resetTimer);

  var tx = 0;
  wrap.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, {passive:true});
  wrap.addEventListener('touchend',   function(e){
    var dx = e.changedTouches[0].clientX - tx;
    if(Math.abs(dx) > 40){ goTo(cur + (dx < 0 ? 1 : -1)); resetTimer(); }
  }, {passive:true});
})();
