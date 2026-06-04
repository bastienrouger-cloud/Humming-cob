/* ============================================
   HUMMING COB — Animation pétales de cerisier
   ============================================ */

(function () {
  const canvas = document.getElementById('sakura-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, petals = [], animId;

  // Palette rose
  const COLORS = ['#F5C6D2','#E8A8BB','#F2D0DC','#FBDDE6','#EAB8C8','#F8E0E8'];

  function resize() {
    // Utilise les dimensions du viewport — le hero est toujours 100vw × 100vh
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomPetal() {
    return {
      x:        Math.random() * W,
      y:        -20 - Math.random() * 80,
      size:     7 + Math.random() * 10,
      speedX:   -0.15 + Math.random() * 0.3,
      speedY:   0.2 + Math.random() * 0.35,
      rot:      Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.012,
      swing:    Math.random() * Math.PI * 2,
      swingAmt: 0.25 + Math.random() * 0.4,
      swingSpeed:0.008 + Math.random() * 0.01,
      alpha:    0.55 + Math.random() * 0.35,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  }

  function drawFlower(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;

    const s = p.size;

    // 5 pétales disposés en étoile
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / 5);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      // Courbe gauche du pétale
      ctx.bezierCurveTo(-s * 0.48, -s * 0.18, -s * 0.52, -s * 0.65, -s * 0.16, -s);
      // Encoche au sommet (caractéristique de la fleur de cerisier)
      ctx.quadraticCurveTo(0, -s * 0.78, s * 0.16, -s);
      // Courbe droite du pétale
      ctx.bezierCurveTo(s * 0.52, -s * 0.65, s * 0.48, -s * 0.18, 0, 0);

      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    // Centre de la fleur (pistil)
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 248, 215, 0.95)';
    ctx.fill();

    // Étamines (petits points autour du centre)
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i) / 7;
      const dx = Math.cos(angle) * s * 0.38;
      const dy = Math.sin(angle) * s * 0.38;
      ctx.beginPath();
      ctx.arc(dx, dy, s * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230, 185, 80, 0.75)';
      ctx.fill();
    }

    ctx.restore();
  }

  function update() {
    ctx.clearRect(0, 0, W, H);

    // Maintenir ~45 pétales
    while (petals.length < 45) petals.push(randomPetal());

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.swing += p.swingSpeed;
      p.x += p.speedX + Math.sin(p.swing) * p.swingAmt;
      p.y += p.speedY;
      p.rot += p.rotSpeed;

      drawFlower(p);

      if (p.y > H + 30 || p.x < -30 || p.x > W + 30) {
        petals.splice(i, 1);
      }
    }

    animId = requestAnimationFrame(update);
  }

  function init() {
    resize();
    // Pré-remplir l'écran
    for (let i = 0; i < 45; i++) {
      const p = randomPetal();
      p.y = Math.random() * H;
      petals.push(p);
    }
    update();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    petals = [];
    init();
  });

  // Lancer quand DOM + images chargés
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
