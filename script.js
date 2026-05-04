'use strict';

/* ── Form ── */
const form        = document.getElementById('guestForm');
const formCard    = document.getElementById('formCard');
const formSuccess = document.getElementById('formSuccess');

const guestCountField     = document.getElementById('guestCountField');
const guestNamesContainer = document.getElementById('guestNamesContainer');
const counterDisplay      = document.getElementById('counterDisplay');
let guestCount = 2;

function updateGuestFields() {
  counterDisplay.textContent = guestCount;
  guestNamesContainer.innerHTML = '';
  for (let i = 2; i <= guestCount; i++) {
    const div = document.createElement('div');
    div.className = 'field-group';
    div.innerHTML = `<input type="text" name="guest${i}" placeholder="Гость ${i} — Имя, Фамилия">`;
    guestNamesContainer.appendChild(div);
  }
}

document.getElementById('counterMinus')?.addEventListener('click', () => {
  if (guestCount > 2) { guestCount--; updateGuestFields(); }
});
document.getElementById('counterPlus')?.addEventListener('click', () => {
  if (guestCount < 10) { guestCount++; updateGuestFields(); }
});

document.querySelectorAll('input[name="attendance"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const isGroup = radio.value === 'group';
    guestCountField.style.display     = isGroup ? 'block' : 'none';
    guestNamesContainer.style.display = isGroup ? 'block' : 'none';
    if (isGroup) updateGuestFields();
    else { guestCount = 2; guestNamesContainer.innerHTML = ''; }
  });
});

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz5z5NHbuplTqn6-QjG6ZTuiTR8MGvx-ZXxhqs5dihSoq9py71REUBpAfWhN9LKFr-O/exec';

/* ── Form submit ── */
form && form.addEventListener('submit', async e => {
  e.preventDefault();

  const name       = form.querySelector('input[name="name"]').value.trim();
  const attendance = form.querySelector('input[name="attendance"]:checked');

  if (!name) {
    form.querySelector('input[name="name"]').focus();
    return;
  }
  if (!attendance) {
    form.querySelector('.field-label').style.color = '#c0392b';
    setTimeout(() => { form.querySelector('.field-label').style.color = ''; }, 2000);
    return;
  }

  const guests = [];
  if (attendance.value === 'group') {
    form.querySelectorAll('[name^="guest"]').forEach(input => {
      if (input.value.trim()) guests.push(input.value.trim());
    });
  }

  const btn = form.querySelector('.btn-submit');
  btn.disabled = true;
  btn.textContent = '...';

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        attendance: attendance.value,
        guestCount: attendance.value === 'group' ? guestCount : 1,
        guestNames: guests.join(', ')
      })
    });
  } catch (_) {}

  formCard.style.display    = 'none';
  formSuccess.style.display = 'flex';
});

/* ── Subtle entrance animations on scroll ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.invitation, .venue, .timeline, .dresscode, .contact, .form-section, .gallery'
).forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(24px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.visible, .hero').forEach(el => {
    el.style.opacity   = '1';
    el.style.transform = 'none';
  });
});

/* Make sections visible when intersecting */
const style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: none !important; }';
document.head.appendChild(style);

/* ── Dresscode carousel ── */
const dcSlides = document.querySelectorAll('.dc-slide');
const dcDots   = document.querySelectorAll('.dc-dot');
const dcTrack  = document.querySelector('.dc-track');
let dcCurrent  = 0;

function dcW() { return dcTrack ? dcTrack.parentElement.offsetWidth : 0; }

function dcGoTo(n) {
  if (!dcSlides.length) return;
  dcSlides[dcCurrent].classList.remove('active');
  dcDots[dcCurrent].classList.remove('active');
  dcCurrent = (n + dcSlides.length) % dcSlides.length;
  dcSlides[dcCurrent].classList.add('active');
  dcDots[dcCurrent].classList.add('active');
  if (dcTrack) dcTrack.style.transform = `translateX(${-dcCurrent * dcW()}px)`;
}

document.querySelector('.dc-arrow--prev')?.addEventListener('click', () => dcGoTo(dcCurrent - 1));
document.querySelector('.dc-arrow--next')?.addEventListener('click', () => dcGoTo(dcCurrent + 1));
document.querySelector('.dc-tap--prev')?.addEventListener('click',  () => dcGoTo(dcCurrent - 1));
document.querySelector('.dc-tap--next')?.addEventListener('click',  () => dcGoTo(dcCurrent + 1));
dcDots.forEach((dot, i) => dot.addEventListener('click', () => dcGoTo(i)));

/* ── Swipe with live animation ── */
const dcCarousel = dcTrack ? dcTrack.parentElement : null;
if (dcCarousel) {
  let startX = 0, startY = 0, isHoriz = null, baseX = 0;

  dcCarousel.addEventListener('touchstart', e => {
    const m = new DOMMatrix(window.getComputedStyle(dcTrack).transform);
    baseX   = isFinite(m.m41) ? m.m41 : -dcCurrent * dcW();
    startX  = e.touches[0].clientX;
    startY  = e.touches[0].clientY;
    isHoriz = null;
    dcTrack.style.transition = 'none';
  }, { passive: true });

  dcCarousel.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (isHoriz === null) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      isHoriz = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHoriz) return;
    e.preventDefault();
    const w   = dcW();
    const min = -(dcSlides.length - 1) * w;
    const pos = Math.max(min, Math.min(0, baseX + dx));
    dcTrack.style.transform = `translateX(${pos}px)`;
  }, { passive: false });

  dcCarousel.addEventListener('touchend', e => {
    dcTrack.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    const diff = startX - e.changedTouches[0].clientX;
    if (isHoriz && Math.abs(diff) > 25) dcGoTo(dcCurrent + (diff > 0 ? 1 : -1));
    else dcGoTo(dcCurrent);
  }, { passive: true });
}
