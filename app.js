const TELEGRAM_USERNAME = 'kava_studia';

const MAX_CONTACT_URL = 'https://max.ru/u/f9LHodD0cOID_dgF3S6fVV47t3D0pcOwjMiQ0IDe96OTvyfjs7u0MjRICI0';

const upcomingEvents = [];

const archiveEvents = [
  { title: 'Рисуем Блюз', date: '06.08.2026', time: '20:20', poster: '/assets/poster_art.webp' },
  { title: 'Побег в СССР!', date: '20.08.2026', time: '20:20', poster: '/assets/poster_ussr.webp' }
];

const $ = (s) => document.querySelector(s);

function esc(value='') {
  return String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function renderEvents() {
  const grid = $('#eventsGrid');
  if (!upcomingEvents.length) {
    grid.innerHTML = `<div class="empty-events"><div><h3>Следующая встреча уже готовится</h3><p>Как только новая дата и афиша будут подтверждены, событие появится здесь. Уже сейчас можно написать организатору.</p></div><button class="primary" data-generic-join>Хочу узнать первым</button></div>`;
    bindGeneric();
    return;
  }

  grid.innerHTML = upcomingEvents.map((e, i) => `
    <article class="event-card">
      <div class="event-poster"><img src="${esc(e.poster)}" alt="${esc(e.title)}"></div>
      <div class="event-body">
        <div class="event-date">${esc(e.date)} · ${esc(e.time)}</div>
        <h3>${esc(e.title)}</h3>
        <p>${esc(e.description || '')}</p>
        <div class="event-meta"><b>${esc(e.venue || '')}</b>${e.address ? `<br>${esc(e.address)}` : ''}</div>
        <div class="price-row"><div>с картой БЗ<b>600 ₽</b></div><div>без карты<b>1000 ₽</b></div></div>
        <button class="primary" data-event-index="${i}">Принять участие</button>
      </div>
    </article>`).join('');

  grid.querySelectorAll('[data-event-index]').forEach(btn => {
    btn.addEventListener('click', () => openJoin(upcomingEvents[Number(btn.dataset.eventIndex)]));
  });
}

function renderArchive() {
  $('#archiveGrid').innerHTML = archiveEvents.map(e => `
    <article class="archive-card">
      <div class="poster-wrap"><img src="${esc(e.poster)}" alt="${esc(e.title)}"></div>
      <div class="archive-info"><small>${esc(e.date)} · ${esc(e.time)}</small><b>${esc(e.title)}</b></div>
    </article>`).join('');
}

function eventMessage(event) {
  if (!event) {
    return 'Привет! Хочу попасть на ближайшее мероприятие взрослого клуба живого общения «Будем знакомы». Подскажите, пожалуйста, что планируется дальше?';
  }
  return `Привет! Хочу принять участие в мероприятии «${event.title}» ${event.date} в ${event.time}. Подскажите, пожалуйста, что нужно сделать дальше?`;
}

function telegramLink(message) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
}

async function copyMessage(message) {
  try {
    await navigator.clipboard.writeText(message);
    $('#copyStatus').textContent = 'Текст скопирован.';
    return true;
  } catch {
    $('#copyStatus').textContent = 'Не получилось скопировать автоматически.';
    return false;
  }
}

function openJoin(event=null) {
  const msg = eventMessage(event);
  $('#modalTitle').textContent = event ? event.title : 'Ближайшая встреча БЗ';
  $('#messagePreview').textContent = msg;
  $('#telegramButton').href = telegramLink(msg);
  $('#copyStatus').textContent = '';

  const maxButton = $('#maxButton');
  maxButton.hidden = false;
  maxButton.href = MAX_CONTACT_URL;
  maxButton.onclick = async () => { await copyMessage(msg); };

  $('#joinModal').classList.add('open');
  $('#joinModal').setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}

function closeJoin() {
  $('#joinModal').classList.remove('open');
  $('#joinModal').setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

function bindGeneric() {
  document.querySelectorAll('[data-generic-join]').forEach(el => {
    el.onclick = () => openJoin();
  });
}

$('#modalClose').addEventListener('click', closeJoin);
$('#joinModal').addEventListener('click', e => { if (e.target.id === 'joinModal') closeJoin(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeJoin(); });
$('#copyButton').addEventListener('click', async () => { await copyMessage($('#messagePreview').textContent); });

renderEvents();
renderArchive();
bindGeneric();
