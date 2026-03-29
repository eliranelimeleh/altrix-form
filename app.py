from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from datetime import datetime, timedelta
import os, sqlite3, io, threading, webbrowser, smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
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
    if os.path.dirname(DB_FILE):
        os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
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


def send_email_report(to_email, rows):
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    if not smtp_user or not smtp_pass:
        raise ValueError("SMTP credentials not configured")

    now   = datetime.now(ISRAEL_TZ)
    today = now.strftime("%d/%m/%Y")
    week_ago    = now - timedelta(days=7)
    month_start = now.replace(day=1, hour=0, minute=0, second=0)

    def parse(s):
        d,m,y,h,mn,sc = s.replace(" ","/").replace(":","/").split("/")
        return datetime(int(y),int(m),int(d),int(h),int(mn),int(sc), tzinfo=ISRAEL_TZ)

    today_count = sum(1 for r in rows if r["created_at"].startswith(today))
    week_count  = sum(1 for r in rows if parse(r["created_at"]) >= week_ago)
    month_count = sum(1 for r in rows if parse(r["created_at"]) >= month_start)

    type_counts = {}
    for r in rows:
        type_counts[r["account_type"]] = type_counts.get(r["account_type"], 0) + 1
    type_rows = "".join(
        f"<tr><td style='padding:8px 14px;border-bottom:1px solid #e5e7eb'>{t}</td>"
        f"<td style='padding:8px 14px;border-bottom:1px solid #e5e7eb;text-align:center'>{c}</td>"
        f"<td style='padding:8px 14px;border-bottom:1px solid #e5e7eb;text-align:center'>{round(c/len(rows)*100) if rows else 0}%</td></tr>"
        for t, c in sorted(type_counts.items(), key=lambda x: -x[1])
    )

    recent_rows = "".join(
        f"<tr><td style='padding:8px 14px;border-bottom:1px solid #e5e7eb'>{r['full_name']}</td>"
        f"<td style='padding:8px 14px;border-bottom:1px solid #e5e7eb'>{r['phone']}</td>"
        f"<td style='padding:8px 14px;border-bottom:1px solid #e5e7eb'>{r['account_type']}</td>"
        f"<td style='padding:8px 14px;border-bottom:1px solid #e5e7eb'>{r['created_at']}</td></tr>"
        for r in list(reversed(rows))[:10]
    )

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;direction:rtl">
      <div style="background:linear-gradient(135deg,#0d1b3e,#1565c0);padding:32px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:1.8rem;letter-spacing:3px">ALTRIX</h1>
        <p style="color:rgba(255,255,255,.7);margin:8px 0 0;font-size:.9rem">סיכום רישומים — {today}</p>
      </div>
      <div style="background:#f9fafb;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:28px">
          {''.join(f'<div style="background:#fff;border-radius:10px;padding:16px;text-align:center;border:1px solid #e5e7eb"><div style="font-size:.75rem;color:#6b7280;font-weight:600;margin-bottom:6px">{lbl}</div><div style="font-size:1.8rem;font-weight:800;color:{col}">{val}</div></div>'
            for lbl,val,col in [("סה\"כ",len(rows),"#1565c0"),("היום",today_count,"#2e7d32"),("השבוע",week_count,"#e65100"),("החודש",month_count,"#6a1b9a")])}
        </div>

        <h3 style="font-size:.95rem;color:#111827;margin:0 0 12px">התפלגות סוגי חשבונות</h3>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:24px">
          <thead><tr style="background:#1565c0">
            <th style="padding:10px 14px;color:#fff;text-align:right;font-size:.82rem">סוג חשבון</th>
            <th style="padding:10px 14px;color:#fff;text-align:center;font-size:.82rem">כמות</th>
            <th style="padding:10px 14px;color:#fff;text-align:center;font-size:.82rem">אחוז</th>
          </tr></thead>
          <tbody>{type_rows}</tbody>
        </table>

        <h3 style="font-size:.95rem;color:#111827;margin:0 0 12px">10 רישומים אחרונים</h3>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:24px">
          <thead><tr style="background:#1565c0">
            <th style="padding:10px 14px;color:#fff;text-align:right;font-size:.82rem">שם</th>
            <th style="padding:10px 14px;color:#fff;text-align:right;font-size:.82rem">טלפון</th>
            <th style="padding:10px 14px;color:#fff;text-align:right;font-size:.82rem">סוג חשבון</th>
            <th style="padding:10px 14px;color:#fff;text-align:right;font-size:.82rem">תאריך</th>
          </tr></thead>
          <tbody>{recent_rows}</tbody>
        </table>

        <p style="font-size:.8rem;color:#9ca3af;text-align:center;margin:0">
          נשלח אוטומטית מ-ALTRIX Dashboard • {now.strftime('%d/%m/%Y %H:%M')}
        </p>
      </div>
    </div>"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Altrix — סיכום רישומים {today}"
    msg["From"]    = smtp_user
    msg["To"]      = to_email
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
        s.login(smtp_user, smtp_pass)
        s.sendmail(smtp_user, to_email, msg.as_bytes())


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/dashboard")
def dashboard():
    key = request.args.get("key", "")
    if key != os.environ.get("DOWNLOAD_KEY", "altrix2024"):
        return "Unauthorized", 401
    return send_from_directory(BASE_DIR, "dashboard.html")


@app.route("/api/stats")
def api_stats():
    key = request.args.get("key", "")
    if key != os.environ.get("DOWNLOAD_KEY", "altrix2024"):
        return jsonify({"error": "unauthorized"}), 401
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM registrations ORDER BY id").fetchall()
    return jsonify({"rows": [dict(r) for r in rows]})


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
    today = datetime.now(ISRAEL_TZ).strftime("%d-%m-%Y")
    return send_file(buf, as_attachment=True,
                     download_name=f"Altrix_{today}.xlsx",
                     mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@app.route("/send-report", methods=["POST"])
def send_report():
    data = request.get_json(force=True)
    if data.get("key") != os.environ.get("DOWNLOAD_KEY", "altrix2024"):
        return jsonify({"error": "unauthorized"}), 401
    to_email = data.get("email", "").strip()
    if not to_email:
        return jsonify({"error": "missing email"}), 400
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM registrations ORDER BY id").fetchall()
    try:
        send_email_report(to_email, rows)
        return jsonify({"ok": True}), 200
    except ValueError as e:
        return jsonify({"error": "המייל לא מוגדר בשרת — ראה הוראות הגדרה"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Startup ───────────────────────────────────────────────────────────────────

def open_browser():
    webbrowser.open("http://localhost:5000")


init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    if port == 5000:
        threading.Timer(1.2, open_browser).start()
    print(f"\nServer: http://localhost:{port}")
    print("Press Ctrl+C to stop\n")
    app.run(host="0.0.0.0", port=port)
