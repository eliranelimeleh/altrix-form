from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from datetime import datetime
import os, sqlite3, io, threading, webbrowser
from zoneinfo import ZoneInfo

ISRAEL_TZ = ZoneInfo("Asia/Jerusalem")

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE  = os.environ.get("DB_PATH", os.path.join(BASE_DIR, "registrations.db"))
HEADERS  = ["שם מלא", "מס' טלפון", "אימייל", "סוג החשבון", "מס' חשבון מסחר", "תאריך ושעה"]


def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True) if os.path.dirname(DB_FILE) else None
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS registrations (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name     TEXT NOT NULL,
                phone         TEXT NOT NULL,
                email         TEXT NOT NULL,
                account_type  TEXT NOT NULL,
                trading_acct  TEXT NOT NULL,
                created_at    TEXT NOT NULL
            )
        """)


def build_excel(rows):
    wb = Workbook()
    ws = wb.active
    ws.title = "רישומים"
    thin = Side(style="thin", color="CCCCCC")
    brd  = Border(left=thin, right=thin, top=thin, bottom=thin)
    for i, h in enumerate(HEADERS, 1):
        c = ws.cell(row=1, column=i, value=h)
        c.font      = Font(bold=True, color="FFFFFF", size=11)
        c.fill      = PatternFill("solid", fgColor="1565C0")
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.border    = brd
    for i, w in enumerate([22, 18, 30, 18, 22, 24], 1):
        ws.column_dimensions[ws.cell(1, i).column_letter].width = w
    ws.row_dimensions[1].height = 28
    for rn, row in enumerate(rows, 2):
        alt = PatternFill("solid", fgColor="EBF3FB") if rn % 2 == 0 else None
        for i, v in enumerate([row["full_name"], row["phone"], row["email"],
                                row["account_type"], row["trading_acct"], row["created_at"]], 1):
            c = ws.cell(row=rn, column=i, value=v)
            c.alignment = Alignment(horizontal="center", vertical="center")
            c.border = brd
            if alt: c.fill = alt
        ws.row_dimensions[rn].height = 20
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf


@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/submit", methods=["POST"])
def submit():
    data = request.get_json(force=True)
    for f in ["fullName", "phone", "email", "accountType", "tradingAccount"]:
        if not str(data.get(f, "")).strip():
            return jsonify({"error": f"missing: {f}"}), 400
    ts = datetime.now(ISRAEL_TZ).strftime("%d/%m/%Y %H:%M:%S")
    with get_db() as conn:
        conn.execute(
            "INSERT INTO registrations (full_name,phone,email,account_type,trading_acct,created_at) VALUES (?,?,?,?,?,?)",
            (data["fullName"], data["phone"], data["email"],
             data["accountType"], data["tradingAccount"], ts)
        )
    return jsonify({"ok": True}), 200


@app.route("/download")
def download():
    key = request.args.get("key", "")
    if key != os.environ.get("DOWNLOAD_KEY", "altrix2024"):
        return "Unauthorized", 401
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM registrations ORDER BY id").fetchall()
    buf = build_excel(rows)
    today = datetime.now().strftime("%d-%m-%Y")
    return send_file(buf, as_attachment=True,
                     download_name=f"Altrix_{today}.xlsx",
                     mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


def open_browser():
    webbrowser.open("http://localhost:5000")


# called on every gunicorn worker startup too
init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    if port == 5000:
        threading.Timer(1.2, open_browser).start()
    print(f"\nServer: http://localhost:{port}")
    print("Press Ctrl+C to stop\n")
    app.run(host="0.0.0.0", port=port)
