const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const user = tg?.initDataUnsafe?.user || { first_name: 'Гость', id: 0, username: 'guest' };

// Theme
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';
themeToggle.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'light' ? '☀️' : '🌙';
});

// Products with star prices
const PRODUCTS = [
  { id:1, game:'Brawl Stars', cat:'Гемы', title:'15000 гемов', price:650, auto:true, img:'https://via.placeholder.com/64/f5c518/000?text=BS' },
  { id:2, game:'Brawl Stars', cat:'Гемы', title:'30000 гемов', price:1200, auto:true, img:'https://via.placeholder.com/64/f5c518/000?text=BS' },
  { id:3, game:'Brawl Stars', cat:'Бравл Пасс', title:'Brawl Pass Plus', price:299, auto:true, img:'https://via.placeholder.com/64/f5c518/000?text=BP' },
  { id:4, game:'Brawl Stars', cat:'Аккаунты', title:'Аккаунт 40000 трофеев', price:2200, auto:false, img:'https://via.placeholder.com/64/f5c518/000?text=BS' },
  { id:5, game:'Brawl Stars', cat:'Бойцы', title:'Max (все бойцы)', price:3500, auto:true, img:'https://via.placeholder.com/64/f5c518/000?text=MX' },
  { id:6, game:'Free Fire', cat:'Бриллианты', title:'1000 бриллиантов', price:599, auto:true, img:'https://via.placeholder.com/64/ff3b30/fff?text=FF' },
  { id:7, game:'Free Fire', cat:'Бриллианты', title:'2500 бриллиантов', price:1299, auto:true, img:'https://via.placeholder.com/64/ff3b30/fff?text=FF' },
  { id:8, game:'Free Fire', cat:'Booyah Pass', title:'Booyah Pass Season 45', price:299, auto:true, img:'https://via.placeholder.com/64/ff3b30/fff?text=BP' },
  { id:9, game:'Free Fire', cat:'Аккаунты', title:'Аккаунт 50 lvl', price:799, auto:false, img:'https://via.placeholder.com/64/ff3b30/fff?text=FF' },
  { id:10, game:'Roblox', cat:'Robux', title:'1000 Robux', price:449, auto:true, img:'https://via.placeholder.com/64/1453ff/fff?text=R' },
  { id:11, game:'Roblox', cat:'Robux', title:'2500 Robux', price:999, auto:true, img:'https://via.placeholder.com/64/1453ff/fff?text=R' },
  { id:12, game:'Roblox', cat:'Аккаунты', title:'Аккаунт 100k Robux', price:1999, auto:false, img:'https://via.placeholder.com/64/1453ff/fff?text=R' },
  { id:13, game:'Standoff 2', cat:'Голда', title:'1000 голды', price:349, auto:true, img:'https://via.placeholder.com/64/00c853/fff?text=S2' },
  { id:14, game:'Standoff 2', cat:'Аккаунты', title:'Аккаунт Master', price:1499, auto:false, img:'https://via.placeholder.com/64/00c853/fff?text=S2' },
  { id:15, game:'CS2', cat:'Скины', title:'AK-47 Redline (FT)', price:2500, auto:false, img:'https://via.placeholder.com/64/f5a623/000?text=CS' },
  { id:16, game:'Valorant', cat:'VP', title:'1000 VP', price:599, auto:true, img:'https://via.placeholder.com/64/ff4655/fff?text=V' },
];

const GAMES = ['Все', ...new Set(PRODUCTS.map(p => p.game))];
const CATS = ['Все', ...new Set(PRODUCTS.map(p => p.cat))];

let activeGame = 'Все';
let activeCat = 'Все';
let searchQuery = '';

