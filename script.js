const preloader = document.querySelector('.preloader');
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxClose = document.querySelector('.lightbox-close');

window.addEventListener('load', () => {
  setTimeout(() => preloader.classList.add('hidden'), 450);
});

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 90);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('no-scroll', open);
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => {
    lightboxImage.src = item.dataset.image;
    lightbox.classList.add('open');
    document.body.classList.add('no-scroll');
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxImage.src = '';
  document.body.classList.remove('no-scroll');
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});

document.getElementById('year').textContent = new Date().getFullYear();
