import os
import sqlite3
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram import LabeledPrice, Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes, PreCheckoutQueryHandler, MessageHandler, filters

BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://b3k7io-dev.github.io/playerok-tg/")
ADMIN_IDS = [8325775593]

DB = "playerok.db"

def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS users (
        tg_id INTEGER PRIMARY KEY, username TEXT, first_name TEXT,
        balance INTEGER DEFAULT 0, frozen INTEGER DEFAULT 0,
        can_sell INTEGER DEFAULT 0, terms_version INTEGER DEFAULT 0,
        ref_code TEXT, referred_by INTEGER, valid_referrals INTEGER DEFAULT 0,
        can_withdraw INTEGER DEFAULT 0)""")
    c.execute("""CREATE TABLE IF NOT EXISTS topup_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT, tg_id INTEGER, amount INTEGER,
        code TEXT UNIQUE, status TEXT DEFAULT 'pending', created_at TEXT)""")
    c.execute("""CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)""")
    c.execute("INSERT OR IGNORE INTO settings(key,value) VALUES('card_number','0000 0000 0000 0000')")
    c.execute("INSERT OR IGNORE INTO settings(key,value) VALUES('card_holder','IVAN IVANOV')")
    c.execute("INSERT OR IGNORE INTO settings(key,value) VALUES('terms_text','Правила использования...')")
    conn.commit()
    conn.close()

async def stars_invoice(update: Update, context: ContextTypes.DEFAULT_TYPE, amount: int = 100):
    await context.bot.send_invoice(
        chat_id=update.effective_chat.id,
        title="Пополнение баланса",
        description="Пополнение через Telegram Stars",
        payload=f"stars_topup_{amount}",
        provider_token="",
        currency="XTR",
        prices=[LabeledPrice("Stars", amount)],
    )

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    init_db()
    if context.args and context.args[0].startswith("stars_"):
        try:
            amount = int(context.args[0].split("_")[1])
            await stars_invoice(update, context, amount)
            return
        except Exception:
            pass
    conn = sqlite3.connect(DB)
    conn.execute("INSERT OR IGNORE INTO users(tg_id,username,first_name) VALUES(?,?,?)",
                 (tg_id, update.effective_user.username, update.effective_user.first_name))
    conn.commit()
    conn.close()
    kb = [[InlineKeyboardButton("🛍 Открыть маркет", web_app=WebAppInfo(url=WEBAPP_URL))],
          [InlineKeyboardButton("⚙️ Админ-панель", web_app=WebAppInfo(url=WEBAPP_URL.replace('index.html','admin.html') if 'index.html' in WEBAPP_URL else WEBAPP_URL.rstrip('/') + '/admin.html'))]]
    photo_url = "https://via.placeholder.com/400x200/1453ff/ffffff?text=Playerok"
    await update.message.reply_photo(photo=photo_url,
        caption="Добро пожаловать в Playerok! 🎮\n\nМаркетплейс игровых товаров и услуг.\nПополняй баланс, покупай и продавай товары, приглашай друзей.",
        reply_markup=InlineKeyboardMarkup(kb))

async def addadmin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in ADMIN_IDS:
        await update.message.reply_text("Доступ запрещён.")
        return
    if not context.args:
        await update.message.reply_text("Использование: /addadmin <tg_id>")
        return
    try:
        new_id = int(context.args[0])
    except ValueError:
        await update.message.reply_text("tg_id должен быть числом.")
        return
    if new_id not in ADMIN_IDS:
        ADMIN_IDS.append(new_id)
    conn = sqlite3.connect(DB)
    conn.execute("INSERT OR IGNORE INTO users(tg_id) VALUES(?)", (new_id,))
    conn.commit()
    conn.close()
    await update.message.reply_text(f"Админ {new_id} добавлен.")

async def terms(update: Update, context: ContextTypes.DEFAULT_TYPE):
    conn = sqlite3.connect(DB)
    row = conn.execute("SELECT value FROM settings WHERE key='terms_text'").fetchone()
    conn.close()
    await update.message.reply_text(row[0] if row else "Правила не заданы.")

async def topups(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in ADMIN_IDS:
        await update.message.reply_text("Доступ запрещён.")
        return
    conn = sqlite3.connect(DB)
    rows = conn.execute("SELECT id,tg_id,amount,code FROM topup_requests WHERE status='pending'").fetchall()
    conn.close()
    if not rows:
        await update.message.reply_text("Нет ожидающих заявок.")
        return
    for r in rows:
        kb = [[InlineKeyboardButton("✅ Подтвердить", callback_data=f"topup_ok:{r[0]}"),
               InlineKeyboardButton("❌ Отклонить", callback_data=f"topup_no:{r[0]}")]]
        await update.message.reply_text(f"Заявка #{r[0]}\nЮзер: {r[1]}\nСумма: {r[2]} ₽\nКод: {r[3]}",
                                       reply_markup=InlineKeyboardMarkup(kb))

async def on_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    if q.from_user.id not in ADMIN_IDS:
        await q.edit_message_text("Доступ запрещён.")
        return
    data = q.data
    if data.startswith("topup_ok:"):
        rid = int(data.split(":")[1])
        conn = sqlite3.connect(DB)
        row = conn.execute("SELECT tg_id,amount FROM topup_requests WHERE id=? AND status='pending'", (rid,)).fetchone()
        if row:
            tg_id, amount = row
            conn.execute("UPDATE users SET balance = balance + ? WHERE tg_id=?", (amount, tg_id))
            conn.execute("UPDATE topup_requests SET status='confirmed' WHERE id=?", (rid,))
            conn.commit()
            conn.close()
            await context.bot.send_message(chat_id=tg_id, text=f"Баланс пополнен на {amount} ₽.")
            await q.edit_message_text(f"Заявка #{rid} подтверждена.")
        else:
            conn.close()
            await q.edit_message_text("Заявка не найдена или уже обработана.")
    elif data.startswith("topup_no:"):
        rid = int(data.split(":")[1])
        conn = sqlite3.connect(DB)
        conn.execute("UPDATE topup_requests SET status='rejected' WHERE id=?", (rid,))
        conn.commit()
        row = conn.execute("SELECT tg_id FROM topup_requests WHERE id=?", (rid,)).fetchone()
        conn.close()
        if row:
            await context.bot.send_message(chat_id=row[0], text="Заявка на пополнение отклонена. Обратитесь в поддержку.")
        await q.edit_message_text(f"Заявка #{rid} отклонена.")

async def on_successful_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    amount = update.message.successful_payment.total_amount
    conn = sqlite3.connect(DB)
    conn.execute("UPDATE users SET balance = balance + ? WHERE tg_id=?", (amount, tg_id))
    conn.commit()
    conn.close()
    await update.message.reply_text(f"Баланс пополнен на {amount} ⭐!")

def main():
    init_db()
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("stars", lambda u, c: stars_invoice(u, c, 100)))
    app.add_handler(PreCheckoutQueryHandler(lambda u, c: u.pre_checkout_query.answer(ok=True)))
    app.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, on_successful_payment))
    app.add_handler(CommandHandler("terms", terms))
    app.add_handler(CommandHandler("topups", topups))
    app.add_handler(CommandHandler("addadmin", addadmin))
    app.add_handler(CallbackQueryHandler(on_callback))
    app.run_polling()

if __name__ == "__main__":
    main()
