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

/* =====================================================
   PRIX & PANIER (ajout) — tout ce qui suit est nouveau
   ===================================================== */
(function () {
  'use strict';

  /* ---------- RÉGLAGES À MODIFIER ICI ---------- */
  const CONFIG = {
    // Collez ici votre "Client ID" PayPal (mode Live). Tant que ce champ est vide,
    // le panier propose uniquement la commande par e-mail.
    paypalClientId: '',

    currency: 'EUR',

    // Frais de livraison en CENTIMES (590 = 5,90 €). 0 = livraison offerte.
    shippingFlat: 590,

    // Livraison offerte à partir de ce montant d'achat (produits, hors livraison),
    // en CENTIMES (5000 = 50 €). 0 = désactivé.
    freeShippingFrom: 5000,

    // Commande minimum (produits, hors livraison), en CENTIMES (2000 = 20 €). 0 = pas de minimum.
    minOrder: 2000,

    orderEmail: 'vanilleroyalemada@gmail.com',
    storageKey: 'vanilleRoyaleCart'
  };
  /* --------------------------------------------- */

  const drawer = document.getElementById('panier');
  if (!drawer) return;

  const overlay = document.querySelector('.cart-overlay');
  const fab = document.querySelector('.cart-fab');
  const closeBtn = drawer.querySelector('.cart-close');
  const messageEl = drawer.querySelector('.cart-message');
  const emptyEl = drawer.querySelector('.cart-empty');
  const itemsEl = drawer.querySelector('.cart-items');
  const footEl = drawer.querySelector('.cart-foot');
  const subtotalEl = drawer.querySelector('.cart-subtotal');
  const shippingEl = drawer.querySelector('.cart-shipping');
  const totalEl = drawer.querySelector('.cart-total-value');
  const mailBtn = drawer.querySelector('.cart-mail');
  const clearBtn = drawer.querySelector('.cart-clear');
  const noteEl = drawer.querySelector('.cart-note');
  const payEl = document.getElementById('paypal-buttons');

  /* ---------- Catalogue lu depuis la page (index.html) ---------- */
  const catalog = {};
  document.querySelectorAll('.product-buy').forEach((box) => {
    box.querySelectorAll('option').forEach((opt) => {
      catalog[box.dataset.product + '-' + opt.value] = {
        name: box.dataset.name,
        label: opt.dataset.label,
        price: Number(opt.dataset.price) // en centimes
      };
    });
  });

  /* ---------- Outils ---------- */
  const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: CONFIG.currency });
  const fmt = (cents) => money.format(cents / 100);
  const fmtPlain = (cents) => fmt(cents).replace(/[  ]/g, ' ');
  const toDecimal = (cents) => (cents / 100).toFixed(2);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function shippingCost(subtotal) {
    if (!subtotal) return 0;
    if (CONFIG.freeShippingFrom && subtotal >= CONFIG.freeShippingFrom) return 0;
    return CONFIG.shippingFlat;
  }

  /* ---------- État du panier (mémorisé sur l'appareil) ---------- */
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw
        .filter((i) => i && catalog[i.id] && Number.isInteger(i.qty) && i.qty > 0)
        .map((i) => ({ id: i.id, qty: Math.min(i.qty, 99) }));
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(cart));
    } catch (e) { /* stockage indisponible : le panier reste valable pour cette visite */ }
  }

  let cart = load();

  function totals() {
    const subtotal = cart.reduce((sum, i) => sum + catalog[i.id].price * i.qty, 0);
    const shipping = shippingCost(subtotal);
    return { subtotal, shipping, total: subtotal + shipping };
  }

  function addItem(id) {
    if (!catalog[id]) return;
    const existing = cart.find((i) => i.id === id);
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, 99);
    } else {
      cart.push({ id: id, qty: 1 });
    }
    save();
    clearMessage();
    render();
    if (fab) {
      fab.classList.remove('bump');
      void fab.offsetWidth;
      fab.classList.add('bump');
    }
  }

  function changeQty(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeItem(id);
      return;
    }
    item.qty = Math.min(item.qty, 99);
    save();
    render();
  }

  function removeItem(id) {
    cart = cart.filter((i) => i.id !== id);
    save();
    render();
  }

  /* ---------- Messages ---------- */
  function showMessage(text, isError) {
    messageEl.textContent = text;
    messageEl.classList.toggle('error', Boolean(isError));
    messageEl.hidden = false;
  }

  function clearMessage() {
    messageEl.hidden = true;
    messageEl.textContent = '';
  }

  /* ---------- Commande par e-mail ---------- */
  function orderMailto() {
    const t = totals();
    const lines = cart.map((i) => {
      const p = catalog[i.id];
      return '- ' + i.qty + ' x ' + p.name + ' (' + p.label + ') : ' + fmtPlain(p.price * i.qty);
    });
    const body = [
      'Bonjour,',
      '',
      'Je souhaite commander :',
      ...lines,
      '',
      'Sous-total : ' + fmtPlain(t.subtotal),
      'Livraison : ' + (t.shipping ? fmtPlain(t.shipping) : 'offerte'),
      'Total : ' + fmtPlain(t.total),
      '',
      'Nom :',
      'Adresse de livraison (France métropolitaine) :',
      'Téléphone :'
    ].join('\r\n');
    return 'mailto:' + CONFIG.orderEmail +
      '?subject=' + encodeURIComponent('Commande VANILLE ROYALE') +
      '&body=' + encodeURIComponent(body);
  }

  /* ---------- Affichage ---------- */
  // Message "commande minimum", créé ici et inséré juste avant la note de livraison.
  const minEl = el('p', 'cart-message');
  minEl.hidden = true;
  noteEl.before(minEl);

  function render() {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    const t = totals();

    document.querySelectorAll('[data-cart-count]').forEach((node) => {
      node.textContent = String(count);
      node.classList.toggle('is-empty', count === 0);
    });

    emptyEl.hidden = count > 0;
    footEl.hidden = count === 0;

    itemsEl.textContent = '';
    cart.forEach((item) => {
      const p = catalog[item.id];

      const li = el('li', 'cart-item');

      const info = el('div');
      info.append(el('p', 'cart-item-name', p.name), el('p', 'cart-item-label', p.label));

      const lineTotal = el('strong', 'cart-item-total', fmt(p.price * item.qty));

      const qty = el('div', 'cart-qty');
      const minus = el('button', '', '−');
      minus.type = 'button';
      minus.setAttribute('aria-label', 'Diminuer la quantité');
      minus.addEventListener('click', () => changeQty(item.id, -1));
      const num = el('span', '', String(item.qty));
      const plus = el('button', '', '+');
      plus.type = 'button';
      plus.setAttribute('aria-label', 'Augmenter la quantité');
      plus.addEventListener('click', () => changeQty(item.id, 1));
      qty.append(minus, num, plus);

      const remove = el('button', 'cart-remove', 'Retirer');
      remove.type = 'button';
      remove.addEventListener('click', () => removeItem(item.id));

      li.append(info, lineTotal, qty, remove);
      itemsEl.append(li);
    });

    subtotalEl.textContent = fmt(t.subtotal);
    shippingEl.textContent = t.shipping ? fmt(t.shipping) : 'Offerte';
    totalEl.textContent = fmt(t.total);

    // Commande minimum : tant qu'il n'est pas atteint, on masque le paiement et la commande par e-mail.
    const missing = Math.max(0, CONFIG.minOrder - t.subtotal);
    const canOrder = count > 0 && missing === 0;

    minEl.hidden = !(count > 0 && missing > 0);
    if (!minEl.hidden) {
      minEl.textContent = 'Commande minimum : ' + fmt(CONFIG.minOrder) +
        ' (hors livraison). Il vous manque ' + fmt(missing) + ' pour pouvoir commander.';
    }

    const notes = [];
    if (CONFIG.shippingFlat && CONFIG.freeShippingFrom) {
      notes.push(t.subtotal >= CONFIG.freeShippingFrom
        ? 'Livraison offerte.'
        : 'Livraison offerte dès ' + fmt(CONFIG.freeShippingFrom) + ' d’achat : plus que ' +
          fmt(CONFIG.freeShippingFrom - t.subtotal) + '.');
    }
    notes.push('Livraison exclusivement en France métropolitaine.');
    noteEl.textContent = notes.join(' ');

    payEl.hidden = !canOrder;
    mailBtn.hidden = !canOrder;

    if (canOrder) {
      mailBtn.href = orderMailto();
      mailBtn.textContent = CONFIG.paypalClientId ? 'Ou commander par e-mail' : 'Commander par e-mail';
      mailBtn.classList.toggle('btn-gold', !CONFIG.paypalClientId);
      if (drawer.classList.contains('open')) setupPayPal();
    }
  }

  /* ---------- Ouverture / fermeture ---------- */
  let lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    closeBtn.focus();
    setupPayPal();
  }

  function closeCart() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  document.querySelectorAll('[data-open-cart]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      openCart();
    });
  });
  closeBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('open')) closeCart();
  });
  clearBtn.addEventListener('click', () => {
    cart = [];
    save();
    render();
  });

  /* ---------- Cartes produit : prix selon le conditionnement ---------- */
  document.querySelectorAll('.product-buy').forEach((box) => {
    const select = box.querySelector('.product-format');
    const price = box.querySelector('.product-price');
    const addBtn = box.querySelector('.add-to-cart');

    const updatePrice = () => {
      const opt = select.options[select.selectedIndex];
      price.textContent = fmt(Number(opt.dataset.price));
    };
    select.addEventListener('change', updatePrice);
    updatePrice();

    addBtn.addEventListener('click', () => {
      addItem(box.dataset.product + '-' + select.value);
      openCart();
    });
  });

  /* ---------- Paiement PayPal ---------- */
  let paypalState = 'idle'; // idle | loading | ready | failed

  function setupPayPal() {
    if (!CONFIG.paypalClientId || !cart.length) return;
    if (totals().subtotal < CONFIG.minOrder) return;
    if (paypalState === 'loading' || paypalState === 'ready' || paypalState === 'failed') return;

    if (window.paypal && window.paypal.Buttons) {
      renderPayPal();
      return;
    }

    paypalState = 'loading';
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(CONFIG.paypalClientId) +
      '&currency=' + CONFIG.currency + '&locale=fr_FR&components=buttons';
    script.onload = renderPayPal;
    script.onerror = () => {
      paypalState = 'failed';
      showMessage('Le paiement PayPal est momentanément indisponible. Vous pouvez commander par e-mail.', true);
    };
    document.head.appendChild(script);
  }

  function renderPayPal() {
    if (!window.paypal || !window.paypal.Buttons) {
      paypalState = 'failed';
      return;
    }
    paypalState = 'ready';

    window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'pill', color: 'gold', label: 'pay' },

      onClick: (data, actions) => {
        if (!cart.length || totals().subtotal < CONFIG.minOrder) return actions.reject();
        clearMessage();
        return actions.resolve();
      },

      createOrder: (data, actions) => {
        const t = totals();
        const cur = CONFIG.currency;
        return actions.order.create({
          purchase_units: [{
            description: 'Commande VANILLE ROYALE',
            amount: {
              currency_code: cur,
              value: toDecimal(t.total),
              breakdown: {
                item_total: { currency_code: cur, value: toDecimal(t.subtotal) },
                shipping: { currency_code: cur, value: toDecimal(t.shipping) }
              }
            },
            items: cart.map((i) => {
              const p = catalog[i.id];
              return {
                name: (p.name + ' - ' + p.label).slice(0, 127),
                unit_amount: { currency_code: cur, value: toDecimal(p.price) },
                quantity: String(i.qty),
                category: 'PHYSICAL_GOODS'
              };
            })
          }],
          application_context: {
            brand_name: 'VANILLE ROYALE',
            shipping_preference: 'GET_FROM_FILE',
            user_action: 'PAY_NOW'
          }
        });
      },

      // Livraison en France métropolitaine uniquement : on refuse les autres pays.
      onShippingChange: (data, actions) => {
        const country =
          (data && data.shipping_address && data.shipping_address.country_code) ||
          (data && data.shippingAddress && data.shippingAddress.countryCode);
        if (country && country !== 'FR') return actions.reject();
      },

      onApprove: (data, actions) => {
        return actions.order.capture().then((details) => {
          const given = details && details.payer && details.payer.name && details.payer.name.given_name;
          cart = [];
          save();
          render();
          showMessage('Merci' + (given ? ' ' + given : '') +
            ' ! Votre paiement est confirmé. PayPal vous envoie un e-mail de confirmation et nous préparons votre commande.');
        });
      },

      onCancel: () => {
        showMessage('Paiement annulé. Votre panier est conservé.');
      },

      onError: () => {
        showMessage('Une erreur est survenue avec PayPal. Réessayez ou commandez par e-mail.', true);
      }
    }).render('#paypal-buttons');
  }

  render();
})();
