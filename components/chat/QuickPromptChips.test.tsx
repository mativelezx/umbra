import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { QuickPromptChips } from './QuickPromptChips';
import { DEMO_BIG_FIVE, DEMO_JUNG_FUNCTIONS } from '@/lib/demo/seed';

it('offers concrete questions without injecting scores or claiming measured Jung weaknesses', () => {
  const onPick = vi.fn();
  render(<QuickPromptChips profile={{firstName:null,archetype:'sage',bigFive:DEMO_BIG_FIVE,jungFunctions:DEMO_JUNG_FUNCTIONS}} onPick={onPick}/>);
  expect(screen.getByRole('button', {name:'Quiero entender una decisión'})).toBeVisible();
  for (const button of screen.getAllByRole('button')) fireEvent.click(button);
  expect(onPick).toHaveBeenCalledTimes(4);
  for (const [prompt] of onPick.mock.calls) expect(prompt).not.toMatch(/\b(?:Ni|Ti|Se|Fe)\b|\/100|función dominante|más débil|integrar.*sombra/);
});
