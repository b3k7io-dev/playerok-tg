const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const user = tg?.initDataUnsafe?.user || { first_name: 'Гость', id: 0, username: 'guest' };

const BALANCE = 0;
const REFERRALS = 0;

const PRODUCTS = [
  // Brawl Stars
  { id:1, game:'Brawl Stars', cat:'Гемы', title:'15000 гемов', price:650, auto:true, img:'https://via.placeholder.com/64/f5c518/000?text=BS' },
  { id:2, game:'Brawl Stars', cat:'Гемы', title:'30000 гемов', price:1200, auto:true, img:'https://via.placeholder.com/64/f5c518/000?text=BS' },
  { id:3, game:'Brawl Stars', cat:'Бравл Пасс', title:'Brawl Pass Plus', price:299, auto:true, img:'https://via.placeholder.com/64/f5c518/000?text=BP' },
  { id:4, game:'Brawl Stars', cat:'Аккаунты', title:'Аккаунт 40000 трофеев', price:2200, auto:false, img:'https://via.placeholder.com/64/f5c518/000?text=BS' },
  { id:5, game:'Brawl Stars', cat:'Бойцы', title:'Max (все бойцы)', price:3500, auto:true, img:'https://via.placeholder.com/64/f5c518/000?text=MX' },
  // Free Fire
  { id:6, game:'Free Fire', cat:'Бриллианты', title:'1000 бриллиантов', price:599, auto:true, img:'https://via.placeholder.com/64/ff3b30/fff?text=FF' },
  { id:7, game:'Free Fire', cat:'Бриллианты', title:'2500 бриллиантов', price:1299, auto:true, img:'https://via.placeholder.com/64/ff3b30/fff?text=FF' },
  { id:8, game:'Free Fire', cat:'Booyah Pass', title:'Booyah Pass Season 45', price:299, auto:true, img:'https://via.placeholder.com/64/ff3b30/fff?text=BP' },
  { id:9, game:'Free Fire', cat:'Аккаунты', title:'Аккаунт 50 lvl', price:799, auto:false, img:'https://via.placeholder.com/64/ff3b30/fff?text=FF' },
  // Roblox
  { id:10, game:'Roblox', cat:'Robux', title:'1000 Robux', price:449, auto:true, img:'https://via.placeholder.com/64/1453ff/fff?text=R' },
  { id:11, game:'Roblox', cat:'Robux', title:'2500 Robux', price:999, auto:true, img:'https://via.placeholder.com/64/1453ff/fff?text=R' },
  { id:12, game:'Roblox', cat:'Аккаунты', title:'Аккаунт с играми', price:999, auto:false, img:'https://via.placeholder.com/64/1453ff/fff?text=R' },
  { id:13, game:'Roblox', cat:'UGC', title:'Limited UGC предмет', price:1499, auto:false, img:'https://via.placeholder.com/64/9d64ff/fff?text=U' },
  // Steam
  { id:14, game:'Steam', cat:'Аккаунты', title:'Аккаунт Steam с играми', price:499, auto:false, img:'https://via.placeholder.com/64/1453ff/fff?text=S' },
  { id:15, game:'Steam', cat:'CS2', title:'CS2 Prime аккаунт', price:899, auto:true, img:'https://via.placeholder.com/64/302259/fff?text=C' },
  // Telegram
  { id:16, game:'Telegram', cat:'Звезды', title:'Звезды Telegram 100 шт', price:149, auto:true, img:'https://via.placeholder.com/64/9d64ff/fff?text=T' },
  { id:17, game:'Telegram', cat:'Premium', title:'Premium на 3 месяца', price:399, auto:true, img:'https://via.placeholder.com/64/9d64ff/fff?text=P' },
];

let activeGame = 'Все';
let activeCat = 'Все';

const GAMES = ['Все','Brawl Stars','Free Fire','Roblox','Steam','Telegram'];
const CATS = {
  'Brawl Stars': ['Все','Гемы','Бравл Пасс','Аккаунты','Бойцы'],
  'Free Fire': ['Все','Бриллианты','Booyah Pass','Аккаунты'],
  'Roblox': ['Все','Robux','Аккаунты','UGC'],
  'Steam': ['Все','Аккаунты','CS2'],
  'Telegram': ['Все','Звезды','Premium'],
};