function renderCatalog() {
  const content = document.getElementById('content');
  const filtered = PRODUCTS.filter(p => {
    const matchGame = activeGame === 'Все' || p.game === activeGame;
    const matchCat = activeCat === 'Все' || p.cat === activeCat;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.game.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGame && matchCat && matchSearch;
  });
  content.innerHTML = `
    <div style="margin-bottom:12px">
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:6px">Игры</div>
      ${GAMES.map(g => `<span class="cat-chip ${g===activeGame?'active':''}" data-game="${g}">${g}</span>`).join('')}
    </div>
    <div style="margin-bottom:12px">
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:6px">Категории</div>
      ${CATS.map(c => `<span class="cat-chip ${c===activeCat?'active':''}" data-cat="${c}">${c}</span>`).join('')}
    </div>
    <div class="grid">
      ${filtered.map(p => `
        <div class="card product" data-id="${p.id}">
          <img src="${p.img}" alt="${p.title}">
          <div style="font-weight:600;font-size:13px">${p.title}</div>
          <div style="font-size:11px;color:var(--text-soft)">${p.game} · ${p.cat}</div>
          <div style="margin:6px 0;font-weight:700;color:var(--star)">⭐ ${p.price}</div>
          ${p.auto ? '<span class="badge auto">Авто</span>' : '<span class="badge new">Ручная</span>'}
          <button class="btn" style="margin-top:8px;font-size:13px;padding:8px" onclick="openProduct(${p.id})">Купить</button>
        </div>
      `).join('')}
    </div>
    ${filtered.length === 0 ? '<div class="card" style="text-align:center;color:var(--text-soft)">Ничего не найдено</div>' : ''}
  `;
  document.querySelectorAll('[data-game]').forEach(el => el.addEventListener('click', () => { activeGame = el.dataset.game; renderCatalog(); }));
  document.querySelectorAll('[data-cat]').forEach(el => el.addEventListener('click', () => { activeCat = el.dataset.cat; renderCatalog(); }));
}

function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  const modal = document.getElementById('productModal');
  const box = document.getElementById('productBox');
  box.innerHTML = `
    <h2>${p.title}</h2>
    <img src="${p.img}" alt="${p.title}" style="width:80px;height:80px;border-radius:12px;margin:8px 0">
    <p style="color:var(--text-soft);font-size:13px">${p.game} · ${p.cat}</p>
    <p style="font-weight:700;font-size:20px;color:var(--star);margin:8px 0">⭐ ${p.price}</p>
    <p style="font-size:13px;margin-bottom:12px">${p.auto ? 'Автоматическая выдача после оплаты.' : 'Ручная выдача продавцом.'}</p>
    <button class="btn star" onclick="buyWithStars(${p.price})">Оплатить ⭐ ${p.price}</button>
    <button class="btn secondary" style="margin-top:8px" onclick="document.getElementById('productModal').classList.add('hidden')">Закрыть</button>
  `;
  modal.classList.remove('hidden');
}

function buyWithStars(amount) {
  // Open bot for Stars payment
  const botUsername = 'playerok_bot'; // замените на реальный
  if (tg) {
    tg.openTelegramLink(`https://t.me/${botUsername}?start=stars_${amount}`);
  } else {
    window.open(`https://t.me/${botUsername}?start=stars_${amount}`, '_blank');
  }
  document.getElementById('productModal').classList.add('hidden');
}

// Search
document.getElementById('search').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderCatalog();
});

// Tabs
const navButtons = document.querySelectorAll('.bottomnav button');
navButtons.forEach(btn => btn.addEventListener('click', () => {
  navButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const tab = btn.dataset.tab;
  if (tab === 'catalog') renderCatalog();
  else if (tab === 'chats') renderChats();
  else if (tab === 'profile') renderProfile();
  else if (tab === 'support') renderSupport();
}));

function renderChats() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="card"><b>Чаты</b><br><small>Список диалогов с продавцами/покупателями</small></div>
    <div class="chat-msg them">Привет! Товар ещё доступен?</div>
    <div class="chat-msg me">Да, в наличии. Оформляйте заказ.</div>
    <div class="chat-msg them">Отлично, оплачиваю.</div>
    <div class="chat-input">
      <input class="input" placeholder="Сообщение..." style="margin-bottom:0">
      <button class="btn" style="width:auto;padding:10px 16px">➤</button>
    </div>
  `;
}

function renderProfile() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="card">
      <b>${user.first_name}</b><br>
      <small style="color:var(--text-soft)">@${user.username || 'guest'} · ID: ${user.id}</small>
    </div>
    <div class="card">
      <b>Баланс</b><br>
      <span style="font-size:24px;font-weight:700;color:var(--star)">⭐ 0</span>
      <button class="btn star" style="margin-top:8px" onclick="buyWithStars(100)">Пополнить через Stars</button>
    </div>
    <div class="card">
      <b>Реферальная программа</b><br>
      <small>Пригласите 5 друзей для разблокировки вывода средств.</small>
    </div>
  `;
}

function renderSupport() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="card"><b>Поддержка</b><br><small>Напишите нам, и мы поможем с заказом.</small></div>
    <div class="card">
      <textarea class="input" rows="4" placeholder="Опишите проблему..."></textarea>
      <button class="btn" onclick="alert('Заявка отправлена')">Отправить</button>
    </div>
  `;
}

// Initial render
renderCatalog();
