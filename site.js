const dialog = document.querySelector('#preview-dialog');
const content = document.querySelector('#dialog-content');
function preview(title, lines) {
  document.querySelector('#dialog-title').textContent = title;
  content.replaceChildren(...lines.map(text => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  }));
  dialog.showModal();
}
const giftForm = document.querySelector('.donation-box form');
const amountInput = giftForm.querySelector('[type=number]');
document.querySelectorAll('[data-amount]').forEach(button => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    amountInput.value = button.dataset.amount.replace('$', '');
    document.querySelectorAll('[data-amount]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  });
});
amountInput.addEventListener('input', () => {
  document.querySelectorAll('[data-amount]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.amount.slice(1)) === Number(amountInput.value))));
});
giftForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!giftForm.reportValidity()) return;
  preview('Your sample gift', [`You selected $${Number(amountInput.value).toFixed(2)} USD.`, 'This is a demonstration, not a donation or pledge. Contact the foundation through its official Instagram to discuss supporting its work.']);
});
const bag = new Map();
document.querySelectorAll('.product-grid article').forEach(card => {
  const name = card.querySelector('h3').textContent;
  const price = Number(card.querySelector('footer b').textContent.slice(1));
  card.querySelector('button').addEventListener('click', () => {
    const item = bag.get(name) || { price, quantity: 0 };
    item.quantity++;
    document.querySelector(".demo-bag").hidden = false;
    bag.set(name, item);
    document.querySelector('#bag-count').textContent = [...bag.values()].reduce((n, i) => n + i.quantity, 0);
    document.querySelector('#bag-total').textContent = [...bag.values()].reduce((n, i) => n + i.price * i.quantity, 0);
    card.querySelector('button').textContent = `Added (${item.quantity})`;
  });
});
document.querySelector('#review-bag').addEventListener('click', () => {
  preview('Your demo bag', bag.size ? [...bag].map(([name, item]) => `${item.quantity} × ${name} — $${item.price * item.quantity}`) : ['Your demo bag is empty. Explore the proposed collection above.']);
});

// Compact navigation progressively enhances the always-accessible link list.
const menuButton = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-navigation');
menuButton.hidden = false;
document.documentElement.classList.add('nav-enhanced');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  primaryNav.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  primaryNav.classList.toggle('is-open', expanded);
});
primaryNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});

// Source links remain independent from this keyboard-accessible photo viewer.
const photoDialog = document.querySelector('#photo-dialog');
const gallery = [...document.querySelectorAll('.social-card')];
let photoIndex = 0;
let photoTrigger = null;
function showPhoto(index) {
  photoIndex = (index + gallery.length) % gallery.length;
  const card = gallery[photoIndex];
  const original = card.querySelector('img');
  const full = document.querySelector('#photo-full');
  full.src = original.getAttribute('src');
  full.alt = original.alt;
  document.querySelector('#photo-title').textContent = card.querySelector('h3').textContent;
  document.querySelector('#photo-original').href = card.querySelector('.photo-source').href;
  document.querySelector('#photo-count').textContent = `${photoIndex + 1} / ${gallery.length}`;
}
gallery.forEach((card, index) => {
  const button = card.querySelector('.photo-open');
  button.hidden = false;
  button.addEventListener('click', () => {
    photoTrigger = button;
    showPhoto(index);
    photoDialog.showModal();
    document.body.classList.add('photo-viewing');
    document.querySelector('#photo-close').focus();
  });
});
document.querySelector('#photo-close').addEventListener('click', () => photoDialog.close());
document.querySelector('#photo-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
document.querySelector('#photo-next').addEventListener('click', () => showPhoto(photoIndex + 1));
photoDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
photoDialog.addEventListener('close', () => {
  document.body.classList.remove('photo-viewing');
  photoTrigger?.focus();
});
photoDialog.addEventListener('click', event => {
  const box = photoDialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) photoDialog.close();
});
// Reset mobile navigation when returning to a wide viewport.
window.matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);
