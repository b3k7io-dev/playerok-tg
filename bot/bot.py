import os
import sqlite3
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

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

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    init_db()
    conn = sqlite3.connect(DB)
    conn.execute("INSERT OR IGNORE INTO users(tg_id,username,first_name) VALUES(?,?,?)",
                 (tg_id, update.effective_user.username, update.effective_user.first_name))
    conn.commit()
    conn.close()
    kb = [[InlineKeyboardButton("Открыть маркет", web_app=WebAppInfo(url=WEBAPP_URL))]]
    await update.message.reply_text("Добро пожаловать в Playerok!", reply_markup=InlineKeyboardMarkup(kb))

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

def main():
    init_db()
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("terms", terms))
    app.add_handler(CommandHandler("topups", topups))
    app.add_handler(CallbackQueryHandler(on_callback))
    app.run_polling()

if __name__ == "__main__":
    main()
