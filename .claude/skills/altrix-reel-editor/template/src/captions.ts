// PER-VIDEO: word timings (seconds) from scripts/transcribe.py, spelling corrected by hand. "|" starts a new caption chunk.
// A leading "*" marks a highlighted (gold) word.
const RAW = `
איזה@0.0 *טירוף!@0.2 *טירוף!@0.8 | הרובוט@1.1 של@1.3 *הזהב@1.4 | ממשיך@1.7 *להדפיס@2.1 *כסף@2.4 |
*1,200$@2.9 מתחילת@3.5 השבוע@3.9 | וזה@4.3 כמובן@4.7 | רק@5.1 *ההתחלה@5.3 |
והדבר@5.8 הכי@6.1 יפה@6.5 | שזה@6.9 הכל@7.0 קורה@7.2 | בצורה@7.3 *אוטומטית@7.6 לחלוטין@8.2 |
*אפס@8.6 התעסקות@9.1 במסחר@9.4 | בכלל@9.8 לא@9.9 נוגעים@10.0 בזה@10.2 | הכל@10.4 קורה@10.6 *לבד@10.9 |
הבוט@11.2 פותח@11.3 וסוגר@11.7 | פותח@12.1 וסוגר@12.4 | את@12.8 כל@12.9 העסקאות@13.0 |
בצורה@13.3 *אוטומטית@13.5 לחלוטין@13.9 | ניתן@14.4 לראות@14.6 כאן@14.9 | בהיסטוריה@15.0 |
נלך@15.5 מתחילת@15.7 *החודש@16.0 | ל-Last Month@16.4 | ניתן@17.1 לראות@17.4 | *10,813$@17.6 |
מתחילת@19.3 *החודש@19.7 | כמובן@20.1 תיק@20.5 *לייב@20.9 | לא@21.4 תיק@21.5 *דמו@21.8 |
וחברים@22.3 | הדבר@22.8 הכי@23.0 *שווה@23.2 | אני@23.6 מצרף@23.7 לכם@23.9 | *קישור@24.3 |
לקבוצת@25.0 *הוואטסאפ@25.4 שלנו@25.7 | בקבוצה@26.2 אתם@26.5 יכולים@26.7 | לעקוב@26.8 אחר@27.1 *התוצאות@27.3 |
של@27.6 הרובוט@27.7 | *והמתנה@28.0 הכי@28.6 שווה@28.9 | שאני@29.1 נותן@29.2 לכם@29.4 |
כי@29.6 בכל@29.7 יום@29.9 | יש@30.0 *מאות@30.1 מצטרפים@30.4 חדשים@30.7 | אני@31.1 נותן@31.3 לכם@31.4 *בחינם@31.6 |
את@32.1 הרובוט@32.2 לניסיון@32.5 | *לעשרה@33.1 ימי@33.5 *ניסיון@33.6 | כדי@34.0 שגם@34.1 אתם@34.3 |
תחוו@34.6 את@35.0 *ההצלחה@35.1 | ותהנו@35.4 ממנו@35.7 | וגם@36.0 אתם@36.2 תוכלו@36.4 לראות@36.6 |
אם@36.8 זה@36.85 מתאים@36.9 לכם@37.1 | כי@37.4 הרובוט@37.5 *בחינם@37.9 | *לעשרה@38.4 *ימים@38.8 |
אז@39.0 למה@39.1 אתם@39.3 מחכים@39.35 | חבר'ה?@39.5 | מחכים@39.9 לכם@40.2 *בקבוצה@40.3 | *ניפגש!@40.9
`;
export const SPEECH_END = 41.6;

export type Word = {text: string; start: number; end: number; hi: boolean};
export type Chunk = {words: Word[]; start: number; end: number};

const parse = (): Chunk[] => {
  const groups = RAW.trim().split('|').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const flat: {text: string; start: number; hi: boolean; g: number}[] = [];
  groups.forEach((g, gi) =>
    g.forEach((tok) => {
      const [t, s] = tok.split('@');
      const hi = t.startsWith('*');
      flat.push({text: hi ? t.slice(1) : t, start: parseFloat(s), hi, g: gi});
    }),
  );
  const chunks: Chunk[] = groups.map(() => ({words: [], start: 0, end: 0}));
  flat.forEach((w, i) => {
    const next = flat[i + 1];
    const end = next ? Math.min(next.start, w.start + 1.2) : SPEECH_END;
    chunks[w.g].words.push({text: w.text, start: w.start, end, hi: w.hi});
  });
  chunks.forEach((c, i) => {
    c.start = c.words[0].start;
    const nextStart = chunks[i + 1]?.words[0].start ?? SPEECH_END;
    c.end = Math.min(nextStart, c.words[c.words.length - 1].end + 0.6);
  });
  return chunks;
};
export const CHUNKS = parse();
