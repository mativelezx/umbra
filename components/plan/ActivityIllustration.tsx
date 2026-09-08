/** Decorative activity scene; the bottom track mirrors only saved checkboxes. */
export function ActivityIllustration({ title, completed, total }: { title: string; completed: number; total: number }) {
  const walking = /camin|paseo|aire libre/i.test(title);
  const meal = /comer|comida|cocin|sabore/i.test(title);
  const writing = /journal|escrib|diario|registro|nota/i.test(title);
  const conversation = /conversa|ayuda|escucha|charla|vínculo|vinculo/i.test(title);
  const progress = total > 0 ? Math.min(100, Math.max(0, completed / total * 100)) : 0;
  return <svg className={`activity-illustration activity-illustration-${walking ? 'walk' : meal ? 'meal' : writing ? 'write' : conversation ? 'talk' : 'open'}`} viewBox="0 0 240 160" fill="none" aria-hidden="true" focusable="false">
    {walking ? <>
      <path d="M28 104q38-52 74-8t107-21M39 54l14-23 14 23M170 55l13-22 13 22" stroke="currentColor" strokeWidth="1.5" />
      <path d="m95 74 7-17c5-11 17-5 12 6l-7 16Zm34 25 7-17c5-11 17-5 12 6l-7 16Z" fill="currentColor" />
      <circle cx="94" cy="88" r="5" fill="currentColor" /><circle cx="128" cy="114" r="5" fill="currentColor" />
      <circle cx="153" cy="28" r="11" stroke="currentColor" strokeWidth="1.5" />
    </> : meal ? <>
      <circle cx="121" cy="70" r="49" stroke="currentColor" strokeWidth="1.5" /><circle cx="121" cy="70" r="37" stroke="currentColor" strokeWidth="1.5" />
      <path d="M47 34v28m9-28v28m9-28v28M47 62q9 17 18 0M56 76v41M190 72v45" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="190" cy="50" rx="11" ry="22" stroke="currentColor" strokeWidth="2" />
      <path d="M102 88q0-42 39-38-3 40-39 38Z" fill="currentColor" />
    </> : writing ? <>
      <path d="M45 37q37-8 72 9 33-17 75-9v78q-40-8-75 9-35-17-72-9ZM117 46v78" stroke="currentColor" strokeWidth="1.5" />
      {[0, 1, 2].map(i => <path key={i} d={`M60 ${58 + i * 16}q19-1 40 8m35-8h38`} stroke="currentColor" strokeWidth="1.5" />)}
      <path d="m167 94 33-74 10 4-33 74-12 12Z" fill="currentColor" />
    </> : conversation ? <>
      <path d="M30 61a39 30 0 0 1 78-1c0 18-18 30-40 30H48L28 105l6-26Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M129 76a39 30 0 0 1 78-1l4 17 3 23-21-14h-23c-24 0-41-9-41-25Z" fill="currentColor" />
      <path d="M50 58h38M50 70h26M115 34v14M108 41h14" stroke="currentColor" strokeWidth="1.5" />
    </> : <>
      <path d="M48 119V69a53 53 0 0 1 106 0v50M65 119V69a36 36 0 0 1 72 0v50M28 120H209M149 83h48m-12-12 12 12-12 12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="183" cy="35" r="10" fill="currentColor" />
    </>}
    <path d="M40 146H200" stroke="currentColor" opacity=".2" strokeWidth="2" />
    <path className="activity-progress-line" d="M40 146H200" pathLength="100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100 - progress} />
  </svg>;
}