const screens = {
  catalog: () => `
    <h2>Каталог</h2>
    <div style="display:flex;gap:8px;margin-bottom:8px;overflow-x:auto">
      ${GAMES.map(g => `<button class="btn secondary" style="width:auto;padding:6px 12px;font-size:12px;white-space:nowrap" onclick="setGame('${g}')">${g}</button>`).join('')}
    </div>
    <div id="catRow" style="display:flex;gap:8px;margin-bottom:12px;overflow-x:auto"></div>
    <div class="grid" id="catalogGrid"></div>
  `,
  chats: () => `<h2>Чаты</h2><p class="card">Нет активных диалогов.</p>`,
  profile: () => `
    <div class="card" style="display:flex;align-items:center;gap:14px;background:rgba(20,22,26,0.6);backdrop-filter:blur(20px);color:#fff;border:1px solid rgba(255,255,255,0.1)">
      <img src="${user.photo_url || 'https://via.placeholder.com/56'}" width="56" height="56" style="border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.3)">
      <div style="flex:1">
        <div style="font-size:17px;font-weight:700">${user.first_name}</div>
        <div style="color:rgba(255,255,255,0.7);font-size:13px">@${user.username || 'guest'}</div>
        <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:2px">ID: ${user.id || 0}</div>
      </div>
    </div>

    <div class="card" style="background:linear-gradient(135deg,rgba(20,83,255,0.85),rgba(157,100,255,0.85));backdrop-filter:blur(20px);color:#fff;border:1px solid rgba(255,255,255,0.15)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:13px;opacity:.85">Баланс</div>
        <div style="font-size:11px;opacity:.7">RUB</div>
      </div>
      <div style="font-size:34px;font-weight:800;margin:6px 0">${BALANCE} ₽</div>
      <div style="display:flex;justify-content:space-between;font-size:12px;opacity:.85;margin-bottom:12px">
        <span>Заморозка: 0 ₽</span>
        <span>Доступно: ${BALANCE} ₽</span>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn" style="background:rgba(255,255,255,.25);color:#fff;flex:1;backdrop-filter:blur(10px)" onclick="showTopup()">Пополнить</button>
        <button class="btn" style="background:rgba(255,255,255,.25);color:#fff;flex:1;backdrop-filter:blur(10px)" onclick="showWithdraw()">Вывести</button>
      </div>
    </div>

    <div class="card" style="background:rgba(20,22,26,0.6);backdrop-filter:blur(20px);color:#fff;border:1px solid rgba(255,255,255,0.1)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <b>Рефералы</b>
        <span style="color:rgba(255,255,255,0.6);font-size:13px">${REFERRALS} / 5</span>
      </div>
      <div style="height:10px;background:rgba(255,255,255,0.1);border-radius:999px;overflow:hidden">
        <div style="width:${REFERRALS*20}%;height:100%;background:linear-gradient(90deg,var(--primary),var(--purple));border-radius:999px"></div>
      </div>
      <div style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.6)">Пригласите 5 реальных пользователей для разблокировки вывода средств.</div>
      <button class="btn" style="margin-top:12px;background:rgba(255,255,255,0.15);color:#fff;backdrop-filter:blur(10px)" onclick="copyRef()">Получить реферальную ссылку</button>
    </div>

    <div class="card" style="background:rgba(20,22,26,0.6);backdrop-filter:blur(20px);color:#fff;border:1px solid rgba(255,255,255,0.1)">
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);cursor:pointer" onclick="showViewed()"><span>Вы смотрели</span><span style="color:rgba(255,255,255,0.5)">0 →</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);cursor:pointer" onclick="showMyProducts()"><span>Мои товары</span><span style="color:rgba(255,255,255,0.5)">0 →</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);cursor:pointer" onclick="showHistory()"><span>История операций</span><span style="color:rgba(255,255,255,0.5)">→</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;cursor:pointer" onclick="render('support')"><span>Поддержка</span><span style="color:rgba(255,255,255,0.5)">→</span></div>
    </div>

    <button class="btn" style="background:rgba(20,83,255,0.8);color:#fff;backdrop-filter:blur(10px)" onclick="showAddProduct()">+ Добавить товар</button>
  `,
  support: () => `
    <h2>Поддержка</h2>
    <div class="card" style="background:var(--primary-soft)">
      <b>Администратор ответит в течение 24 часов.</b><br>
      <small>Сообщения видны только вам и администратору.</small>
    </div>
    <div class="card" style="min-height:120px">
      <div style="color:var(--text-soft);font-size:13px">История сообщений пуста.</div>
    </div>
    <textarea class="input" rows="3" placeholder="Опишите проблему..."></textarea>
    <button class="btn" onclick="sendSupport()">Отправить сообщение</button>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn secondary" style="width:auto;padding:8px 12px;font-size:12px" onclick="prefillSupport('Как пополнить баланс?')">❓ Как пополнить</button>
      <button class="btn secondary" style="width:auto;padding:8px 12px;font-size:12px" onclick="prefillSupport('Как узнать статус заказа?')">❓ Статус заказа</button>
      <button class="btn secondary" style="width:auto;padding:8px 12px;font-size:12px" onclick="prefillSupport('Как вывести средства?')">❓ Вывод средств</button>
    </div>`
};

