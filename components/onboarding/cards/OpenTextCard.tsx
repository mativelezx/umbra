'use client';

import { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { wordCount } from '@/lib/utils';
import type { OpenTextAnswer, OpenTextQuestion } from '@/types';

interface OpenTextCardProps {
  question: OpenTextQuestion;
  onSubmit: (answer: OpenTextAnswer) => void;
  submitting: boolean;
}

export function OpenTextCard({ question, onSubmit, submitting }: OpenTextCardProps) {
  const [text, setText] = useState('');
  const count = wordCount(text);
  const valid = count >= question.minWords && count <= question.maxWords;

  function handleSubmit() {
    if (!valid || submitting) return;
    onSubmit({
      questionId: question.id,
      type: 'open_text',
      answeredAt: new Date().toISOString(),
      text: text.trim(),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h2 className="font-display text-3xl italic text-text-1 md:text-4xl">
          {question.prompt}
        </h2>
        {question.helper && (
          <p className="font-body text-sm text-text-3">{question.helper}</p>
        )}
      </header>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={question.placeholder}
        minWords={question.minWords}
        showCount
        aria-label={question.prompt}
        maxLength={4800}
      />

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!valid}
          loading={submitting}
        >
          Continuar
          <ArrowRight size={18} weight="bold" />
        </Button>
      </div>
    </div>
  );
}
