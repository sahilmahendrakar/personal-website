// Tiny Python highlighter for the post's one code block. Runs at build time, no dependency.
const KEYWORDS = new Set([
  'and', 'as', 'async', 'await', 'class', 'def', 'elif', 'else', 'for', 'from', 'if', 'import', 'in', 'is',
  'lambda', 'not', 'or', 'pass', 'return', 'while', 'with', 'yield',
]);
const CONSTANTS = new Set(['True', 'False', 'None', 'self']);

const TOKEN =
  /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(@[\w.]+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)/g;

type Tok = { text: string; cls?: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let last = 0;
  let prevWord = '';
  for (const m of src.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: src.slice(last, i) });
    const [text, comment, str, deco, num, call, word] = m;
    let cls: string | undefined;
    if (comment) cls = 'c';
    else if (str) cls = 's';
    else if (deco) cls = 'd';
    else if (num) cls = 'n';
    else if (call) cls = prevWord === 'def' || prevWord === 'class' ? 'fn' : 'call';
    else if (word) cls = KEYWORDS.has(word) ? 'k' : CONSTANTS.has(word) ? 'b' : prevWord === 'class' ? 'fn' : undefined;
    out.push({ text, cls });
    if (call || word) prevWord = call || word;
    last = i + text.length;
  }
  if (last < src.length) out.push({ text: src.slice(last) });
  return out;
}

export function PyCode({ code }: { code: string }) {
  return (
    <pre className="hl">
      <code>
        {tokenize(code).map((t, i) =>
          t.cls ? (
            <span key={i} className={`t-${t.cls}`}>
              {t.text}
            </span>
          ) : (
            t.text
          ),
        )}
      </code>
    </pre>
  );
}
