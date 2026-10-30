export const ROLES = [['ai-engineer', 'AI Engineer'], ['backend', 'Backend'], ['fullstack', 'Full-stack'], ['qa', 'QA']];

const PRESETS = {
  'ai-engineer': ['llm', 'langgraph', 'langchain', 'rag', 'faiss', 'azure openai', 'azure ai foundry', 'agent'],
  backend: ['python', 'fastapi', 'pydantic', 'sql', 'mysql', 'sqlite', 'websockets', 'container apps', 'blob storage'],
  fullstack: ['react', 'vite', 'tailwind', 'framer', 'fastapi', 'websockets', 'python'],
  qa: ['selenium', 'test', 'jira', 'informatica', 'etl', 'regression', 'agile', 'scrum'],
};

/** ?role=backend (a preset) or ?role=langgraph (any word), plus optional ?skills=a,b */
export function readRole() {
  try { return (new URLSearchParams(location.search).get('role') || '').toLowerCase().trim(); } catch { return ''; }
}
export function keywordsFor(role) {
  let extra = [];
  try {
    extra = (new URLSearchParams(location.search).get('skills') || '').toLowerCase().split(',').map((x) => x.trim()).filter((x) => x.length > 1);
  } catch { /* ignore */ }
  const base = role ? (PRESETS[role] || role.split(/[\s,]+/).filter((x) => x.length > 1)) : [];
  return [...base, ...extra];
}
export const hits = (text, kws) => kws.length > 0 && kws.some((k) => String(text).toLowerCase().includes(k));
export const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
