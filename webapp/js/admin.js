const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }
const user = tg?.initDataUnsafe?.user || { id: 0 };
const ADMIN_IDS = [8325775593];

const content = document.getElementById('content');

if (!ADMIN_IDS.includes(user.id)) {
  content.innerHTML = '<div class="card"><b>Доступ запрещён.</b><br><small>Эта страница только для администраторов.</small></div>';
} else {
  content.innerHTML = `
    <div class="card"><b>Дашборд</b><br><small>Новых юзеров: 0 · Pending-пополнений: 0 · Тикетов: 0</small></div>
    <div class="card"><b>Пополнения</b><br><small>Список заявок (подтверждение через бота /topups)</small></div>
    <div class="card"><b>Модерация товаров</b><br><small>Товары на проверке появятся здесь</small></div>
    <div class="card"><b>Пользователи</b><br><small>Поиск по tg_id / username</small></div>
    <div class="card"><b>Настройки</b><br><small>Реквизиты карты, комиссия, текст правил</small></div>
    <div class="card"><b>Добавить товар (админ)</b><br><button class="btn" onclick="alert('Форма добавления товара (как у пользователя, без модерации)')">+ Добавить</button></div>
  `;
}
