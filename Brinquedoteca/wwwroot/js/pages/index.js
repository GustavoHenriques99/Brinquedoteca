/* ============================================================
   INDEX — lógica da página
   ============================================================ */

const funcionario = JSON.parse(sessionStorage.getItem('funcionario') || '{"id":1}');

let todosAlunos  = [];
let todosEmps    = [];
let sortDir      = 'asc';

// ── Paginação ──
const POR_PAG = 15;
let pagAlunos = 1;
let pagEmp    = 1;
let listaAlunosFiltrada = [];
let listaEmpAtiva       = [];

async function recarregar() {
  await Promise.all([carregarCards(), carregarEmprestimos(), carregarAlunos()]);
}

async function carregarCards() {
  try {
    const [itens, alunos, emps] = await Promise.all([
      api.get('/api/Item'), api.get('/api/Aluno'), api.get('/api/Emprestimo')
    ]);
    todosAlunos = alunos;
    todosEmps   = emps;
    const hoje  = new Date();
    const ativos = emps.filter(e => !e.finalizado);
    document.getElementById('cItens').textContent   = itens.length;
    document.getElementById('cAlunos').textContent  = alunos.length;
    document.getElementById('cEmp').textContent     = ativos.length;
    document.getElementById('cAtraso').textContent  = ativos.filter(e => new Date(e.dataPrevistaDevolucao) < hoje).length;
    // Filtro turmas
    const turmas = [...new Set(alunos.map(a => a.turma?.nomeTurma).filter(Boolean))].sort();
    document.getElementById('filtroTurma').innerHTML =
      '<option value="">Todas as turmas</option>' +
      turmas.map(t => `<option value="${t}">${t}</option>`).join('');
  } catch(e) { toast('Erro ao carregar dados.', 'error'); }
}

// ── EMPRÉSTIMOS ────────────────────────────────────────────
async function carregarEmprestimos() {
  try {
    const emps = await api.get('/api/Emprestimo');
    listaEmpAtiva = emps.filter(e => !e.finalizado);
    pagEmp = 1;
    renderEmprestimos();
  } catch(e) {
    document.getElementById('tabelaEmpContainer').innerHTML =
      `<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i> Erro.</div>`;
  }
}

