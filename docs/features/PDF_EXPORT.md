# Feature — PDF Export

## Phase
6

## Route
- `/export` — client component with html2pdf.js

## Critical architecture note

**`html2pdf.js` runs in the browser only** (uses `html2canvas` under the hood).
Cannot execute in Edge or Node runtime. Master doc originally specified an API
route for this, which is wrong. Corrected per [DECISIONS.md ADR-006](../DECISIONS.md):
PDF generation is client-side via `next/dynamic` with `ssr: false`.

## Architecture

```tsx
// app/export/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Html2PdfButton = dynamic(() => import('@/components/export/Html2PdfButton'), {
  ssr: false,
});

export default function ExportPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch profile + narrative + plan + evidence directly from Supabase via client
    fetchAllExportData().then(setData);
  }, []);

  if (!data) return <LoadingPreview />;

  return (
    <div>
      <div id="pdf-root" className="export-print">
        <ExportPreview data={data} />
      </div>
      <Html2PdfButton targetId="pdf-root" filename={`umbra-${data.profile.id}.pdf`} />
    </div>
  );
}
```

No API route. Data loaded directly from Supabase via browser client.

## Print stylesheet (`app/export/print.css`)

html2canvas does NOT render `backdrop-filter`, complex gradients requiring
compositing, or `@media print` overrides reliably. Separate CSS applied only
to the export page:

```css
.export-print {
  /* Override cosmic design tokens for print-safety */
  background: #ffffff;
  color: #1a1a2a;
  font-family: 'Inter', system-ui, sans-serif;
}

.export-print .glass {
  background: #f5f3fa;
  backdrop-filter: none;
  border: 1px solid #d4b3ff;
}

.export-print h1, .export-print h2 {
  font-family: 'Instrument Serif', Georgia, serif;
  color: #3d1575;
}

.export-print .card {
  page-break-inside: avoid;
  break-inside: avoid;
}

@media print {
  .no-print { display: none; }
}
```

Tested in Chrome print preview AND via actual html2pdf output before shipping.

## PDF contents

1. **Cover page**: "Umbra — Tu perfil" + user name + date
2. **Big Five scores** (table or simple bars, not the radar chart — too complex for print)
3. **Jung function scores** (table)
4. **Archetype** (name + description + secondary)
5. **Narrative** (full 800-1200 words, Instrument Serif)
6. **Development plan** (3 areas with actions + micro-goals, not the interactive checkboxes)
7. **Footer**: "Generado por Umbra · Umbra no es terapia · Si estás en crisis: 135 (Argentina) / 911"

Optional (deferred to TODOS): QR code on cover linking to authenticated web view.

## Generation flow

```ts
import html2pdf from 'html2pdf.js';

function generatePdf(element: HTMLElement, filename: string) {
  const options = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['css', 'legacy'] },
  };
  html2pdf().set(options).from(element).save();
}
```

## Testing

- Manual test: generate PDF, visually inspect for layout issues, no broken images, no cut-off text
- Automated: Playwright test that clicks "download PDF", intercepts the download, saves the file, asserts file size > 50KB (sanity check)
- Visual regression: compare generated PDF to a baseline screenshot (optional — not standard for TFG)

## Dependencies

- Profile + narrative + plan all exist
- `html2pdf.js` via `next/dynamic({ ssr: false })`
- Print stylesheet

## Known limitations (documented for user)

- PDF generation is client-side, so it depends on browser capabilities (Chrome/Firefox/Safari all tested)
- PDF does not include the interactive radar chart — too complex for html2canvas; shows scores as a table instead
- PDF does not preserve violet cosmic aesthetic (by design — print stylesheet uses flat palette for rendering safety)

## See also

- [DECISIONS.md ADR-006](../DECISIONS.md) — html2pdf client-side only
- [DASHBOARD.md](DASHBOARD.md) — source of visible data
- [NARRATIVE.md](NARRATIVE.md) — narrative included in PDF
- [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) — plan included in PDF

## Post-implementación (2026-04-14)

Cambios de Fase 3.5 del [IMPLEMENTATION_PLAN.md](../biz/IMPLEMENTATION_PLAN.md).

### Link desde el dashboard

Originalmente `/export` existía pero no había una entrada clara
desde el dashboard — el usuario tenía que conocer la URL. Ahora el
header del `app/dashboard/page.tsx` tiene un botón pill estilo
"Descargar PDF" a la derecha del título "Tu perfil interior", como
un link simple a `/export`:

```tsx
<a
  href="/export"
  className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-violet-400/20 bg-umbra-shadow/30 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-2 transition-all duration-200 hover:border-violet-400/50 hover:bg-violet-400/10 hover:text-text-1"
  aria-label="Descargar perfil en PDF"
>
  <span>Descargar PDF</span>
</a>
```

### Type fix — removed `any` cast

Originalmente `downloadPdf()` hacía `const html2pdf = (html2pdfModule.default as any)`, violando la regla de CLAUDE.md "no any en TypeScript". El fix (commit `a6f97b2`) introduce una interface `Html2PdfChain` que declara el subset de la API que usamos (`.set()`, `.from()`, `.save()`) y narrow el tipo sin escapes:

```ts
interface Html2PdfChain {
  set(options: Record<string, unknown>): Html2PdfChain;
  from(element: HTMLElement): Html2PdfChain;
  save(): Promise<void>;
}

const html2pdfModule = (await import('html2pdf.js')) as unknown as
  | { default: () => Html2PdfChain }
  | (() => Html2PdfChain);
const html2pdf =
  typeof html2pdfModule === 'function'
    ? html2pdfModule
    : html2pdfModule.default;
```

El library html2pdf.js no tiene bundled types, así que declaramos
el contrato mínimo nosotros. `tsc --noEmit` queda clean.

### No otros cambios

La lógica de PDF generation, el print stylesheet, y el flujo
cliente-only siguen siendo los de la Fase 6 del master build.
Ver `app/export/page.tsx` y `app/export/print.css`.

