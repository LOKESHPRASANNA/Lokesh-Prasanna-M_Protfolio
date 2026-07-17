/* ============================================================
   PARTICLES JS — Hero Floating Elements, Mouse Trail
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initMouseTrail();
});

/* ── Hero Canvas — Subtle floating particles ──────────────── */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = canvas.width = canvas.offsetWidth;
  let H = canvas.height = canvas.offsetHeight;

  const particles = [];
  const NUM = 40;

  const colors = [
    'rgba(99, 102, 241, 0.4)',
    'rgba(139, 92, 246, 0.35)',
    'rgba(6, 182, 212, 0.35)',
    'rgba(244, 114, 182, 0.2)',
  ];

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.size = Math.random() * 3 + 1;
      this.speed = Math.random() * 0.5 + 0.2;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = Math.random() * 0.6 + 0.2;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.02 + 0.01;
      this.wobbleAmp = Math.random() * 1.5;
    }

    update() {
      this.y -= this.speed;
      this.wobble += this.wobbleSpeed;
      this.x += Math.sin(this.wobble) * this.wobbleAmp * 0.3;
      if (this.y < -10) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Connection lines between nearby particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.save();
          ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  for (let i = 0; i < NUM; i++) particles.push(new Particle());

  let animId;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  });

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else animate();
  });
}

/* ── Mouse Trail ──────────────────────────────────────────── */
function initMouseTrail() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const trail = [];
  const MAX_TRAIL = 8;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      left: ${x}px; top: ${y}px;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: rgba(99,102,241,0.4);
      pointer-events: none;
      transform: translate(-50%,-50%);
      transition: all 0.6s ease;
      z-index: 1;
    `;
    hero.appendChild(dot);
    trail.push(dot);

    if (trail.length > MAX_TRAIL) {
      const old = trail.shift();
      old.style.opacity = '0';
      old.style.transform = 'translate(-50%,-50%) scale(0)';
      setTimeout(() => old.remove(), 600);
    }

    // Fade out
    setTimeout(() => {
      dot.style.opacity = '0';
      dot.style.transform = 'translate(-50%,-50%) scale(0)';
    }, 200);
    setTimeout(() => dot.remove(), 800);
  });
}