function renderEmprestimos() {
  const c    = document.getElementById('tabelaEmpContainer');
  const bar  = document.getElementById('pagBarEmp');
  const hoje = new Date();

  if (!listaEmpAtiva.length) {
    c.innerHTML = `<div class="empty-state"><i class="fa-solid fa-box-open"></i> Nenhum empréstimo ativo.</div>`;
    bar.style.display = 'none';
    return;
  }

  const total  = listaEmpAtiva.length;
  const pages  = Math.ceil(total / POR_PAG);
  if (pagEmp > pages) pagEmp = pages;

  const inicio = (pagEmp - 1) * POR_PAG;
  const fatia  = listaEmpAtiva.slice(inicio, inicio + POR_PAG);

  bar.style.display = pages > 1 ? 'flex' : 'none';
  document.getElementById('pagEmpInfo').textContent  = `Página ${pagEmp} de ${pages} (${total} registros)`;
  document.getElementById('pagEmpPrev').disabled     = pagEmp === 1;
  document.getElementById('pagEmpNext').disabled     = pagEmp === pages;

  c.innerHTML = `<div class="table-scroll"><table><thead><tr>
    <th>Aluno</th><th>RA</th><th>Turma</th><th>Item</th>
    <th>Devolução Prevista</th><th>Status</th><th>Ações</th>
  </tr></thead><tbody>
    ${fatia.map(e => {
      const atrasado  = new Date(e.dataPrevistaDevolucao) < hoje;
      const nomeAluno = e.aluno ? `${e.aluno.nome} ${e.aluno.sobrenome}` : `Aluno #${e.alunoId}`;
      const raAluno   = e.aluno?.rA ?? e.aluno?.ra ?? '—';
      const turma     = e.aluno?.turma?.nomeTurma ?? '—';
      const nomeItem  = e.estoque?.item?.descricao ?? `Estoque #${e.estoqueId}`;
      return `<tr>
        <td>${nomeAluno}</td>
        <td><code>${raAluno}</code></td>
        <td>${turma}</td>
        <td>${nomeItem}</td>
        <td>${fmtData(e.dataPrevistaDevolucao)}${atrasado ? '<span class="tag-atraso">ATRASADO</span>' : ''}</td>
        <td><span class="status ${atrasado ? 'late' : 'borrowed'}">${atrasado ? 'Atrasado' : 'Emprestado'}</span></td>
        <td><button class="btn btn-success btn-sm" onclick="devolverEmprestimo(${e.id})">
          <i class="fa-solid fa-rotate-left"></i> Devolver
        </button></td>
      </tr>`;
    }).join('')}
  </tbody></table></div>`;
}

function mudarPagEmp(delta) {
  pagEmp += delta;
  renderEmprestimos();
  document.getElementById('secEmp').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── ALUNOS ─────────────────────────────────────────────────
async function carregarAlunos() {
  try {
    const a = await api.get('/api/Aluno');
    todosAlunos = a;
    filtrarAlunos();
  } catch(e) {
    document.getElementById('tabelaAlunosContainer').innerHTML =
      `<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i> Erro.</div>`;
  }
}

function filtrarAlunos() {
  const q     = (document.getElementById('searchGlobal').value || '').toLowerCase();
  const turma = document.getElementById('filtroTurma').value;
  const ordem = document.getElementById('ordenarAlunos').value;

  listaAlunosFiltrada = todosAlunos.filter(a =>
    (!turma || a.turma?.nomeTurma === turma) &&
    (!q || `${a.nome} ${a.sobrenome}`.toLowerCase().includes(q) ||
           (a.rA ?? '').toLowerCase().includes(q) ||
           (a.email ?? '').toLowerCase().includes(q))
  );

  listaAlunosFiltrada.sort((a, b) => {
    const va = ordem==='nome'  ? `${a.nome} ${a.sobrenome}`
             : ordem==='turma' ? (a.turma?.nomeTurma ?? '')
             : ordem==='ra'    ? (a.rA ?? '')
             : a.id;
    const vb = ordem==='nome'  ? `${b.nome} ${b.sobrenome}`
             : ordem==='turma' ? (b.turma?.nomeTurma ?? '')
             : ordem==='ra'    ? (b.rA ?? '')
             : b.id;
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  document.getElementById('countAlunos').textContent = `${listaAlunosFiltrada.length} aluno(s)`;
  pagAlunos = 1;
  renderAlunos();
}

function renderAlunos() {
  const c     = document.getElementById('tabelaAlunosContainer');
  const bar   = document.getElementById('pagBarAlunos');
  const lista = listaAlunosFiltrada;

  if (!lista.length) {
    c.innerHTML = `<div class="empty-state"><i class="fa-solid fa-child"></i> Nenhum aluno.</div>`;
    bar.style.display = 'none';
    return;
  }

  const total  = lista.length;
  const pages  = Math.ceil(total / POR_PAG);
  if (pagAlunos > pages) pagAlunos = pages;

  const inicio = (pagAlunos - 1) * POR_PAG;
  const fatia  = lista.slice(inicio, inicio + POR_PAG);

  bar.style.display = 'flex';
  document.getElementById('pagAlunosInfo').textContent = `Página ${pagAlunos} de ${pages} (${total} alunos)`;
  document.getElementById('pagAlunosPrev').disabled    = pagAlunos === 1;
  document.getElementById('pagAlunosNext').disabled    = pagAlunos === pages;

  c.innerHTML = `<div class="table-scroll"><table><thead><tr>
    <th>RA</th><th>Nome</th><th>Turma</th><th>ID</th><th>Telefone</th><th>E-mail</th><th>Ações</th>
  </tr></thead>
  <tbody>${fatia.map(a => `
    <tr class="clickable" ondblclick="abrirEditarAluno(${a.id})" title="Duplo clique para editar">
      <td><code>${a.rA ?? a.ra ?? '—'}</code></td>
      <td>${a.nome} ${a.sobrenome}</td>
      <td>${a.turma?.nomeTurma ?? '—'}</td>
      <td>${a.id}</td>
      <td>${a.telefone}</td>
      <td>${a.email}</td>
      <td>
        <button class="btn-edit" onclick="event.stopPropagation();abrirEditarAluno(${a.id})">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deletarAluno(${a.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>`).join('')}
  </tbody></table></div>`;
}

function mudarPagAlunos(delta) {
  pagAlunos += delta;
  renderAlunos();
  document.getElementById('secAlunos').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleDir() {
  sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  document.getElementById('iconDir').className = `fa-solid fa-arrow-${sortDir === 'asc' ? 'up' : 'down'}`;
  filtrarAlunos();
}

document.getElementById('searchGlobal').addEventListener('keyup', filtrarAlunos);

// ── CRIAR ALUNO ────────────────────────────────────────────
async function abrirModalAluno() {
  await carregarTurmasSelect('aTurma');
  document.getElementById('modalAluno').classList.add('open');
}

document.getElementById('btnSalvarAluno').addEventListener('click', async function() {
  const nome  = document.getElementById('aNome').value.trim();
  const sob   = document.getElementById('aSobrenome').value.trim();
  const nasc  = document.getElementById('aNasc').value;
  const tel   = document.getElementById('aTelefone').value.trim();
  const email = document.getElementById('aEmail').value.trim();
  const turma = document.getElementById('aTurma').value;
  if (!nome || !sob || !nasc || !tel || !email) { toast('Preencha os campos obrigatórios.', 'error'); return; }
  this.disabled = true; this.textContent = 'Salvando…';
  try {
    await api.post('/api/Aluno', {
      nome, sobrenome: sob,
      dataNascimento: new Date(nasc + 'T12:00:00').toISOString(),
      telefone: tel, email, turmaId: Number(turma)
    });
    toast('Aluno cadastrado!', 'success');
    fecharModal('modalAluno');
    ['aNome','aSobrenome','aNasc','aTelefone','aEmail'].forEach(id => document.getElementById(id).value = '');
    await recarregar();
  } catch(e) { toast('Erro: ' + e.message, 'error'); }
  finally { this.disabled = false; this.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar'; }
});

// ── EDITAR ALUNO ───────────────────────────────────────────
async function abrirEditarAluno(id) {
  try {
    const [a, turmas] = await Promise.all([api.get(`/api/Aluno/${id}`), api.get('/api/Turma')]);
    document.getElementById('eaId').value       = a.id;
    document.getElementById('eaNome').value      = a.nome;
    document.getElementById('eaSobrenome').value = a.sobrenome;
    document.getElementById('eaNasc').value      = a.dataNascimento?.split('T')[0] ?? '';
    document.getElementById('eaTelefone').value  = a.telefone;
    document.getElementById('eaEmail').value     = a.email;
    document.getElementById('eaTurma').innerHTML =
      '<option value="">Sem turma</option>' +
      turmas.map(t => `<option value="${t.id}" ${a.turmaId===t.id?'selected':''}>${t.nomeTurma}</option>`).join('');
    document.getElementById('modalEditAluno').classList.add('open');
  } catch(e) { toast('Erro ao carregar aluno.', 'error'); }
}

document.getElementById('btnSalvarEditAluno').addEventListener('click', async function() {
  const id    = parseInt(document.getElementById('eaId').value);
  const nome  = document.getElementById('eaNome').value.trim();
  const sob   = document.getElementById('eaSobrenome').value.trim();
  const nasc  = document.getElementById('eaNasc').value;
  const tel   = document.getElementById('eaTelefone').value.trim();
  const email = document.getElementById('eaEmail').value.trim();
  const turma = document.getElementById('eaTurma').value;
  if (!nome || !sob || !nasc || !tel || !email) { toast('Preencha os campos obrigatórios.', 'error'); return; }
  this.disabled = true; this.textContent = 'Salvando…';
  try {
    await api.put(`/api/Aluno/${id}`, {
      id, nome, sobrenome: sob,
      dataNascimento: new Date(nasc + 'T12:00:00').toISOString(),
      telefone: tel, email, turmaId: Number(turma) || 0
    });
    toast('Aluno atualizado!', 'success');
    fecharModal('modalEditAluno');
    await recarregar();
  } catch(e) { toast('Erro: ' + e.message, 'error'); }
  finally { this.disabled = false; this.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Atualizar'; }
});

async function deletarAluno(id) {
  if (!confirm('Excluir este aluno?')) return;
  try { await api.delete(`/api/Aluno/${id}`); toast('Aluno excluído.', 'success'); await recarregar(); }
  catch(e) { toast('Erro: ' + e.message, 'error'); }
}

// ── EMPRÉSTIMO — busca por RA ──────────────────────────────
let alunoSelecionadoId = null;
let _alunosCache = [];

function buscarAlunoPorRA(valor) {
  const feedback = document.getElementById('raFeedback');
  alunoSelecionadoId = null;

  if (!valor) { feedback.innerHTML = ''; return; }

  if (!/^\d+$/.test(valor)) {
    feedback.style.color = '#e53935';
    feedback.innerHTML = '❌ Digite apenas números.';
    return;
  }

  if (valor.length < 7) {
    feedback.style.color = '#888';
    feedback.innerHTML = `Digite mais ${7 - valor.length} dígito(s)…`;
    return;
  }

  // formata XXXXAAS → XXXX/AA-S
  const ra = `${valor.substring(0,4)}/${valor.substring(4,6)}-${valor.substring(6,7)}`;

  // busca local na lista já carregada
  const aluno = _alunosCache.find(a => (a.rA ?? a.ra ?? a.RA ?? '') === ra);

  if (!aluno) {
    feedback.style.color = '#e53935';
    feedback.innerHTML = `❌ RA <strong>${ra}</strong> não encontrado.`;
    return;
  }

  alunoSelecionadoId = aluno.id;
  const turma = aluno.turma?.nomeTurma ?? aluno.turma ?? '—';
  const email = aluno.email ?? '—';
  feedback.style.color = '#2e7d32';
  feedback.innerHTML = `
    ✅ <strong>${aluno.nome} ${aluno.sobrenome}</strong> — Turma: ${turma}<br>
    <span style="color:#555;font-weight:600">📧 ${email}</span>`;
}

async function abrirModalEmprestimo() {
  try {
    const [estoque, alunos] = await Promise.all([
      api.get('/api/Estoque'),
      _alunosCache.length ? Promise.resolve(_alunosCache) : api.get('/api/Aluno'),
    ]);
    _alunosCache = Array.isArray(alunos) ? alunos : _alunosCache;

    const disp = estoque.filter(e => e.statusId === 1 || e.status?.descricao?.toLowerCase().includes('disponív'));
    document.getElementById('eEstoque').innerHTML =
      '<option value="">Selecione o item disponível…</option>' +
      (disp.length
        ? disp.map(e => `<option value="${e.id}">${e.item?.descricao ?? 'Item #' + e.id}</option>`).join('')
        : '<option disabled>Nenhum item disponível</option>');
  } catch(e) { toast('Erro ao carregar dados.', 'error'); return; }

  document.getElementById('eRaBusca').value        = '';
  document.getElementById('raFeedback').innerHTML  = '';
  document.getElementById('raFeedback').style.color = '';
  alunoSelecionadoId = null;

  document.getElementById('eDevolucao').min = new Date().toISOString().split('T')[0];
  document.getElementById('modalEmprestimo').classList.add('open');
}

document.getElementById('eRaBusca').addEventListener('input', e => buscarAlunoPorRA(e.target.value));

document.getElementById('btnSalvarEmp').addEventListener('click', async function() {
  const estoqueId = parseInt(document.getElementById('eEstoque').value);
  const devolucao = document.getElementById('eDevolucao').value;

  if (!alunoSelecionadoId) { toast('Busque um aluno pelo RA antes de registrar.', 'error'); return; }
  if (!estoqueId)           { toast('Selecione um item do estoque.', 'error'); return; }
  if (!devolucao)           { toast('Informe a data de devolução.', 'error'); return; }

  this.disabled = true; this.textContent = 'Registrando…';
  try {
    const res = await fetch(`${API_BASE}/api/Emprestimo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        funcionarioId: funcionario.id || 1,
        alunoId: alunoSelecionadoId,
        estoqueId,
        dataPrevistaDevolucao: new Date(devolucao).toISOString()
      })
    });
    const data = await res.json();
    if (!res.ok) { toast('Aviso: ' + (data.mensagem ?? 'Erro'), 'error'); return; }
    toast(data.mensagem ?? 'Empréstimo registrado!', 'success');
    fecharModal('modalEmprestimo');
    await recarregar();
  } catch(e) { toast('Erro: ' + e.message, 'error'); }
  finally { this.disabled = false; this.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Registrar'; }
});

async function devolverEmprestimo(id) {
  if (!confirm('Confirmar devolução?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/Emprestimo/${id}/devolver`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { toast('Erro: ' + (data.mensagem ?? 'Falha'), 'error'); return; }
    toast('Devolução registrada!', 'success');
    await recarregar();
  } catch(e) { toast('Erro: ' + e.message, 'error'); }
}

// ── HELPERS ────────────────────────────────────────────────
async function carregarTurmasSelect(selectId, valorSelecionado = '') {
  try {
    const turmas = await api.get('/api/Turma');
    document.getElementById(selectId).innerHTML =
      '<option value="">Sem turma</option>' +
      turmas.map(t => `<option value="${t.id}" ${valorSelecionado===t.id?'selected':''}>${t.nomeTurma}</option>`).join('');
  } catch { /* ignora */ }
}

recarregar();