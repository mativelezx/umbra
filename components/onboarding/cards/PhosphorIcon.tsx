'use client';

import type { Icon } from '@phosphor-icons/react';
import {
  ArrowRight,
  Brain,
  Compass,
  Eye,
  Heart,
  Lightning,
  Mountains,
  PaintBrush,
  Path,
  Question,
  ShieldStar,
  Sparkle,
  Sun,
  Target,
  Tree,
  Umbrella,
  UsersThree,
  Waves,
} from '@phosphor-icons/react';

/**
 * Curated lookup of Phosphor icons available for dynamic onboarding cards.
 * The conductor prompt may include any `iconHint` string, but only names
 * in this map render — unknown names fall back to `Sparkle`. Keep this
 * list short and visually distinct.
 */
const MAP: Record<string, Icon> = {
  ArrowRight,
  Brain,
  Compass,
  Eye,
  Heart,
  Lightning,
  Lighthouse: Sun, // Phosphor lacks a dedicated lighthouse glyph
  Mountains,
  PaintBrush,
  Path,
  Question,
  ShieldStar,
  Sparkle,
  Sun,
  Target,
  Tree,
  Umbrella,
  UsersThree,
  Waves,
};

interface PhosphorIconProps {
  name: string;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}

export function PhosphorIcon({
  name,
  size = 20,
  weight = 'regular',
  className,
}: PhosphorIconProps) {
  const Cmp = MAP[name] ?? Sparkle;
  return <Cmp size={size} weight={weight} className={className} />;
}
