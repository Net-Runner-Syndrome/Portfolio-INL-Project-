/* ============================================================
   REASON SITHOLE PORTFOLIO — script.js
   Vanilla JS: particles, parallax, scroll reveals, carousels
   ============================================================ */

'use strict';

/* ── 1. NAV SCROLL BEHAVIOUR ─────────────────────────────── */
(function initNav() {
  const nav  = document.getElementById('nav');
  const ham  = document.getElementById('hamburger');
  const links = nav.querySelector('.nav__links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  ham.addEventListener('click', () => {
    links.classList.toggle('open');
    ham.setAttribute('aria-expanded', links.classList.contains('open'));
  });

  // close mobile nav on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
})();


/* ── 2. PARTICLE CANVAS ──────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initParticleSet();
  }

  function initParticleSet() {
    const count = Math.min(Math.floor(W * H / 14000), 80);
    particles = Array.from({ length: count }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - .5) * .25,
      vy: (Math.random() - .5) * .25,
      r:  Math.random() * 1.8 + .4,
      a:  Math.random() * .6 + .2
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(245,166,35,${(1 - d / 120) * 0.12})`;
          ctx.lineWidth = .6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
    });
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
  }

  let raf;
  function loop() {
    update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  // Start only if hero is visible
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { loop(); }
      else { cancelAnimationFrame(raf); }
    });
  });
  observer.observe(canvas.closest('.hero'));

  window.addEventListener('resize', resize, { passive: true });
  resize();
})();


/* ── 3. PARALLAX (mouse + scroll) ────────────────────────── */
(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  let mouseX = 0, mouseY = 0;
  let cx = 0, cy = 0; // current (smoothed)

  hero.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - .5) * 2;
    mouseY = (e.clientY / window.innerHeight - .5) * 2;
  });

  const targets = hero.querySelectorAll('[data-parallax]');

  function tick() {
    cx += (mouseX - cx) * .06;
    cy += (mouseY - cy) * .06;

    targets.forEach(el => {
      const f = parseFloat(el.dataset.parallax);
      el.style.transform = `translate(${cx * f * 60}px, ${cy * f * 40}px)`;
    });

    requestAnimationFrame(tick);
  }
  tick();
})();


/* ── 4. SCROLL-TRIGGERED REVEAL (Intersection Observer) ─── */
(function initScrollReveal() {
  const els = document.querySelectorAll('.scroll-reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target); // fire once
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => io.observe(el));
})();


/* ── 5. GALLERY CAROUSEL ─────────────────────────────────── */
(function initGallery() {
  const track = document.getElementById('galleryTrack');
  const dots  = document.querySelectorAll('.g-dot');
  const prev  = document.getElementById('galleryPrev');
  const next  = document.getElementById('galleryNext');
  if (!track) return;

  let current = 0;
  const slides = track.querySelectorAll('.gallery__slide');
  const total  = slides.length;

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.index)));

  // Auto-advance
  setInterval(() => goTo(current + 1), 5000);
})();


/* ── 6. TESTIMONIALS CAROUSEL ────────────────────────────── */
(function initTestimonials() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots   = document.querySelectorAll('.t-dot');
  if (!slides.length) return;

  let current = 0;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = ((idx % slides.length) + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.index)));

  // Auto-rotate every 6 s
  setInterval(() => goTo(current + 1), 6000);
})();


/* ── 7. CONTACT FORM — custom dropdown ───────────────────── */
(function initPositionDropdown() {
  const wrap   = document.getElementById('positionWrap');
  const input  = document.getElementById('positionInput');
  const dd     = document.getElementById('positionDropdown');
  if (!wrap) return;

  input.addEventListener('click', () => dd.classList.toggle('open'));

  dd.querySelectorAll('.form-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const val = item.dataset.value;
      input.value = val || '';
      input.placeholder = val ? '' : 'Position';
      dd.classList.remove('open');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', e => {
    if (!wrap.contains(e.target)) dd.classList.remove('open');
  });
})();


/* ── 8. CONTACT FORM — send button ──────────────────────── */
(function initSendButton() {
  const btn = document.getElementById('sendBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Basic visual feedback — replace with real submission logic
    const original = btn.textContent;
    btn.textContent = 'Sent ✓';
    btn.style.background = '#2a7a40';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
    }, 2500);
  });
})();


/* ── 9. SMOOTH ACTIVE NAV LINK (Intersection Observer) ──── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === '#' + e.target.id
            ? 'var(--orange)'
            : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();


/* ── 10. ASTRONAUT ORBIT RING RESPONSIVENESS ─────────────── */
(function resizeOrbit() {
  function adjust() {
    const orb = document.querySelector('.hero__orbit');
    if (!orb) return;
    const vw = window.innerWidth;
    if (vw < 600) {
      orb.style.display = 'none';
    } else {
      orb.style.display = '';
    }
  }
  window.addEventListener('resize', adjust, { passive: true });
  adjust();
})();


/* ── 11. STAGGERED CARD ENTRANCE (one-time on load) ─────── */
(function staggerCards() {
  // Immediately show elements above the fold
  document.querySelectorAll('.scroll-reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      // slight delay so CSS transition plays
      setTimeout(() => el.classList.add('visible'), 100);
    }
  });
})();


/* ── 12. TIMELINE BUTTON EXPAND ──────────────────────────── */
(function initTimeline() {
  document.querySelectorAll('.tl-item__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.tl-item');
      const text = item.querySelector('.tl-item__text');
      if (text) {
        text.style.maxHeight = text.style.maxHeight ? '' : '200px';
        btn.textContent = text.style.maxHeight ? '✕' : '→';
      }
    });
  });
})();