function renderCatalog() {
  const filtered = PRODUCTS.filter(p =>
    (activeGame === 'Все' || p.game === activeGame) &&
    (activeCat === 'Все' || p.cat === activeCat)
  );
  const grid = document.getElementById('catalogGrid');
  if (grid) grid.innerHTML = filtered.map(p => `
    <div class="card product" style="cursor:pointer" onclick="showProduct(${p.id})">
      <img src="${p.img}" alt="${p.title}" style="width:100%;height:96px;object-fit:cover;border-radius:12px;margin-bottom:8px">
      <div style="font-size:11px;color:var(--text-soft)">${p.game} · ${p.cat}</div>
      <div style="font-size:13px;font-weight:600;margin:4px 0;min-height:32px">${p.title}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
        <span style="font-weight:700;color:var(--primary)">${p.price} ₽</span>
        ${p.auto ? '<span class="badge auto">Авто</span>' : '<span class="badge" style="background:var(--bg-soft);color:var(--text-soft)">Вручную</span>'}
      </div>
    </div>
  `).join('');

  const catRow = document.getElementById('catRow');
  if (catRow) {
    const cats = activeGame === 'Все' ? [] : (CATS[activeGame] || ['Все']);
    catRow.innerHTML = cats.map(c => `<button class="btn secondary" style="width:auto;padding:6px 12px;font-size:12px;white-space:nowrap" onclick="setCat('${c}')">${c}</button>`).join('');
  }
}

function setGame(g) { activeGame = g; activeCat = 'Все'; render('catalog'); setTimeout(renderCatalog, 0); }
function setCat(c) { activeCat = c; renderCatalog(); }

