/** Three sheets: a story, its interpretation and a possible action. Not a score. */
export function ReflectionDiagram() {
  return <svg className="reflection-diagram" viewBox="0 0 420 300" fill="none" aria-hidden="true" focusable="false">
    <path className="reflection-thread" d="M26 244C76 271 117 269 175 226S302 126 390 57" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" />
    <g className="reflection-sheet reflection-sheet-back">
      <path d="m68 61 166-25 29 193-166 25Z" fill="#8b9383" />
      <path d="m93 87 88-13m-83 35 114-17m-109 40 91-14m-87 36 113-17" stroke="#20231e" strokeWidth="2" />
    </g>
    <g className="reflection-sheet reflection-sheet-front">
      <path d="M134 42h168v205H134Z" fill="#f4f3ec" />
      <path d="M153 66h39m-39 164h129" stroke="#272c25" strokeWidth="1.5" />
      <g className="reflection-aperture">
        <path d="M218 88a52 52 0 0 0 0 104V88Z" fill="#272c25" />
        <path d="M231 88a52 52 0 0 1 0 104V88Z" fill="#a1ac95" />
        <path d="M165 140h118" stroke="#f4f3ec" strokeWidth="2" />
      </g>
    </g>
    <g className="reflection-sheet reflection-sheet-action">
      <path d="m287 170 82 14-16 91-82-14Z" fill="#c9d1bd" />
      <path d="m291 222 15 19 34-35" stroke="#272c25" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g className="reflection-spark" stroke="currentColor" strokeWidth="1.5"><path d="M334 37v28m-14-14h28M39 169v18m-9-9h18" /></g>
  </svg>;
}
