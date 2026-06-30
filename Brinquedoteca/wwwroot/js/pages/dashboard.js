/* ============================================================
   DASHBOARD — gráficos, projeções e empréstimos
   ============================================================ */

const funcionario = JSON.parse(sessionStorage.getItem('funcionario') || '{"id":1,"nome":"Funcionário"}');

// instâncias Chart.js (para destruir antes de recriar)
const _charts = {};

/* ============================================================
   CORES PADRÃO
   ============================================================ */
const CORES = [
  '#ff7043','#ffa726','#ffca28','#66bb6a','#26c6da',
  '#42a5f5','#7e57c2','#ef5350','#78909c','#8d6e63'
];

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
function fmtData(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

function criarChart(id, config) {
  if (_charts[id]) { _charts[id].destroy(); }
  const ctx = document.getElementById(id)?.getContext('2d');
  if (!ctx) return;
  _charts[id] = new Chart(ctx, config);
}

function toast(msg, tipo = 'success') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `show ${tipo}`;
  setTimeout(() => { el.className = ''; }, 3200);
}

function fecharModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

/* ============================================================
   CARREGAMENTO PRINCIPAL
   ============================================================ */
async function recarregar() {
  try {
    const [itens, alunos, emps, estoque, turmas] = await Promise.all([
      api.get('/api/Item'),
      api.get('/api/Aluno'),
      api.get('/api/Emprestimo'),
      api.get('/api/Estoque'),
      api.get('/api/Turma'),
    ]);

    _alunosCache = alunos; // popula cache para busca por RA

    renderKpis(itens, alunos, emps, estoque);
    renderChartStatus(estoque);
    renderChartTipo(itens);
    renderChartArea(itens);
    renderChartTurma(alunos, turmas);
    renderTopEmprestados(emps);
    renderAtrasos(emps);
    renderProjecoes(itens, alunos, emps, estoque, turmas);

  } catch(err) {
    console.error(err);
    toast('Erro ao carregar dados.', 'error');
  }
}

/* ============================================================
   KPIs
   ============================================================ */
function renderKpis(itens, alunos, emps, estoque) {
  const hoje   = new Date();
  const ativos = emps.filter(e => !e.finalizado);
  const disp   = estoque.filter(e => e.statusId === 1 || e.status?.descricao?.toLowerCase().includes('disponív'));
  const atraso = ativos.filter(e => new Date(e.dataPrevistaDevolucao) < hoje);

  document.getElementById('cItens').textContent   = itens.length;
  document.getElementById('cEstoque').textContent = estoque.length;
  document.getElementById('cDisp').textContent    = disp.length;
  document.getElementById('cEmp').textContent     = ativos.length;
  document.getElementById('cAlunos').textContent  = alunos.length;
  document.getElementById('cAtraso').textContent  = atraso.length;
}

/* ============================================================
   GRÁFICO — Status do Estoque (Donut)
   ============================================================ */
function renderChartStatus(estoque) {
  const contagem = {};
  estoque.forEach(e => {
    const label = e.status?.descricao ?? 'Desconhecido';
    contagem[label] = (contagem[label] ?? 0) + 1;
  });
  const labels = Object.keys(contagem);
  const data   = Object.values(contagem);

  criarChart('chartStatus', {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: CORES, borderWidth: 2 }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Nunito', weight: '700' } } }
      },
      cutout: '65%'
    }
  });
}

/* ============================================================
   GRÁFICO — Itens por Tipo (Barras horizontais)
   ============================================================ */
function renderChartTipo(itens) {
  const contagem = {};
  itens.forEach(i => {
    // tenta diferentes caminhos que a API pode retornar
    const label = i.tipoItem?.descricao ?? i.tipo?.descricao ?? i.tipo ?? 'Sem tipo';
    contagem[label] = (contagem[label] ?? 0) + 1;
  });
  const sorted = Object.entries(contagem).sort((a,b) => b[1]-a[1]);
  const labels = sorted.map(x => x[0]);
  const data   = sorted.map(x => x[1]);

  criarChart('chartTipo', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Qtd',
        data,
        backgroundColor: CORES,
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: '#f5f5f5' }, ticks: { font: { family: 'Nunito' } } },
        y: { grid: { display: false }, ticks: { font: { family: 'Nunito', weight: '700' }, color: '#555' } }
      }
    }
  });
}

/* ============================================================
   GRÁFICO — Itens por Área de Desenvolvimento (Pizza)
   ============================================================ */
