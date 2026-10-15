# סדרה: "כל האמת על הכסף שלכם" (4 חלקים)

סדרת רילס לעמוד של אלירן אלימלך (@eliran_elimeleh). התוכן מבוסס אך ורק על הסרטון
"The Untold Truth About Money" של James Jani (youtube.com/watch?v=6mRbDEtDoyA), לפי הפרקים שלו:

| חלק | קובץ | מקור בסרטון |
|-----|------|-------------|
| 1 – השקר שמכרו לכם | `src/m1.json` | Prologue + Part 1: The Lies You've Been Fed |
| 2 – האמת על כסף | `src/m2.json` | Part 2: The Truth About Money & Wealth |
| 3 – הסוד שהופך פתרון להון | `src/m3.json` | Part 3: A Problem Worth Solving + Part 4: The Reward |
| 4 – הכסף או החיים | `src/m4.json` | Part 5: Your Money or Your Life + Conclusion |

כל חלק נגמר בטיזר לחלק הבא ובכרטיס פרופיל עם לחיצה על "עקבו". החלק האחרון נגמר בסיכום המשוואה ובקריאה לשתף.

## סגנון עריכה (שונה מרילס ALTRIX)
מנוע נפרד ב-`src/money/` (לא משתמש ב-`engine.js` של ALTRIX):
- **צילומים אמיתיים של אנשים** מ-Mixkit (רישיון Free בלבד, לא "Restricted"; מותר לשימוש מסחרי בלי קרדיט).
  `tools/mixkit.py` מחפש, `tools/footage.py` חותך לאנכי 720x1280 ב-30fps עם גריידינג קולנועי.
- שחור-זהב (כמו הטבעת בתמונת הפרופיל), Rubik ו-Frank Ruhl Libre, גריין, וינייטה ודליפות אור.
- כתוביות קריוקי: מילה-מילה, המילה המדוברת על בלוק זהב (אדום למילים שליליות).
- מעברים: zoom-blur, whip, push, iris, split, glitch, flash, blur; מכות מצלמה עם RGB split.
- מוזיקה אמיתית מ-Mixkit (Free license) שמתחלפת בין קטעים מהירים לאיטיים לפי הסצנה, עם drop (שקט לפני גילוי),
  low-pass למתח, ducking מתחת לקול, ואפקטים קוליים (`tools/audio_money.py`).

## בנייה
```
export ELEVENLABS_API_KEY=...        # קול "אלירן 2"
./build_money.sh m1 m2 m3 m4          # קול -> פריימים -> מיקס -> out/money_<id>.mp4
node tools/render.mjs m1 --stills cta@0.8   # תמונות בדיקה
```
`build_money.sh` מוריד/מכין את הפוטג' אם חסר (`python3 tools/footage.py` אחרי הורדת הקליפים ל-`build/footage/raw/`),
ומעתיק כל חלק מוכן ל-`ALTRIX VIDEOS BY CLAUDE/כל האמת על הכסף שלכם/`.
המוזיקה והאפקטים יורדים ל-`build/audio/{music,sfx}` (מזהי Mixkit: מוזיקה 404, 283, 281, 369, 614, 680, 682, 839, 846, 587, 871, 188).

בכל סצנה (`src/money/scenes_<id>.js`): `draw(ctx, s)`, `trans`, `events(s)` לאפקטים קוליים, ו-`music(s)` לרמזי מוזיקה:
`{track, from, gain, fade}` מחליף את המוזיקה, `{fx:'drop', dur}` משתיק, `{fx:'lpf', dur}` עמעום.
