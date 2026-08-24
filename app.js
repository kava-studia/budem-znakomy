const TELEGRAM_USERNAME = 'kava_studia';
const MAX_CONTACT_URL = 'https://max.ru/u/f9LHodD0cOID_dgF3S6fVV47t3D0pcOwjMiQ0IDe96OTvyfjs7u0MjRICI0';

const upcomingEvents = [
  {
    title: 'Black & Red',
    date: '27.08.2026',
    time: '20:20',
    poster: '/assets/poster_black_red.webp',
    description: 'Элегантный тематический вечер в чёрно-красном настроении. Живое общение, программа клуба и атмосфера, в которой повод заговорить уже создан.',
    venue: 'Гастробар на Ясной',
    address: 'ул. Ясная, 6А',
    price: '600 ₽ с картой клуба БЗ · 1000 ₽ без карты'
  }
];

const archiveEvents = [
  {
    title: 'Рисуем Блюз',
    date: '06.08.2026',
    time: '20:20',
    poster: '/assets/poster_art.jpg',
    label: 'арт-вечер'
  },
  {
    title: 'Роковый вечер',
    date: '13.08.2026',
    time: '20:20',
    poster: '/assets/poster_rock.jpg',
    label: 'музыкальный вечер'
  },
  {
    title: 'Побег в СССР!',
    date: '20.08.2026',
    time: '20:20',
    poster: '/assets/poster_ussr.png',
    label: 'квартирник для взрослых'
  }
];

const $ = (selector) => document.querySelector(selector);

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function eventMessage(event) {
  if (!event) {
    return 'Здравствуйте! Хочу узнать о ближайшем мероприятии взрослого клуба живого общения «Будем знакомы».';
  }

  return `Здравствуйте! Хочу принять участие в мероприятии «${event.title}» ${event.date} в ${event.time}. Подскажите, пожалуйста, детали.`;
}

function telegramLink(message) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
}

function renderEvents() {
  const grid = $('#eventsGrid');
  if (!grid) return;

  if (!upcomingEvents.length) {
    grid.innerHTML = `
      <article class="next-event-card">
        <div class="next-event-copy">
          <span class="eyebrow">Следующая встреча</span>
          <h3>Новый вечер уже готовится.</h3>
          <p>Мы не выкладываем событие, пока не утверждены тема, дата и афиша. Напиши нам — расскажем первым.</p>
        </div>
        <div class="next-event-actions">
          <a class="messenger-pill tg" data-direct-telegram target="_blank" rel="noopener">Telegram</a>
          <a class="messenger-pill mx" data-direct-max target="_blank" rel="noopener">MAX</a>
        </div>
      </article>`;
    bindDirectMessengerLinks();
bindImageLightbox();
    return;
  }

  grid.innerHTML = upcomingEvents.map((event, index) => `
    <article class="event-card event-card-featured">
      <figure class="event-poster"><img src="${esc(event.poster)}" alt="Афиша ${esc(event.title)}"></figure>
      <div class="event-body">
        <span class="event-kicker">Ближайшая встреча</span>
        <div class="event-date">${esc(event.date)} · ${esc(event.time)}</div>
        <h3>${esc(event.title)}</h3>
        <p>${esc(event.description || '')}</p>
        <div class="event-meta">${event.venue ? `<strong>${esc(event.venue)}</strong>` : ''}${event.address ? `<span>${esc(event.address)}</span>` : ''}</div>
        ${event.price ? `<div class="event-price">${esc(event.price)}</div>` : ''}
        <button class="button button-primary" data-event-index="${index}">Принять участие</button>
      </div>
    </article>`).join('');

  grid.querySelectorAll('[data-event-index]').forEach((button) => {
    button.addEventListener('click', () => openJoin(upcomingEvents[Number(button.dataset.eventIndex)]));
  });
}

