// Landing page scroll animations & interactions

document.addEventListener('DOMContentLoaded', () => {
  // Navbar blur on scroll
  const nav = document.querySelector('.landing-nav');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Scroll reveal with stagger
  const observerOptions = {
    root: null,
    rootMargin: '-80px 0px',
    threshold: 0.05
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter(c => c.matches('[data-reveal]'));
        const index = siblings.indexOf(el);
        const delay = index * 0.1;
        
        el.style.transitionDelay = `${delay}s`;
        el.classList.remove('hidden');
        
        observer.unobserve(el);
      }
    });
  }, observerOptions);

  // Hide elements initially (but not if already in viewport)
  document.querySelectorAll('[data-reveal]').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      el.classList.add('hidden');
    }
    observer.observe(el);
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
