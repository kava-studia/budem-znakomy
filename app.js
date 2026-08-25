const TELEGRAM_USERNAME = 'kava_studia';
const MAX_CONTACT_URL = 'https://max.ru/u/f9LHodD0cOID_dgF3S6fVV47t3D0pcOwjMiQ0IDe96OTvyfjs7u0MjRICI0';

const upcomingEvents = [
  {
    id: 'black-red',
    title: 'Black & Red',
    date: '27.08.2026',
    isoDate: '2026-08-27',
    time: '20:20',
    poster: '/assets/poster_black_red.webp',
    description: 'Тематический вечер в чёрно-красном настроении. Живое общение, программа клуба и атмосфера, где повод заговорить уже создан.',
    venue: 'Гастробар на Ясной',
    address: 'ул. Ясная, 6А',
    price: '600 ₽ с картой клуба БЗ · 1000 ₽ без карты',
    status: 'open'
  },
  {
    id: 'shufutinov-day',
    title: 'Шуфутинов День',
    date: '03.09.2026',
    isoDate: '2026-09-03',
    time: '',
    poster: '',
    description: 'Третье сентября уже в календаре. Готовим новый тематический вечер - афиша, время и подробности появятся совсем скоро.',
    venue: 'Гастробар на Ясной',
    address: 'ул. Ясная, 6А',
    price: 'Подробности скоро',
    status: 'teaser'
  }
];

const archiveEvents = [
  { title: 'Рисуем Блюз', date: '06.08.2026', time: '20:20', poster: '/assets/poster_art.jpg', label: 'Арт-вечер' },
  { title: 'Роковый вечер', date: '13.08.2026', time: '20:20', poster: '/assets/poster_rock.jpg', label: 'Музыкальный вечер' },
  { title: 'Побег в СССР!', date: '20.08.2026', time: '20:20', poster: '/assets/poster_ussr.png', label: 'Квартирник для взрослых' }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function getEventById(id) {
  return upcomingEvents.find((event) => event.id === id) || null;
}

function getNextEvent() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return upcomingEvents.find((event) => new Date(`${event.isoDate}T23:59:59`) >= now) || upcomingEvents.at(-1) || null;
}

function dateLabel(event) {
  return event.time ? `${event.date} · ${event.time}` : `${event.date} · время скоро`;
}

function eventMessage(event) {
  if (!event) return 'Здравствуйте! Хочу узнать о ближайшем мероприятии взрослого клуба живого общения «Будем знакомы».';
  const time = event.time ? ` в ${event.time}` : '';
  return `Здравствуйте! Хочу принять участие в мероприятии «${event.title}» ${event.date}${time}. Подскажите, пожалуйста, детали.`;
}

function telegramLink(message) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
}

function renderEvents() {
  const grid = $('#eventsGrid');
  if (!grid) return;

  grid.innerHTML = upcomingEvents.map((event, index) => {
    const poster = event.poster
      ? `<figure class="event-visual"><img src="${esc(event.poster)}" alt="Афиша ${esc(event.title)}" ${index ? 'loading="lazy"' : ''} data-lightbox></figure>`
      : `<div class="event-placeholder" aria-label="Место для будущей афиши">
          <span>03</span><b>СЕН</b><div><small>Афиша готовится</small><strong>Третье сентября</strong></div>
        </div>`;

    return `<article class="bento-card event-card ${event.status === 'teaser' ? 'event-teaser' : 'event-open'} span-${index === 0 ? '7' : '5'} reveal">
      ${poster}
      <div class="event-copy">
        <div class="event-status"><span>${event.status === 'teaser' ? 'Следующая дата' : 'Запись открыта'}</span><b>${esc(dateLabel(event))}</b></div>
        <h3>${esc(event.title)}</h3>
        <p>${esc(event.description)}</p>
        <div class="event-details"><span><small>Где</small><b>${esc(event.venue)}</b><em>${esc(event.address)}</em></span><span><small>Участие</small><b>${esc(event.price)}</b></span></div>
        <button class="button ${event.status === 'teaser' ? 'button-dark' : 'button-primary'}" data-event-id="${esc(event.id)}">${event.status === 'teaser' ? 'Хочу узнать первым' : 'Принять участие'} <span aria-hidden="true">↗</span></button>
      </div>
    </article>`;
  }).join('');
}