function renderChartArea(itens) {
  const contagem = {};
  itens.forEach(i => {
    // tenta diferentes caminhos que a API pode retornar
    const label = i.areaDesenvolvimento?.descricao
               ?? i.areaDesen?.descricao
               ?? i.area?.descricao
               ?? 'Não definida';
    contagem[label] = (contagem[label] ?? 0) + 1;
  });
  const labels = Object.keys(contagem);
  const data   = Object.values(contagem);

  criarChart('chartArea', {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data, backgroundColor: CORES, borderWidth: 2 }]
    },
    options: {
      plugins: {
        legend: { position: 'right', labels: { font: { family: 'Nunito', weight: '700' }, boxWidth: 14 } }
      }
    }
  });
}

/* ============================================================
   GRÁFICO — Alunos por Turma (Barras verticais)
   ============================================================ */
function renderChartTurma(alunos, turmas) {
  const contagem = {};
  alunos.forEach(a => {
    const nome = a.turma?.nomeTurma ?? a.turma ?? 'Sem turma';
    contagem[nome] = (contagem[nome] ?? 0) + 1;
  });
  const sorted = Object.entries(contagem).sort((a,b) => b[1]-a[1]);
  const labels = sorted.map(x => x[0]);
  const data   = sorted.map(x => x[1]);

  criarChart('chartTurma', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Alunos',
        data,
        backgroundColor: '#ff7043',
        borderRadius: 8,
        hoverBackgroundColor: '#f4511e',
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'Nunito', weight: '700' }, color: '#555' } },
        y: { grid: { color: '#f5f5f5' }, ticks: { font: { family: 'Nunito' }, stepSize: 1 } }
      }
    }
  });
}

/* ============================================================
   TOP 5 — Mais Emprestados
   ============================================================ */
function renderTopEmprestados(emps) {
  const el = document.getElementById('topEmprestados');

  const contagem = {};
  emps.forEach(e => {
    const nome = e.estoque?.item?.descricao ?? `Item #${e.estoqueId}`;
    contagem[nome] = (contagem[nome] ?? 0) + 1;
  });

  const top5 = Object.entries(contagem)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 5);

  if (!top5.length) {
    el.innerHTML = '<div class="empty-chart"><i class="fa-solid fa-box-open"></i> Nenhum empréstimo registrado.</div>';
    return;
  }

  const max = top5[0][1];
  const rankClasses = ['gold','silver','bronze','',''];

  el.innerHTML = `<ul class="top-list">
    ${top5.map(([nome, qtd], i) => `
      <li>
        <span class="top-rank ${rankClasses[i]}">${i+1}</span>
        <div class="top-bar-wrap">
          <div class="top-bar-label">${nome}</div>
          <div class="top-bar-bg">
            <div class="top-bar-fill" style="width:${Math.round(qtd/max*100)}%"></div>
          </div>
        </div>
        <span class="top-count">${qtd}x</span>
      </li>`).join('')}
  </ul>`;
}

/* ============================================================
   LISTA DE ATRASOS
   ============================================================ */
