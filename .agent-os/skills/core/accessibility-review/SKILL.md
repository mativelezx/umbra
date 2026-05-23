---
name: accessibility-review
description: 'Review important UI for accessibility and usability before shipping. Trigger after building or changing meaningful UI, onboarding, forms, dashboards, navigation, modals, drag/drop, mobile surfaces, or when the user mentions accessibility, WCAG, keyboard, focus, contrast, mobile, text overlap, motion, or usability polish.'
---

# Accessibility Review

Use this skill as a verification pass for important UI.

## Standard

Target WCAG 2.2 AA unless the project profile specifies a stricter rule.

## Check

1. Keyboard path: every interactive element can be reached and used.
2. Focus: visible, not obscured, and logical after actions/modals.
3. Target size: mobile/touch controls are comfortable and stable.
4. Contrast: text/icons/buttons are readable in normal and degraded states.
5. Structure: headings, labels, landmarks, and form errors are meaningful.
6. Motion: animation is not required to understand or operate the feature.
7. Text/layout: no overlap, truncation of critical labels, or shifting controls.
8. States: loading, empty, error, disabled, and degraded states remain usable.

## Evidence

For important surfaces, provide:

- Desktop and mobile screenshot or browser QA note.
- Keyboard/focus result.
- Issues found and files changed, or a clear "no issues found" note.

Do not add a separate design system. Apply project rules first.