function renderArchive() {
  const grid = $('#archiveGrid');
  if (!grid) return;

  grid.innerHTML = archiveEvents.map((event) => `
    <article class="archive-card">
      <figure class="poster-wrap">
        <img src="${esc(event.poster)}" alt="Афиша ${esc(event.title)}" loading="lazy">
      </figure>
      <div class="archive-info">
        <img class="card-mark" src="/assets/logo.png" alt="" aria-hidden="true">
        <div class="archive-meta"><span>${esc(event.date)}</span><span>${esc(event.time)}</span></div>
        <h3>${esc(event.title)}</h3>
        <p>${esc(event.label || '')}</p>
      </div>
    </article>`).join('');
}

async function copyMessage(message) {
  try {
    await navigator.clipboard.writeText(message);
    const status = $('#copyStatus');
    if (status) status.textContent = 'Сообщение скопировано';
    return true;
  } catch {
    const status = $('#copyStatus');
    if (status) status.textContent = 'Скопируйте сообщение вручную';
    return false;
  }
}

function openJoin(event = null) {
  const modal = $('#joinModal');
  if (!modal) return;

  const message = eventMessage(event);
  $('#modalTitle').textContent = event ? event.title : 'Будем знакомы';
  $('#messagePreview').textContent = message;
  $('#telegramButton').href = telegramLink(message);

  const maxButton = $('#maxButton');
  maxButton.hidden = false;
  maxButton.href = MAX_CONTACT_URL;
  maxButton.onclick = async () => { await copyMessage(message); };

  $('#copyStatus').textContent = '';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function openImageLightbox(image) {
  const lightbox = $('#imageLightbox');
  const lightboxImage = $('#imageLightboxImage');
  const caption = $('#imageLightboxCaption');
  if (!lightbox || !lightboxImage) return;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || '';
  if (caption) caption.textContent = image.alt || '';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeImageLightbox() {
  const lightbox = $('#imageLightbox');
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function bindImageLightbox() {
  document.querySelectorAll('.gallery-item img, .poster-wrap img, .event-poster img').forEach((image) => {
    image.closest('figure')?.classList.add('is-zoomable');
    image.closest('figure')?.setAttribute('tabindex', '0');
  });
}

function closeJoin() {
  const modal = $('#joinModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function bindGeneric() {
  document.querySelectorAll('[data-generic-join]').forEach((element) => {
    element.onclick = () => openJoin();
  });
}

function bindNextEvent() {
  document.querySelectorAll('[data-next-event-join]').forEach((element) => {
    element.onclick = () => openJoin(upcomingEvents[0] || null);
  });
}

function bindDirectMessengerLinks() {
  const message = eventMessage();
  document.querySelectorAll('[data-direct-telegram]').forEach((link) => {
    link.href = telegramLink(message);
  });
  document.querySelectorAll('[data-direct-max]').forEach((link) => {
    link.href = MAX_CONTACT_URL;
    link.addEventListener('click', async () => { await copyMessage(message); });
  });
}

$('#modalClose')?.addEventListener('click', closeJoin);
$('#imageLightboxClose')?.addEventListener('click', closeImageLightbox);
$('#imageLightbox')?.addEventListener('click', (event) => {
  if (event.target.id === 'imageLightbox') closeImageLightbox();
});
document.addEventListener('click', (event) => {
  const image = event.target.closest?.('.gallery-item img, .poster-wrap img, .event-poster img');
  if (image) openImageLightbox(image);
});
document.addEventListener('keydown', (event) => {
  const figure = event.target.closest?.('figure.is-zoomable');
  if (figure && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    const image = figure.querySelector('img');
    if (image) openImageLightbox(image);
  }
});
$('#joinModal')?.addEventListener('click', (event) => {
  if (event.target.id === 'joinModal') closeJoin();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeJoin();
    closeImageLightbox();
  }
});
$('#copyButton')?.addEventListener('click', async () => {
  await copyMessage($('#messagePreview').textContent);
});

renderEvents();
renderArchive();
bindGeneric();
bindNextEvent();
bindDirectMessengerLinks();
