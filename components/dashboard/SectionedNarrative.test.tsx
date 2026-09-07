import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionedNarrative } from './SectionedNarrative';

describe('A reader chooses the pace', () => {
  const content = '## Una mirada\n\nPrimer pasaje completo.\n\n## Otra perspectiva\n\nSegundo pasaje completo.';
  it('opens one section, advances and returns without losing text', () => {
    render(<SectionedNarrative content={content} />);
    expect(screen.getByText('Primer pasaje completo.')).toBeVisible();
    expect(screen.queryByText('Segundo pasaje completo.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /siguiente sección/i }));
    expect(screen.getByText('Segundo pasaje completo.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /sección anterior/i }));
    expect(screen.getByText('Primer pasaje completo.')).toBeVisible();
  });
  it('lets a reader view the full text without hiding any section', () => {
    render(<SectionedNarrative content={content} />);
    fireEvent.click(screen.getByRole('button', { name: /ver lectura completa/i }));
    expect(screen.getByText('Primer pasaje completo.')).toBeVisible();
    expect(screen.getByText('Segundo pasaje completo.')).toBeVisible();
  });
  it('preserves introductory paragraphs before the first heading', () => {
    render(<SectionedNarrative content={'Una introducción que no se puede perder.\n\n' + content} />);
    expect(screen.getByText('Una introducción que no se puede perder.')).toBeVisible();
  });
  it('keeps a legacy unsectioned narrative readable without extra steps', () => {
    render(<SectionedNarrative content="Texto anterior sin títulos." />);
    expect(screen.getByText('Texto anterior sin títulos.')).toBeVisible();
    expect(screen.queryByRole('button', { name: /siguiente sección/i })).not.toBeInTheDocument();
  });
  it('exports every section as a document without reader controls', () => {
    render(<SectionedNarrative content={content} presentation="document" />);
    expect(screen.getByText('Primer pasaje completo.')).toBeVisible();
    expect(screen.getByText('Segundo pasaje completo.')).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