function render(tab) {
  document.getElementById('content').innerHTML = screens[tab]();
  document.querySelectorAll('.bottomnav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('title').textContent = tab === 'catalog' ? 'Каталог' : tab === 'chats' ? 'Чаты' : tab === 'profile' ? 'Профиль' : 'Поддержка';
  if (tab === 'catalog') setTimeout(renderCatalog, 0);
}

document.querySelectorAll('.bottomnav button').forEach(b => b.addEventListener('click', () => render(b.dataset.tab)));
render('catalog');

function showProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const box = document.getElementById('productBox');
  box.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
      <img src="${p.img}" style="width:64px;height:64px;border-radius:12px">
      <div>
        <div style="font-size:12px;color:var(--text-soft)">${p.game} · ${p.cat}</div>
        <div style="font-size:16px;font-weight:700">${p.title}</div>
      </div>
    </div>
    <div style="font-size:22px;font-weight:800;color:var(--primary);margin-bottom:8px">${p.price} ₽</div>
    <div style="font-size:13px;color:var(--text-soft);margin-bottom:12px">${p.auto ? 'Автоматическая выдача после оплаты.' : 'Выдача вручную продавцом.'}</div>
    <button class="btn" onclick="alert('Покупка (mock)')">Купить</button>
    <button class="btn secondary" style="margin-top:8px" onclick="document.getElementById('productModal').classList.add('hidden')">Закрыть</button>
  `;
  document.getElementById('productModal').classList.remove('hidden');
}

function copyRef() {
  const link = 'https://t.me/playerok_bot?start=ref_' + (user.id || '0');
  if (navigator.clipboard) navigator.clipboard.writeText(link);
  alert('Реферальная ссылка скопирована:\n' + link);
}
function showViewed() { alert('Вы ещё не просматривали товары.'); }
function showMyProducts() { alert('У вас пока нет товаров. Нажмите «+ Добавить товар».'); }
function showHistory() { alert('История операций пуста.'); }
function showAddProduct() {
  const m = document.getElementById('topupModal');
  const box = document.getElementById('topupMsg');
  box.innerHTML = `
    <h3 style="margin-bottom:8px">Добавить товар</h3>
    <select class="input">
      <option value="">Игра/приложение</option>
      <option>Steam</option>
      <option>CS2</option>
      <option>Telegram</option>
      <option>Brawl Stars</option>
      <option>Free Fire</option>
      <option>Roblox</option>
      <option>Genshin Impact</option>
      <option>Mobile</option>
      <option>Другое</option>
    </select>
    <input class="input" placeholder="Название товара (мин. 2 символа)">
    <textarea class="input" rows="3" placeholder="Описание товара"></textarea>
    <textarea class="input" rows="2" placeholder="Инструкция после покупки"></textarea>
    <input class="input" placeholder="Цена, ₽" type="number" min="1">
    <select class="input"><option>Автовыдача</option><option>Вручную (чат с продавцом)</option></select>
    <input class="input" placeholder="Количество" type="number" min="1" value="1">
    <div style="border:1px dashed var(--border);border-radius:8px;padding:12px;text-align:center;margin-bottom:10px;color:var(--text-soft);font-size:12px">
      📷 Фото товара (до 10 шт, до 10 МБ) — нажмите для загрузки
    </div>
    <button class="btn" onclick="alert('Товар отправлен на модерацию администратору. Он появится в каталоге после подтверждения.')">Опубликовать</button>
  `;
  m.classList.remove('hidden');
}
function prefillSupport(text) {
  const ta = document.querySelector('#content textarea');
  if (ta) ta.value = text;
}
function sendSupport() {
  const ta = document.querySelector('#content textarea');
  if (!ta || !ta.value.trim()) { alert('Введите сообщение'); return; }
  alert('Сообщение отправлено администратору.');
  ta.value = '';
}
function showTopup() {
  const modal = document.getElementById('topupModal');
  const msg = document.getElementById('topupMsg');
  const code = 'PO-' + Math.random().toString(36).substr(2,6).toUpperCase();
  msg.innerHTML = `
    <p style="color:var(--text-soft);font-size:13px">Переведите на карту:</p>
    <div class="card" style="background:var(--bg-soft)">
      <div style="font-size:18px;font-weight:700;letter-spacing:1px">4276 0000 0000 0000</div>
      <div style="font-size:13px;color:var(--text-soft)">Иван И.</div>
    </div>
    <p style="font-size:13px">Код платежа: <b>${code}</b></p>
    <p style="font-size:12px;color:var(--text-soft)">Укажите код в комментарии к переводу. Номер вашей карты нигде не отображается.</p>
    <input class="input" placeholder="Сумма пополнения" type="number" min="1">
    <button class="btn" onclick="alert('Заявка отправлена администратору')">Я оплатил</button>
  `;
  modal.classList.remove('hidden');
}

function showWithdraw() {
  const modal = document.getElementById('withdrawModal');
  const msg = document.getElementById('withdrawMsg');
  if (REFERRALS < 5) {
    msg.innerHTML = '<p style="color:var(--danger)">Пригласите 5 рефералов для разблокировки вывода средств.</p>';
  } else if (BALANCE <= 0) {
    msg.innerHTML = '<p style="color:var(--danger)">В вашем кошельке нет средств.</p>';
  } else if (BALANCE < 100) {
    msg.innerHTML = '<p style="color:var(--danger)">Минимальная сумма вывода 100 ₽.</p>';
  } else {
    msg.innerHTML = `
      <p>Доступно к выводу: <b>${BALANCE} ₽</b></p>
      <input class="input" placeholder="Сумма вывода" type="number" min="100" max="${BALANCE}">
      <input class="input" placeholder="Номер карты для вывода">
      <button class="btn" onclick="alert('Заявка на вывод отправлена администратору')">Отправить заявку</button>
    `;
  }
  modal.classList.remove('hidden');
}