function renderArchive() {
  const grid = $('#archiveGrid');
  if (!grid) return;
  grid.innerHTML = archiveEvents.map((event) => `<article class="bento-card archive-card span-4 reveal">
    <figure><img src="${esc(event.poster)}" alt="Афиша ${esc(event.title)}" loading="lazy" data-lightbox></figure>
    <div><span>${esc(event.label)}</span><h3>${esc(event.title)}</h3><p>${esc(event.date)} · ${esc(event.time)}</p></div>
  </article>`).join('');
}

async function copyMessage(message) {
  const status = $('#copyStatus');
  try {
    await navigator.clipboard.writeText(message);
    if (status) status.textContent = 'Сообщение скопировано';
    return true;
  } catch {
    if (status) status.textContent = 'Выдели и скопируй сообщение вручную';
    return false;
  }
}

function openJoin(event = null) {
  const modal = $('#joinModal');
  if (!modal) return;
  const selected = event || getNextEvent();
  const message = eventMessage(selected);
  $('#modalTitle').textContent = selected?.title || 'Будем знакомы';
  $('#messagePreview').textContent = message;
  $('#telegramButton').href = telegramLink(message);
  $('#maxButton').href = MAX_CONTACT_URL;
  $('#maxButton').onclick = () => copyMessage(message);
  $('#copyStatus').textContent = '';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overlay-open');
  $('#modalClose')?.focus();
}

function closeJoin() {
  const modal = $('#joinModal');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overlay-open');
}

function openLightbox(image) {
  const lightbox = $('#imageLightbox');
  if (!lightbox || !image) return;
  $('#imageLightboxImage').src = image.currentSrc || image.src;
  $('#imageLightboxImage').alt = image.alt || '';
  $('#imageLightboxCaption').textContent = image.alt || '';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overlay-open');
}

function closeLightbox() {
  const lightbox = $('#imageLightbox');
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overlay-open');
}

function bindActions() {
  document.addEventListener('click', (event) => {
    const eventButton = event.target.closest('[data-event-id]');
    if (eventButton) {
      event.preventDefault();
      openJoin(getEventById(eventButton.dataset.eventId));
      return;
    }
    const nextButton = event.target.closest('[data-next-event-join]');
    if (nextButton) {
      event.preventDefault();
      openJoin(getNextEvent());
      return;
    }
    const image = event.target.closest('img[data-lightbox]');
    if (image) openLightbox(image);
  });

  $$('[data-direct-telegram]').forEach((link) => { link.href = telegramLink(eventMessage(getNextEvent())); });
  $$('[data-direct-max]').forEach((link) => {
    link.href = MAX_CONTACT_URL;
    link.addEventListener('click', () => copyMessage(eventMessage(getNextEvent())));
  });

  $('#modalClose')?.addEventListener('click', closeJoin);
  $('#joinModal')?.addEventListener('click', (event) => { if (event.target.id === 'joinModal') closeJoin(); });
  $('#copyButton')?.addEventListener('click', () => copyMessage($('#messagePreview')?.textContent || ''));
  $('#imageLightboxClose')?.addEventListener('click', closeLightbox);
  $('#imageLightbox')?.addEventListener('click', (event) => { if (event.target.id === 'imageLightbox') closeLightbox(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeJoin(); closeLightbox(); } });
}

function updateMobileBar() {
  const event = getNextEvent();
  if (!event) return;
  $('#mobileEventDate').textContent = event.time ? `${event.date} · ${event.time}` : event.date;
  $('#mobileEventTitle').textContent = event.title;
}

function startReveal() {
  const elements = $$('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px' });
  elements.forEach((element) => observer.observe(element));
}

renderEvents();
renderArchive();
updateMobileBar();
bindActions();
startReveal();
