// PER-VIDEO: word timings (seconds) from scripts/transcribe.py, spelling corrected by hand. "|" starts a new caption chunk.
// A leading "*" marks a highlighted (gold) word.
const RAW = `
גם@1.56 הגרף@2.06 שלכם@2.46 | נראה@2.90 *ככה?@3.38 | אוי@4.16 ואי@4.72 ואי@5.16 | חבר'ה@5.82 *תתקדמו@6.62 |
תעברו@7.62 למסחר@8.14 *אוטומטי@8.54 | הרובוט@9.68 של@10.14 *הזהב@10.28 שלנו@10.74 | כל@11.26 *היום@12.12 |
*פותח@12.64 *וסוגר@13.20 עסקאות@13.82 | בצורה@14.44 *אוטומטית@14.94 לחלוטין@15.72 | לא@16.58 צריך@16.80 להתעסק@17.00 |
בזה@17.68 *בכלל@18.00 | הוא@18.64 פותח@19.04 וסוגר@19.48 | את@20.02 כל@20.14 העסקאות@20.30 | *לבד@20.94 | *לבד@21.92 | *לבד!@22.28 |
כמובן@22.52 יש@22.90 לנו@23.00 כאן@23.12 | תיק@23.30 *לייב@23.60 | שכבר@23.94 עשה@24.22 | *16,000$@24.48 |
עם@25.82 *אפס@26.28 התעסקות@26.80 | במסחר@27.30 | רק@28.22 מדי@28.50 פעם@28.84 | *מסתכלים@29.10 |
רואים@29.72 כמה@30.08 *מייצר@30.34 | כמה@30.94 הוא@31.16 עשה@31.26 | אבל@31.66 חוץ@32.00 מזה@32.24 |
לא@32.48 מתעסקים@32.68 בזה@33.24 בכלל@33.46 | כי@33.92 הרובוט@34.02 עושה@34.36 | את@34.64 כל@34.74 הפעולות@34.88 *לבד@35.40 |
הוא@35.88 *קונה@36.10 *ומוכר@36.38 | *קונה@36.86 *ומוכר@37.08 | אז@37.60 חבר'ה@37.88 | אם@38.32 אתם@38.62 רוצים@38.80 |
לנסות@39.04 את@39.36 הרובוט@39.50 | של@39.84 *הזהב@39.96 שלנו@40.32 | *בחינם@40.68 | *לעשרה@41.72 *ימים@42.32 |
הצטרפו@42.80 לקבוצת@43.44 | *הוואטסאפ@43.82 שלנו@44.20 | אני@44.54 מצרף@44.62 לכם@44.94 | כאן@45.18 *קישור@45.40 |
תהנו@46.04 חבר'ה@46.60 | זה@46.88 *בחינם@46.98 | לעשרה@47.46 ימים@47.90 | אל@48.22 *תפספסו@48.34 את@48.92 זה@49.04 |
קודם@49.30 כל@49.64 *תנסו@49.78 | *תבדקו@50.38 | ואחרי@51.10 זה@51.34 תראו@51.40 | אם@51.64 זה@51.70 מתאים@51.80 לכם@52.06 |
*בהצלחה@52.70 | תנו@53.24 *בראש!@53.34
`;
export const SPEECH_END = 53.9;

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
