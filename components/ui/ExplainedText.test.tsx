import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ExplainedText } from './ExplainedText';

afterEach(cleanup);

describe('terms in the actual reading', () => {
  it('does not explain Spanish conjunctions and pronouns as functions', () => {
    render(<p><ExplainedText text="Si ninguna imagen te sirve, dejala. Ni una etiqueta ni un destino. Te cuento algo. Se observa una idea." document /></p>);
    expect(screen.getByText(/Si ninguna/)).not.toHaveTextContent('Sensación introvertida');
    expect(screen.getByText(/Si ninguna/)).not.toHaveTextContent('Intuición introvertida');
  });
  it('explains Se, Ni and Ti in prose without changing numbers or confusing ordinary se/ti', () => {
    const { container } = render(<p><ExplainedText text="Se en 18, Ni alto (62) y Ti alto (78). Se trata de algo para ti, no sensor." /></p>);
    expect(screen.getAllByRole('button', { name: /^Qué significa/ })).toHaveLength(3);
    fireEvent.mouseEnter(screen.getAllByRole('button', { name: 'Qué significa Se' })[0]);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Sensación extravertida');
    expect(screen.getByRole('tooltip')).toHaveTextContent('no mide');
    expect(container).toHaveTextContent('Se en 18, Ni alto (62) y Ti alto (78). Se trata');
  });
  it('opens with keyboard or touch and closes with Escape or outside click', () => {
    render(<p><ExplainedText text="Ti y Ni" /></p>);
    const term = screen.getByRole('button', { name: 'Qué significa Ti' });
    fireEvent.focus(term);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Pensamiento introvertido');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
    fireEvent.click(term);
    expect(screen.getByRole('tooltip')).toBeVisible();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
  it('prints explanations without interactive controls or raw markdown', () => {
    render(<p><ExplainedText text="Probá **otra mirada**: Ni." document /></p>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('otra mirada').tagName).toBe('STRONG');
    expect(screen.getByText(/Ni.*Intuición introvertida/)).toBeInTheDocument();
  });
  it('does not reopen under the pointer immediately after Escape', () => {
    render(<ExplainedText text="Se en 18" />);
    const term = screen.getByRole('button', { name: 'Qué significa Se' });
    fireEvent.mouseEnter(term);
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseEnter(term);
    expect(screen.queryByRole('tooltip')).toBeNull();
    fireEvent.mouseLeave(term);
    fireEvent.mouseEnter(term);
    expect(screen.getByRole('tooltip')).toBeVisible();
  });
});
