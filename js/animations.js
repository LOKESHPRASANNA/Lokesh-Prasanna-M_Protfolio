/* ============================================================
   ANIMATIONS JS — IntersectionObserver, Tilt, Progress Bars
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initProgressBars();
  initTiltCards();
  initCursorGlow();
  initMouseParallax();
  initGalleryModal();
});

/* ── Scroll Reveal ────────────────────────────────────────── */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // For stagger-children
        if (entry.target.classList.contains('stagger-children')) {
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            child.style.transitionDelay = `${i * 80}ms`;
            child.classList.add('revealed');
          });
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px'
  });

  revealEls.forEach(el => observer.observe(el));

  // Stagger parent observer
  const staggerEls = document.querySelectorAll('.stagger-children');
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.children;
        Array.from(children).forEach((child, i) => {
          child.style.opacity = '0';
          child.style.transform = 'translateY(24px)';
          child.style.transition = `opacity 0.6s ease ${i * 90}ms, transform 0.6s ease ${i * 90}ms`;
          setTimeout(() => {
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          }, 50);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  staggerEls.forEach(el => staggerObserver.observe(el));
}

/* ── Progress Bars ────────────────────────────────────────── */
function initProgressBars() {
  const fills = document.querySelectorAll('.progress-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const width = fill.dataset.width || '70%';
        setTimeout(() => { fill.style.width = width; }, 150);
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(fill => observer.observe(fill));
}

/* ── Card Tilt ────────────────────────────────────────────── */
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const tiltX = dy * -8;
      const tiltY = dx * 8;
      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
      card.style.transition = 'transform 0.1s ease';

      // Shine effect
      const shine = card.querySelector('.card-shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${(dx + 1) / 2 * 100}% ${(dy + 1) / 2 * 100}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  });
}

/* ── Cursor Glow ──────────────────────────────────────────── */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    currentX = lerp(currentX, targetX, 0.08);
    currentY = lerp(currentY, targetY, 0.08);
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(animate);
  }

  animate();
}

/* ── Mouse Parallax (Hero) ────────────────────────────────── */
function initMouseParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const floatingCards = hero.querySelectorAll('.floating-card');
  const blobs = hero.querySelectorAll('.blob');

  document.addEventListener('mousemove', e => {
    if (!isInViewport(hero)) return;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    floatingCards.forEach((card, i) => {
      const factor = (i + 1) * 6;
      card.style.transform = `translateY(${-factor * dy}px) translateX(${factor * dx}px)`;
    });

    blobs.forEach((blob, i) => {
      const factor = (i + 1) * 12;
      const baseTranslate = blob.style.transform.includes('translate') ? '' : '';
      blob.style.transform = `translate(${factor * dx}px, ${factor * dy}px)`;
    });
  });
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

/* ── Gallery Modal ────────────────────────────────────────── */
function initGalleryModal() {
  // Create modal element
  const modal = document.createElement('div');
  modal.id = 'gallery-modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <button class="modal-close" id="modal-close">✕</button>
      <div class="modal-body" id="modal-body"></div>
    </div>
  `;
  modal.style.cssText = `
    display: none; position: fixed; inset: 0; z-index: 9999;
    align-items: center; justify-content: center;
  `;
  document.body.appendChild(modal);

  // Modal styles
  const style = document.createElement('style');
  style.textContent = `
    #gallery-modal { display: none; }
    #gallery-modal.open { display: flex !important; }
    #gallery-modal .modal-backdrop {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
    }
    #gallery-modal .modal-content {
      position: relative; z-index: 1;
      background: var(--bg-primary);
      border-radius: 24px;
      padding: 40px;
      max-width: 560px; width: 90%;
      max-height: 85vh; overflow-y: auto;
      box-shadow: 0 32px 80px rgba(0,0,0,0.4);
      animation: scaleIn 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    #gallery-modal .modal-close {
      position: absolute; top: 16px; right: 16px;
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--bg-secondary);
      border: 1px solid var(--border-light);
      font-size: 1rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; color: var(--text-secondary);
    }
    #gallery-modal .modal-close:hover {
      background: rgba(239,68,68,0.1); color: #ef4444;
    }
    #gallery-modal .modal-title {
      font-family: var(--font-display); font-size: 1.5rem;
      font-weight: 700; color: var(--text-primary);
      margin-bottom: 8px;
    }
    #gallery-modal .modal-cat {
      font-size: 0.8125rem; color: var(--primary);
      font-weight: 600; margin-bottom: 16px;
      text-transform: uppercase; letter-spacing: 0.08em;
    }
    #gallery-modal .modal-thumb {
      width: 100%; aspect-ratio: 16/9;
      border-radius: 16px; overflow: hidden;
      margin-bottom: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 5rem;
    }
    #gallery-modal .modal-desc {
      font-size: 0.9375rem; color: var(--text-secondary);
      line-height: 1.75;
    }
  `;
  document.head.appendChild(style);

  // Attach click handlers
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const title = item.dataset.title || 'Design Work';
      const cat = item.dataset.category || 'Portfolio';
      const emoji = item.querySelector('.gallery-thumb').textContent.trim();
      const bg = item.querySelector('.gallery-thumb').style.background || item.querySelector('.gallery-thumb').className;
      const desc = item.dataset.desc || 'A carefully crafted design piece focusing on user experience, visual hierarchy, and aesthetic appeal. This work demonstrates proficiency in design principles, typography, and color theory.';

      document.getElementById('modal-body').innerHTML = `
        <div class="modal-cat">${cat}</div>
        <div class="modal-title">${title}</div>
        <div class="modal-thumb" style="background: var(--grad-hero);">${emoji}</div>
        <div class="modal-desc">${desc}</div>
      `;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ── Animated gradient hero title ────────────────────────── */
window.addEventListener('load', () => {
  // Hero badge pop
  const badge = document.querySelector('.hero-badge');
  if (badge) {
    badge.style.animation = 'bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both';
  }
});
