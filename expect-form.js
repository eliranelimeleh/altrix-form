// "המבחן שלי" trial-expectations form, shared by the client page (expect.html) and the lead card (sales.html).
// Questions come from /api/expect-questions; answers are a flat {id: string | string[]} object.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function render(root, questions, answers) {
    answers = answers || {};
    root.innerHTML = questions.map((q, i) => {
      const a = answers[q.id];
      let field = '';
      if (q.type === 'choice' || q.type === 'multi') {
        const kind = q.type === 'choice' ? 'radio' : 'checkbox';
        field = `<div class="xf-opts">${q.opts.map(o => {
          const on = Array.isArray(a) ? a.includes(o) : a === o;
          return `<label class="xf-opt${on ? ' on' : ''}"><input type="${kind}" name="xf_${q.id}" value="${esc(o)}"${on ? ' checked' : ''}><span>${esc(o)}</span></label>`;
        }).join('')}</div>`;
      } else if (q.type === 'scale') {
        field = `<div class="xf-scale">${Array.from({ length: 10 }, (_, k) => k + 1).map(n =>
          `<label class="xf-dot${String(a) === String(n) ? ' on' : ''}"><input type="radio" name="xf_${q.id}" value="${n}"${String(a) === String(n) ? ' checked' : ''}><span>${n}</span></label>`).join('')}</div>`;
      } else if (q.type === 'datetime') {
        field = `<input class="xf-in" type="datetime-local" name="xf_${q.id}" value="${esc(a || '')}">`;
      } else {
        field = `<textarea class="xf-in" name="xf_${q.id}" rows="3" placeholder="${esc(q.ph || '')}">${esc(a || '')}</textarea>`;
      }
      return `<div class="xf-q"><div class="xf-qh"><span class="xf-n">${i + 1}</span>${esc(q.q)}</div>${field}</div>`;
    }).join('');
    root.querySelectorAll('.xf-opt input, .xf-dot input').forEach(inp => inp.addEventListener('change', () => {
      root.querySelectorAll(`input[name="${inp.name}"]`).forEach(x => x.parentElement.classList.toggle('on', x.checked));
    }));
  }

  function collect(root, questions) {
    const out = {};
    questions.forEach(q => {
      const els = [...root.querySelectorAll(`[name="xf_${q.id}"]`)];
      if (q.type === 'multi') out[q.id] = els.filter(e => e.checked).map(e => e.value);
      else if (q.type === 'choice' || q.type === 'scale') out[q.id] = (els.find(e => e.checked) || {}).value || '';
      else out[q.id] = (els[0] || {}).value || '';
    });
    return out;
  }

  // Read-only summary for the CRM: the questions that matter most for the summary call come first.
  function card(questions, answers, meta) {
    if (!answers || !Object.values(answers).some(v => (Array.isArray(v) ? v.length : v))) return '<div class="xf-empty">עוד לא מולא תיאום ציפיות לליד הזה.</div>';
    const byId = Object.fromEntries(questions.map(q => [q.id, q]));
    const show = v => Array.isArray(v) ? v.map(x => `<span class="xf-chip">${esc(x)}</span>`).join('') : esc(v);
    const when = v => { if (!v || !v.includes('T')) return esc(v); const [d, t] = v.split('T'); const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y} ${t.slice(0, 5)}`; };
    const row = (id, label) => {
      const v = answers[id]; if (!v || (Array.isArray(v) && !v.length)) return '';
      return `<div class="xf-row"><div class="xf-l">${esc(label || byId[id].q)}</div><div class="xf-v">${id === 'summary_call' ? when(v) : show(v)}</div></div>`;
    };
    const r = +answers.readiness || 0;
    const flags = [];
    if (answers.decide && answers.decide !== 'רק אני') flags.push(`שותף להחלטה: ${esc(answers.decide)}${answers.partner_join === 'כן' ? ' · מצטרף לשיחת הסיכום' : ' · לתאם שיצטרף לשיחת הסיכום'}`);
    if ((answers.concern || []).length && !(answers.concern || []).includes('אין לי חשש מיוחד')) flags.push('חשש מרכזי: ' + answers.concern.map(esc).join(', '));
    if (!answers.summary_call) flags.push('לא נקבע מועד לשיחת סיכום');
    return `<div class="xf-card">
      <div class="xf-top"><div><div class="xf-t">🎯 המבחן של הלקוח</div><div class="xf-m">${meta && meta.filled_by === 'client' ? 'מולא על ידי הלקוח' : 'מולא על ידי הנציג'}${meta && meta.updated_at ? ' · ' + esc(meta.updated_at) : ''}</div></div>
        ${r ? `<div class="xf-ready" style="--p:${r * 10}%"><b>${r}</b><small>/10 מוכנות</small></div>` : ''}</div>
      ${answers.success ? `<div class="xf-goal">"${esc(answers.success)}"<small>מה יגרום לו להגיד "זה בשבילי"</small></div>` : ''}
      ${flags.length ? `<div class="xf-flags">${flags.map(f => `<div>⚑ ${f}</div>`).join('')}</div>` : ''}
      ${row('why', 'למה עכשיו')}${row('system', 'מערכת שמעניינת')}${row('check', 'מה חשוב לבדוק')}${row('budget', 'סכום התחלה')}${row('summary_call', 'שיחת סיכום')}${row('contact', 'עדכונים')}
    </div>`;
  }

  window.ExpectForm = { render, collect, card };
})();
