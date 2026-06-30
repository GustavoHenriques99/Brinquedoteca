/* ============================================================
   API — cliente HTTP + utilitários globais
   ============================================================ */

const API_BASE = 'http://localhost:5105';
// Produção: const API_BASE = 'https://brinquedoteca-production.up.railway.app';

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.mensagem ?? data?.title ?? `Erro ${res.status}`);
  return data;
}

const api = {
  get:    (path)       => apiFetch(path),
  post:   (path, body) => apiFetch(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:    (path, body) => apiFetch(path, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  (path, body) => apiFetch(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path)       => apiFetch(path, { method: 'DELETE' }),
};

function toast(msg, tipo = '') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'show ' + tipo;
  clearTimeout(el._t);
  el._t = setTimeout(() => (el.className = ''), 3500);
}

function fmtData(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}
