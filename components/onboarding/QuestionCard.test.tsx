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

it('focuses and scrolls to the visible scene when advancing into a scenario', () => {
  const scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
  const onSubmit = vi.fn();
  const scenario = DEMO_ONBOARDING_SCRIPT.find(step => step.question.type === 'scenario')?.question;
  if (!scenario || scenario.type !== 'scenario') throw new Error('Scenario fixture missing');
  const { rerender } = render(<QuestionCard question={DEMO_ONBOARDING_SCRIPT[0].question} onSubmit={onSubmit} submitting={false} />);
  screen.getByRole('textbox').focus();
  rerender(<QuestionCard question={scenario} onSubmit={onSubmit} submitting={false} />);
  expect(screen.getByRole('heading', { name: scenario.scene })).toHaveFocus();
  expect(scrollIntoView).toHaveBeenCalledOnce();
});
