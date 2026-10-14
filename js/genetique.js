// Génétique du poulain — utilisé par accouplement.html.
// Source : champ « genetique » de data/chevaux/*.json (voir data/README.md),
// ou tests saisis par le visiteur dans l'éditeur.
// Règle : on n'invente rien. Un locus non testé = toutes les possibilités ;
// « _ » = allèle inconnu. Chaque résultat est donc une fourchette [min, max].
// Crème (Cr) et pearl (prl) sont deux allèles du même gène (SLC45A2) : ils sont
// regroupés pour le calcul (un cheval n'en porte que deux en tout).
(function(global){
'use strict';

// Format des données (identique à build.py)
const LOCI = {
  PSSM1: ['N', 'P'], FIS: ['N', 'P'], E: ['E', 'e'], A: ['A', 'a'], D: ['D', 'd'], Z: ['Z', 'z'],
  prl: ['prl', 'n'], Cr: ['Cr', 'n'], To: ['To', 'n'], KIT: ['Sb1', 'W20', 'n']
};
const LIBELLES = {
  PSSM1: 'PSSM1', FIS: 'FIS', E: 'Noir / alezan (E)', A: 'Bai / noir (A)', D: 'Dun (D)', Z: 'Silver (Z)',
  Cr: 'Crème (Cr)', prl: 'Pearl (prl)', To: 'Tobiano (To)', KIT: 'Sabino 1 / W20'
};
// Génotypes proposés à la saisie (éditeur)
const CHOIX = {
  PSSM1: ['N/N', 'N/P', 'P/P'], FIS: ['N/N', 'N/P', 'P/P'],
  E: ['E/E', 'E/e', 'e/e'], A: ['A/A', 'A/a', 'a/a'], D: ['D/D', 'D/d', 'd/d'], Z: ['Z/Z', 'Z/z', 'z/z'],
  Cr: ['n/n', 'Cr/n', 'Cr/Cr'], prl: ['n/n', 'prl/n', 'prl/prl'], To: ['n/n', 'To/n', 'To/To'],
  KIT: ['n/n', 'Sb1/n', 'Sb1/Sb1', 'W20/n', 'W20/W20', 'Sb1/W20']
};

// Loci de calcul
const CALC = {
  PSSM1: ['N', 'P'], FIS: ['N', 'P'], E: ['E', 'e'], A: ['A', 'a'], D: ['D', 'd'], Z: ['Z', 'z'],
  SLC: ['Cr', 'prl', 'n'], To: ['To', 'n'], KIT: ['Sb1', 'W20', 'n']
};
const NOM_LOCUS = {
  E: 'Noir / alezan', A: 'Bai / noir', D: 'Dun', Z: 'Silver', SLC: 'Crème / pearl',
  To: 'Tobiano', KIT: 'Sabino 1 / W20', PSSM1: 'PSSM1', FIS: 'FIS'
};

function paires(al){ const r = []; for(let i = 0; i < al.length; i++) for(let j = i; j < al.length; j++) r.push([al[i], al[j]]); return r; }
function compatible(test, p, f){
  if(!test) return true;
  const t = String(test).split('/'), q = p.map(f), ok = (a, b) => a === '_' || a === b;
  return (ok(t[0], q[0]) && ok(t[1], q[1])) || (ok(t[0], q[1]) && ok(t[1], q[0]));
}
// Génotypes possibles d'un cheval à un locus de calcul
function possibles(g, locus){
  g = g || {};
  if(locus === 'SLC') return paires(CALC.SLC).filter(p =>
    compatible(g.Cr, p, a => a === 'Cr' ? 'Cr' : 'n') && compatible(g.prl, p, a => a === 'prl' ? 'prl' : 'n'));
  return paires(CALC[locus]).filter(p => compatible(g[locus], p, a => a));
}
function teste(g, locus){ g = g || {}; return locus === 'SLC' ? !!(g.Cr || g.prl) : !!g[locus]; }
function complet(g, locus){ return possibles(g, locus).length === 1; }

// Probabilité [min, max] qu'un poulain vérifie pred(allèles) à ce locus
function fourchette(g1, g2, locus, pred){
  const P1 = possibles(g1, locus), P2 = possibles(g2, locus);
  if(!P1.length || !P2.length) return null;           // données incohérentes
  let min = 1, max = 0;
  for(const p1 of P1) for(const p2 of P2){
    let s = 0;
    for(const a of p1) for(const b of p2) if(pred([a, b])) s += .25;
    min = Math.min(min, s); max = Math.max(max, s);
  }
  return [min, max];
}
const nb = (al, x) => al.filter(a => a === x).length;
const EVT = {
  E:   { 'E_': al => nb(al, 'E') > 0, 'ee': al => nb(al, 'E') === 0 },
  A:   { 'A_': al => nb(al, 'A') > 0, 'aa': al => nb(al, 'A') === 0 },
  D:   { 'D_': al => nb(al, 'D') > 0, 'dd': al => nb(al, 'D') === 0 },
  Z:   { 'Z_': al => nb(al, 'Z') > 0, 'zz': al => nb(al, 'Z') === 0 },
  SLC: {
    'aucune': al => nb(al, 'Cr') === 0 && nb(al, 'prl') < 2,
    'cr1':    al => nb(al, 'Cr') === 1 && nb(al, 'prl') === 0,
    'cr2':    al => nb(al, 'Cr') === 2,
    'prl2':   al => nb(al, 'prl') === 2,
    'crprl':  al => nb(al, 'Cr') === 1 && nb(al, 'prl') === 1
  }
};
const inconnu = r => !r || (r[0] === 0 && r[1] === 1);
const fois = (a, b) => [a[0] * b[0], a[1] * b[1]];
const UN = [1, 1];

// Un locus est exploitable si aucune de ses issues n'est totalement imprévisible.
function evenements(g1, g2, locus){
  const o = {};
  for(const [k, f] of Object.entries(EVT[locus])) o[k] = fourchette(g1, g2, locus, f);
  o.connu = Object.values(o).every(r => !inconnu(r));
  return o;
}

// Noms de robes (vocabulaire à valider avec Alice)
const CREME = {
  'alezan': ['palomino', 'cremello'], 'bai': ['buckskin', 'perlino'], 'noir': ['smoky black', 'smoky cream'],
  'bai ou noir': ['buckskin ou smoky black', 'perlino ou smoky cream']
};
const DUN = { 'alezan': 'alezan dun', 'bai': 'bai dun', 'noir': 'grullo', 'bai ou noir': 'bai dun ou grullo' };
function nomRobe(base, dil, dun, silver){
  let n;
  if(dil === 'cr1') n = CREME[base][0];
  else if(dil === 'cr2') n = CREME[base][1];
  else if(dil === 'prl2') n = base + ' double pearl';
  else if(dil === 'crprl') n = CREME[base][0] + ' pearl';
  else n = base;
  if(dun) n = (dil === 'aucune' || !dil) ? DUN[base] : n + ' dun';
  if(silver) n += ' silver';
  return n.charAt(0).toUpperCase() + n.slice(1);
}
// Teinte indicative de la pastille
const TEINTE = {
  'alezan': '#B4612F', 'bai': '#7A4127', 'noir': '#2E2724', 'bai ou noir': '#55342A'
};
function teinte(base, dil, dun, silver){
  let c = TEINTE[base];
  const mix = (a, p) => `color-mix(in srgb, ${a} ${p}%, ${c})`;
  if(dil === 'cr1') c = base === 'noir' ? mix('#7A6656', 35) : mix('#E8C77A', 60);
  if(dil === 'cr2') c = mix('#F3E9D2', 88);
  if(dil === 'prl2') c = mix('#E6C59C', 55);
  if(dil === 'crprl') c = mix('#F0E2C6', 75);
  if(dun) c = mix('#B8AB96', 40);
  if(silver) c = mix('#8B6A55', 45);
  return c;
}

// ─── Calcul complet ───────────────────────────────────────────────────────
function analyser(g1, g2){
  g1 = g1 || {}; g2 = g2 || {};
  const ev = {}; for(const l of ['E', 'A', 'D', 'Z', 'SLC']) ev[l] = evenements(g1, g2, l);
  const nonPris = [];

  // Robes possibles
  const robes = [];
  if(ev.E.connu){
    const bases = [['alezan', ev.E.ee]];
    if(ev.A.connu) bases.push(['bai', fois(ev.E.E_, ev.A.A_)], ['noir', fois(ev.E.E_, ev.A.aa)]);
    else bases.push(['bai ou noir', ev.E.E_]);
    const dils = ev.SLC.connu ? ['aucune', 'cr1', 'cr2', 'prl2', 'crprl'].map(k => [k, ev.SLC[k]]) : [[null, UN]];
    const duns = ev.D.connu ? [[true, ev.D.D_], [false, ev.D.dd]] : [[false, UN]];
    for(const [base, pb] of bases) for(const [dil, pd] of dils) for(const [dun, pdu] of duns){
      const silv = (ev.Z.connu && base !== 'alezan') ? [[true, ev.Z.Z_], [false, ev.Z.zz]] : [[false, UN]];
      for(const [sil, ps] of silv){
        const p = fois(fois(fois(pb, pd), pdu), ps);
        if(p[1] > 0) robes.push({ nom: nomRobe(base, dil, dun, sil), teinte: teinte(base, dil, dun, sil), p });
      }
    }
    robes.sort((a, b) => b.p[1] - a.p[1] || b.p[0] - a.p[0]);
  }

  // Panachures
  const motifs = [];
  const fTo = fourchette(g1, g2, 'To', al => nb(al, 'To') > 0);
  if(inconnu(fTo)) nonPris.push('To');
  else {
    motifs.push({ nom: 'Tobiano', p: fTo });
    const d = fourchette(g1, g2, 'To', al => nb(al, 'To') === 2);
    if(d[0] > 0) motifs.push({ nom: 'dont tobiano homozygote (tous ses poulains seront pie)', p: d, sous: true });
  }
  const fSb = fourchette(g1, g2, 'KIT', al => nb(al, 'Sb1') > 0), fW = fourchette(g1, g2, 'KIT', al => nb(al, 'W20') > 0);
  if(inconnu(fSb) && inconnu(fW)) nonPris.push('KIT');
  else {
    if(!inconnu(fSb)){
      motifs.push({ nom: 'Sabino 1', p: fSb });
      const d = fourchette(g1, g2, 'KIT', al => nb(al, 'Sb1') === 2);
      if(d[0] > 0) motifs.push({ nom: 'dont double sabino (souvent presque blanc)', p: d, sous: true });
    }
    if(!inconnu(fW)) motifs.push({ nom: 'W20 (marques blanches)', p: fW });
  }

  // Gènes cachés, transmissibles
  const caches = [];
  if(ev.E.connu){ const r = fourchette(g1, g2, 'E', al => nb(al, 'E') === 1); if(r[1] > 0) caches.push({ nom: "Porte l'alezan (un seul « e »)", p: r }); }
  // Pearl : même si la robe crème/pearl n'est pas prévisible (autre parent non
  // testé), on sait parfois que le poulain reçoit un pearl (ex. d'un double pearl).
  { const r = fourchette(g1, g2, 'SLC', al => nb(al, 'prl') > 0);
    if(r && !inconnu(r) && r[1] > 0) caches.push({ nom: 'Porte le pearl (transmissible)', p: r }); }
  if(ev.E.connu && ev.Z.connu){ const r = fois(ev.E.ee, ev.Z.Z_); if(r[1] > 0) caches.push({ nom: 'Porte le silver, invisible sur alezan', p: r }); }

  for(const l of ['E', 'A', 'D', 'Z', 'SLC']) if(!ev[l].connu) nonPris.push(l);

  // Santé
  const sante = {
    PSSM1: { atteint: fourchette(g1, g2, 'PSSM1', al => nb(al, 'P') > 0) },
    FIS: { atteint: fourchette(g1, g2, 'FIS', al => nb(al, 'P') === 2), porteur: fourchette(g1, g2, 'FIS', al => nb(al, 'P') === 1) }
  };
  return { robes, motifs, caches, nonPris: [...new Set(nonPris)], sante };
}

// Contrôle d'un objet genetique (import JSON, saisie) : renvoie la liste des erreurs
function erreurs(g){
  const err = [];
  if(g == null) return err;
  if(typeof g !== 'object' || Array.isArray(g)) return ['« genetique » doit être un objet {locus: génotype}'];
  for(const [l, gt] of Object.entries(g)){
    const al = String(gt).split('/');
    if(!LOCI[l]) err.push('locus inconnu « ' + l + ' »');
    else if(al.length !== 2 || al.some(a => a !== '_' && !LOCI[l].includes(a)) || (al[0] === '_' && al[1] === '_'))
      err.push('génotype « ' + gt + ' » invalide pour ' + l);
  }
  if(!err.length && !possibles(g, 'SLC').length) err.push('crème et pearl incompatibles (' + g.Cr + ' / ' + g.prl + ')');
  return err;
}

global.Genetique = { LOCI, LIBELLES, CHOIX, NOM_LOCUS, possibles, teste, complet, fourchette, analyser, erreurs, inconnu };
})(typeof window !== 'undefined' ? window : globalThis);
