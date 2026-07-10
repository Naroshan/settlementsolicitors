document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav (full-screen overlay menu)
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    // Inject a secondary "Call" CTA just before the primary CTA, once
    const cta = nav.querySelector('.nav-cta');
    if (cta && !nav.querySelector('.menu-call')) {
      const call = document.createElement('a');
      call.className = 'menu-call';
      call.href = 'tel:02030583365';
      call.textContent = 'Call 020 3058 3365';
      nav.insertBefore(call, cta);
    }
    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  // Sidebar enquiry card: soft-follow on scroll (same behaviour as /book/'s
  // booking summary). Eases toward a comfortable on-screen position instead
  // of snapping to a fixed offset. No-op on pages without this markup.
  (function followSidebarForm() {
    const aside = document.querySelector('.loc-layout > aside');
    const card = aside && aside.querySelector('.sidebar-form-card');
    if (!aside || !card) return;
    let current = 0, raf = null, lastTime = null;
    const HEADER_CLEARANCE = 96;
    const ANCHOR_RATIO = 0.38;
    const EASE_PER_FRAME = 0.12;

    const isDesktop = () => window.matchMedia('(min-width: 1025px)').matches;

    const targetOffset = () => {
      const asideTop = aside.getBoundingClientRect().top + window.scrollY;
      const maxOffset = Math.max(0, aside.offsetHeight - card.offsetHeight);
      const anchorInViewport = Math.max(HEADER_CLEARANCE, Math.min(
        window.innerHeight * ANCHOR_RATIO,
        window.innerHeight - card.offsetHeight - 24
      ));
      const desired = (window.scrollY + anchorInViewport) - asideTop;
      return Math.max(0, Math.min(desired, maxOffset));
    };

    const loop = (now) => {
      const dt = lastTime ? Math.min(now - lastTime, 48) : 16.67;
      lastTime = now;
      const frameFactor = 1 - Math.pow(1 - EASE_PER_FRAME, dt / 16.67);
      const t = targetOffset();
      current += (t - current) * frameFactor;
      if (Math.abs(t - current) > 0.4) {
        card.style.transform = `translateY(${current}px)`;
        raf = requestAnimationFrame(loop);
      } else {
        current = t;
        card.style.transform = `translateY(${current}px)`;
        raf = null;
        lastTime = null;
      }
    };

    const kick = () => {
      if (!isDesktop()) { card.style.transform = ''; if (raf) cancelAnimationFrame(raf); raf = null; return; }
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    kick();
  })();

  // Forms → Formspree
  document.querySelectorAll('form[data-formspree]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const orig = btn.innerHTML;
      btn.innerHTML = 'Sending…';
      btn.disabled = true;
      try {
        const res = await fetch('https://formspree.io/f/mojzlojd', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if (res.ok) {
          form.style.display = 'none';
          const s = form.nextElementSibling;
          if (s && s.classList.contains('form-success')) s.style.display = 'block';
        } else { throw new Error(); }
      } catch {
        alert('There was a problem. Please call us on 020 3058 3365.');
        btn.innerHTML = orig;
        btn.disabled = false;
      }
    });
  });
});
