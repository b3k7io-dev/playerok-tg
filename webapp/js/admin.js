const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }
const user = tg?.initDataUnsafe?.user || { id: 0 };
const ADMIN_IDS = [8325775593];

const content = document.getElementById('content');

if (!ADMIN_IDS.includes(user.id)) {
  content.innerHTML = '<div class="card"><b>Доступ запрещён.</b><br><small>Эта страница только для администраторов.</small></div>';
} else {
  content.innerHTML = `
    <div class="tabs">
      <button class="tab active" data-tab="dashboard">Дашборд</button>
      <button class="tab" data-tab="topups">Пополнения</button>
      <button class="tab" data-tab="users">Пользователи</button>
      <button class="tab" data-tab="products">Товары</button>
      <button class="tab" data-tab="settings">Настройки</button>
    </div>
    <div id="tabContent"></div>
  `;
  const tabs = document.querySelectorAll('.tab');
  const tabContent = document.getElementById('tabContent');
  const renderTab = (tab) => {
    switch (tab) {
      case 'dashboard':
        tabContent.innerHTML = `
          <div class="grid">
            <div class="card"><b>Новых юзеров</b><br><span style="font-size:24px;font-weight:700">0</span></div>
            <div class="card"><b>Pending-пополнений</b><br><span style="font-size:24px;font-weight:700">0</span></div>
            <div class="card"><b>Тикетов</b><br><span style="font-size:24px;font-weight:700">0</span></div>
            <div class="card"><b>Товаров на модерации</b><br><span style="font-size:24px;font-weight:700">0</span></div>
          </div>
          <div class="card"><b>Последние действия</b><br><small>Журнал событий появится здесь</small></div>
        `;
        break;
      case 'topups':
        tabContent.innerHTML = `
          <div class="card">
            <b>Заявки на пополнение</b>
            <div style="margin-top:8px"><small>Подтверждение через бота: /topups</small></div>
            <div class="table" style="margin-top:12px">
              <div class="row"><span>ID</span><span>Пользователь</span><span>Сумма</span><span>Статус</span></div>
              <div class="row"><span>—</span><span>Нет заявок</span><span>—</span><span>—</span></div>
            </div>
          </div>
        `;
        break;
      case 'users':
        tabContent.innerHTML = `
          <div class="card">
            <b>Пользователи</b>
            <input class="input" placeholder="Поиск по tg_id / username" style="margin-top:8px">
            <div class="table" style="margin-top:12px">
              <div class="row"><span>TG ID</span><span>Имя</span><span>Баланс</span><span>Статус</span></div>
              <div class="row"><span>—</span><span>Нет данных</span><span>—</span><span>—</span></div>
            </div>
          </div>
        `;
        break;
      case 'products':
        tabContent.innerHTML = `
          <div class="card">
            <b>Товары на модерации</b>
            <button class="btn" style="margin-top:8px" onclick="alert('Форма добавления товара (как у пользователя, без модерации)')">+ Добавить товар</button>
            <div class="table" style="margin-top:12px">
              <div class="row"><span>ID</span><span>Название</span><span>Цена</span><span>Статус</span></div>
              <div class="row"><span>—</span><span>Нет товаров</span><span>—</span><span>—</span></div>
            </div>
          </div>
        `;
        break;
      case 'settings':
        tabContent.innerHTML = `
          <div class="card">
            <b>Настройки</b>
            <label>Номер карты</label>
            <input class="input" value="0000 0000 0000 0000">
            <label>Держатель</label>
            <input class="input" value="IVAN IVANOV">
            <label>Комиссия (%)</label>
            <input class="input" type="number" value="5">
            <label>Текст правил</label>
            <textarea class="input" rows="4">Правила использования...</textarea>
            <button class="btn" onclick="alert('Сохранено')">Сохранить</button>
          </div>
        `;
        break;
    }
  };
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    renderTab(t.dataset.tab);
  }));
  renderTab('dashboard');
}
