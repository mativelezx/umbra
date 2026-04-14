import type {
  MetaphorQuestion,
  MultiChoiceQuestion,
  OnboardingQuestion,
  OnboardingTurn,
  PolarityQuestion,
  RankingQuestion,
  ScenarioQuestion,
} from '@/types';

/**
 * Converts a completed dynamic transcript into the shape `/api/analyze`
 * expects (`{ texts[], areas[] }`). Each turn becomes one `texts[i]`
 * entry describing what was asked and what the user chose, so the
 * analyzer prompt can synthesize the canonical profile from a rich,
 * structured input instead of having to re-parse raw UI state.
 */
export function serializeDynamicTranscript(turns: OnboardingTurn[]): {
  texts: string[];
  areas: string[];
} {
  const texts: string[] = [];
  const areas: string[] = [];
  for (const t of turns) {
    if (!t.answer) continue;
    areas.push(formatArea(t.question));
    texts.push(formatTurn(t));
  }
  return { texts, areas };
}

function formatArea(q: OnboardingQuestion): string {
  if (q.probe.kind === 'big_five') return `Big Five: ${q.probe.dimension}`;
  if (q.probe.kind === 'jung') return `Jung: ${q.probe.func}`;
  if (q.probe.kind === 'archetype') return `Arquetipo: ${q.probe.candidate}`;
  return 'Apertura';
}

function formatTurn(t: OnboardingTurn): string {
  const q = t.question;
  const a = t.answer;
  if (!a) return '';
  const header = `[Pregunta] ${q.prompt}`;
  switch (a.type) {
    case 'open_text':
      return `${header}\n[Respuesta libre]\n${a.text}`;
    case 'multi_choice': {
      const sel = (q as MultiChoiceQuestion).options
        .filter((o) => a.selectedIds.includes(o.id))
        .map((o) => `"${o.label}" (${o.meaning})`)
        .join(', ');
      return `${header}\n[Selección] ${sel}`;
    }
    case 'scenario': {
      const sq = q as ScenarioQuestion;
      const opt = sq.options.find((o) => o.id === a.selectedId);
      return `${header}\n[Escena] ${sq.scene}\n[Elección] "${opt?.label ?? '—'}" (${opt?.meaning ?? ''})`;
    }
    case 'ranking': {
      const rq = q as RankingQuestion;
      const ordered = a.orderedIds
        .map((id) => {
          const it = rq.items.find((i) => i.id === id);
          return `"${it?.label ?? '—'}" (${it?.meaning ?? ''})`;
        })
        .join(' > ');
      return `${header}\n[Ranking] ${ordered}`;
    }
    case 'polarity': {
      const pq = q as PolarityQuestion;
      const which =
        a.value < 40
          ? pq.leftPole.label
          : a.value > 60
            ? pq.rightPole.label
            : 'punto medio';
      const meaning = a.value < 40 ? pq.leftPole.meaning : pq.rightPole.meaning;
      return `${header}\n[Polaridad ${a.value}/100] ${which} (${meaning})`;
    }
    case 'metaphor': {
      const mq = q as MetaphorQuestion;
      const card = mq.cards.find((c) => c.id === a.selectedId);
      return `${header}\n[Metáfora] "${card?.title ?? '—'}" — ${card?.description ?? ''} (${card?.meaning ?? ''})`;
    }
  }
}

/**
 * Rough serialized-length helper (chars) for rate-limit estimation.
 */
export function transcriptCharLength(turns: OnboardingTurn[]): number {
  let total = 0;
  for (const t of turns) {
    total += t.question.prompt.length;
    if (t.answer) {
      if (t.answer.type === 'open_text') total += t.answer.text.length;
      else total += 40;
    }
  }
  return total;
}
