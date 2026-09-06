import { afterEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QuestionCard } from './QuestionCard';
import { DEMO_ONBOARDING_SCRIPT } from '@/lib/demo/onboarding-script';

afterEach(() => vi.restoreAllMocks());

it('preserves an answer during a request and focuses the heading only when the question changes', () => {
  const scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
  const onSubmit = vi.fn();
  const firstQuestion = DEMO_ONBOARDING_SCRIPT[0].question;
  const secondQuestion = DEMO_ONBOARDING_SCRIPT[1].question;
  const { rerender } = render(<QuestionCard question={firstQuestion} onSubmit={onSubmit} submitting={false} />);
  const input = screen.getByRole('textbox');
  input.focus();
  fireEvent.change(input, { target: { value: 'Conservar esta respuesta ante un error recuperable.' } });
  rerender(<QuestionCard question={firstQuestion} onSubmit={onSubmit} submitting />);
  expect(input).toHaveValue('Conservar esta respuesta ante un error recuperable.');
  expect(input).toHaveFocus();
  expect(scrollIntoView).not.toHaveBeenCalled();
  rerender(<QuestionCard question={secondQuestion} onSubmit={onSubmit} submitting={false} />);
  expect(screen.getByRole('heading', { name: secondQuestion.prompt })).toHaveFocus();
  expect(scrollIntoView).toHaveBeenCalledOnce();
});