function renderAtrasos(emps) {
  const el    = document.getElementById('listaAtrasos');
  const badge = document.getElementById('badgeAtraso');
  const hoje  = new Date();

  const atrasados = emps
    .filter(e => !e.finalizado && new Date(e.dataPrevistaDevolucao) < hoje)
    .sort((a,b) => new Date(a.dataPrevistaDevolucao) - new Date(b.dataPrevistaDevolucao));

  badge.textContent = atrasados.length ? `${atrasados.length} em atraso` : '';

  if (!atrasados.length) {
    el.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-check" style="color:#4caf50"></i> Nenhum empréstimo em atraso!</div>';
    return;
  }

  el.innerHTML = `<div class="atraso-list">
    ${atrasados.map(e => {
      const dias  = Math.floor((hoje - new Date(e.dataPrevistaDevolucao)) / 86400000);
      const aluno = e.aluno ? `${e.aluno.nome} ${e.aluno.sobrenome}` : `Aluno #${e.alunoId}`;
      const item  = e.estoque?.item?.descricao ?? `Item #${e.estoqueId}`;
      return `
        <div class="atraso-item">
          <div class="atraso-info">
            <div class="atraso-nome">${aluno}</div>
            <div class="atraso-item-nome">${item} — devolver em ${fmtData(e.dataPrevistaDevolucao)}</div>
          </div>
          <span class="atraso-dias">${dias}d atraso</span>
        </div>`;
    }).join('')}
  </div>`;
}

/* ============================================================
   PROJEÇÕES E INDICADORES
   ============================================================ */
function renderProjecoes(itens, alunos, emps, estoque, turmas) {
  const hoje   = new Date();
  const ativos = emps.filter(e => !e.finalizado);
  const disp   = estoque.filter(e => e.statusId === 1 || e.status?.descricao?.toLowerCase().includes('disponív'));

  const taxaOcup   = estoque.length ? Math.round((ativos.length / estoque.length) * 100) : 0;
  const mediaAlunos = turmas.length ? (alunos.length / turmas.length).toFixed(1) : '—';
  const itemAluno   = alunos.length ? (estoque.length / alunos.length).toFixed(2) : '—';
  const atraso      = ativos.filter(e => new Date(e.dataPrevistaDevolucao) < hoje);
  const taxaAtraso  = ativos.length ? Math.round((atraso.length / ativos.length) * 100) : 0;

  document.getElementById('pTaxaOcup').textContent   = `${taxaOcup}%`;
  document.getElementById('pMediaTurma').textContent = mediaAlunos;
  document.getElementById('pItemAluno').textContent  = itemAluno;
  document.getElementById('pTaxaAtraso').textContent = `${taxaAtraso}%`;
}

/* ============================================================
   MODAL EMPRÉSTIMO — busca por RA
   ============================================================ */
let _alunoId = null;
let _alunosCache = [];

function buscarAlunoPorRA(valor) {
  const fb = document.getElementById('raFeedback');
  _alunoId = null;

  if (!valor) { fb.innerHTML = ''; return; }

  if (!/^\d+$/.test(valor)) {
    fb.style.color = '#e53935';
    fb.innerHTML = '❌ Digite apenas números.';
    return;
  }

  if (valor.length < 7) {
    fb.style.color = '#888';
    fb.innerHTML = `Digite mais ${7 - valor.length} dígito(s)…`;
    return;
  }

  // formata XXXXAAS → XXXX/AA-S
  const ra = `${valor.substring(0,4)}/${valor.substring(4,6)}-${valor.substring(6,7)}`;

  const aluno = _alunosCache.find(a => (a.rA ?? a.ra ?? a.RA ?? '') === ra);

  if (!aluno) {
    fb.style.color = '#e53935';
    fb.innerHTML = `❌ RA <strong>${ra}</strong> não encontrado.`;
    return;
  }

  _alunoId = aluno.id;
  const turma = aluno.turma?.nomeTurma ?? aluno.turma ?? '—';
  const email = aluno.email ?? '—';
  fb.style.color = '#2e7d32';
  fb.innerHTML = `✅ <strong>${aluno.nome} ${aluno.sobrenome}</strong> — Turma: ${turma}<br>
    <span style="color:#555;font-weight:600">📧 ${email}</span>`;
}

document.getElementById('eRaBusca').addEventListener('input', e => buscarAlunoPorRA(e.target.value.trim()));

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
        ? disp.map(e => `<option value="${e.id}">${e.item?.descricao ?? 'Item #'+e.id}</option>`).join('')
        : '<option disabled>Nenhum item disponível no momento</option>');
  } catch { toast('Erro ao carregar dados.', 'error'); return; }

  document.getElementById('eRaBusca').value         = '';
  document.getElementById('raFeedback').innerHTML   = '';
  document.getElementById('raFeedback').style.color = '';
  _alunoId = null;

  document.getElementById('eDevolucao').min = new Date().toISOString().split('T')[0];
  document.getElementById('modalEmprestimo').classList.add('open');
}

document.getElementById('btnSalvarEmp').addEventListener('click', async function() {
  const estoqueId = parseInt(document.getElementById('eEstoque').value);
  const devolucao = document.getElementById('eDevolucao').value;

  if (!_alunoId)  { toast('Busque um aluno pelo RA antes de registrar.', 'error'); return; }
  if (!estoqueId) { toast('Selecione um item do estoque.', 'error'); return; }
  if (!devolucao) { toast('Informe a data de devolução.', 'error'); return; }

  this.disabled = true; this.textContent = 'Registrando…';
  try {
    const res = await fetch(`${API_BASE}/api/Emprestimo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        funcionarioId: funcionario.id || 1,
        alunoId: _alunoId,
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

/* INIT */
recarregar();