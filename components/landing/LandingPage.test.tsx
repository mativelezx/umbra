import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { getByRole, within } from '@testing-library/react';
import LandingPage from '@/app/page';

afterEach(() => {
  vi.unstubAllEnvs();
  document.body.replaceChildren();
});

function landingDocument() {
  document.body.innerHTML = renderToStaticMarkup(<LandingPage />);
  return document;
}

describe('landing activity entry', () => {
  it('explains a concrete entry point, optional questionnaire and separate ML limits', () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
    const page = landingDocument();
    expect(getByRole(page.body, 'heading', { level: 1 })).toHaveTextContent('Tu cabeza, en palabras.');
    expect(page.body).toHaveTextContent('30 afirmaciones');
    expect(page.body).toHaveTextContent('cinco promedios de 1 a 5');
    expect(page.body).toHaveTextContent('Completar el cuestionario no valida ese modelo');
    expect(page.body).toHaveTextContent('A estas imágenes se las llama arquetipos');
    expect(within(page.body).getAllByRole('link', { name: 'Empezar a conocerme' }).every(link => link.getAttribute('href') === '/register')).toBe(true);
    expect(page.body).not.toHaveTextContent('anclados en psicología seria');
  });
  it('sends visitors to registration when the example environment is disabled', () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
    const document = landingDocument();
    const activities = getByRole(document.body, 'region', { name: 'Actividades de reflexión' });

    expect(within(activities).getByRole('link', { name: /Crear una cuenta/ })).toHaveAttribute('href', '/register');
    expect(within(activities).queryByRole('link', { name: /Ver actividades de ejemplo/ })).not.toBeInTheDocument();
  });

  it('opens the existing activity example when the example environment is enabled', () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true');
    const document = landingDocument();
    const activities = getByRole(document.body, 'region', { name: 'Actividades de reflexión' });

    expect(within(activities).getByRole('link', { name: /Ver actividades de ejemplo/ })).toHaveAttribute('href', '/plan');
    expect(within(activities).queryByRole('link', { name: /Crear una cuenta/ })).not.toBeInTheDocument();
  });
});
