/* ============================================================
   ITENS — lógica da página
   ============================================================ */

/* GUARD */

const funcionario = JSON.parse(sessionStorage.getItem('funcionario') || '{"id":1}');

/* ESTADO */
let todosItens   = [];
let todosEstoque = [];

/* ============================================================
   CARREGAMENTO
   ============================================================ */
async function recarregar() {
  await Promise.all([
    carregarItens(),
    carregarEstoque(),
    popularFormEstoque(),
  ]);
}

async function carregarItens() {
  const container = document.getElementById('tabelaItensContainer');
  try {
    const itens = await api.get('/api/Item');
    todosItens = itens;
    document.getElementById('cTotal').textContent = itens.length;
    // Popular filtro de tipos
    const tipos = [...new Set(itens.map(i => i.tipo))].sort();
    const sel = document.getElementById('filtroTipo');
    sel.innerHTML = '<option value="">Todos os tipos</option>' +
      tipos.map(t => `<option value="${t}">${t}</option>`).join('');
    aplicarFiltroItens();
  } catch(err) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i> Erro ao carregar itens.</div>`;
    console.error(err);
  }
}

function renderItens(itens, sortCol, sortDir) {
  const container = document.getElementById('tabelaItensContainer');
  if (!itens.length) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-cube"></i> Nenhum item encontrado.</div>`;
    return;
  }
  const sc = sortCol ?? itensSortCol;
  const sd = sortDir ?? itensSortDir;
  const thSort = (col, label) => `
    <th class="th-sortable ${sc === col ? 'active' : ''}" onclick="setSortItens('${col}')">
      ${label}<span class="sort-icon">${sc === col ? (sd === 'asc' ? '▲' : '▼') : '⇅'}</span>
    </th>`;
  container.innerHTML = `
    <div class="table-scroll">
    <table>
      <thead>
        <tr>
          ${thSort('id','#')}
          ${thSort('tipo','Tipo')}
          ${thSort('descricao','Descrição')}
          ${thSort('faixa','Faixa Etária')}
          <th>Desenv. Cognitivo</th><th>Área</th><th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${itens.map(i => `
          <tr ondblclick="abrirEditarItem(${i.id})" style="cursor:pointer" title="Duplo clique para editar">
            <td>${i.id}</td>
            <td>${i.tipo}</td>
            <td><strong>${i.descricao}</strong></td>
            <td><span class="status available" style="background:#1976d2">${i.faixaEtaria}</span></td>
            <td>${i.desenCognitivo?.descricao ?? '—'}</td>
            <td>${i.areaDesen?.descricao ?? '—'}</td>
            <td>
              <button class="btn btn-sm" style="background:#1976d2;margin-right:4px" onclick="event.stopPropagation();abrirEditarItem(${i.id})"><i class="fa-solid fa-pen"></i></button>
              <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deletarItem(${i.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>
    </div>`;
}

function renderEstoque(est) {
  const container = document.getElementById('tabelaEstoqueContainer');
  if (!est.length) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-warehouse"></i> Estoque vazio.</div>`;
    return;
  }
  const sc = estoqueSortCol;
  const sd = estoqueSortDir;
  const thSort = (col, label) => `
    <th class="th-sortable ${sc === col ? 'active' : ''}" onclick="setSortEstoque('${col}')">
      ${label}<span class="sort-icon">${sc === col ? (sd === 'asc' ? '▲' : '▼') : '⇅'}</span>
    </th>`;
  container.innerHTML = `
    <div class="table-scroll">
    <table>
      <thead>
        <tr>
          ${thSort('id','#')}
          ${thSort('item','Item')}
          ${thSort('status','Status')}
          <th>Tipo Entrada</th>
          ${thSort('funcionario','Funcionário')}
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${est.map(e => {
          const disponivel = e.status?.descricao?.toLowerCase().includes('disponível') || e.statusId === 1;
          return `
            <tr>
              <td>${e.id}</td>
              <td>${e.item?.descricao ?? '—'}</td>
              <td>
                <span class="status ${disponivel ? 'available' : 'borrowed'}">
                  ${e.status?.descricao ?? (disponivel ? 'Disponível' : 'Emprestado')}
                </span>
              </td>
              <td>${e.tipoEntrada?.entrada ?? e.tipoEntrada?.descricao ?? '—'}</td>
              <td>${e.funcionario?.nome ?? '—'}</td>
              <td>
                <button class="btn btn-danger btn-sm" onclick="deletarEstoque(${e.id})">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>
    </div>`;
}

async function carregarEstoque() {
  const container = document.getElementById('tabelaEstoqueContainer');
  try {
    const est = await api.get('/api/Estoque');
    todosEstoque = est;

    const disp = est.filter(e =>
      e.status?.descricao?.toLowerCase().includes('disponível') || e.statusId === 1
    ).length;
    const emp = est.length - disp;

    document.getElementById('cEstoque').textContent     = est.length;
    document.getElementById('cDisp').textContent        = disp;
    document.getElementById('cEmprestados').textContent = emp;

    // Popular filtro de status
    const statusList = [...new Map(est.map(e => [e.statusId, e.status?.descricao ?? `#${e.statusId}`])).entries()]
      .sort((a,b) => (a[1] > b[1] ? 1 : -1));
    const selSt = document.getElementById('eFiltroStatus');
    if (selSt) {
      selSt.innerHTML = '<option value="">Todos os status</option>' +
        statusList.map(([id, desc]) => `<option value="${id}">${desc}</option>`).join('');
    }

    aplicarFiltroEstoque();
  } catch(err) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i> Erro ao carregar estoque.</div>`;
    console.error(err);
  }
}

/* ---- POPULAR SELECTS DO FORM DE ESTOQUE ---- */
async function popularFormEstoque() {
  try {
    const [itens, status, tiposEntrada] = await Promise.all([
      api.get('/api/Item'),
      api.get('/api/Status'),
      api.get('/api/TipoEntrada'),
    ]);

    document.getElementById('eItem').innerHTML =
      '<option value="">Selecione o item…</option>' +
      itens.map(i => `<option value="${i.id}">${i.descricao}</option>`).join('');

    document.getElementById('eStatus').innerHTML =
      '<option value="">Status…</option>' +
      status.map(s => `<option value="${s.id}">${s.descricao}</option>`).join('');

    document.getElementById('eTipoEntrada').innerHTML =
      '<option value="">Tipo de Entrada…</option>' +
      tiposEntrada.map(t => `<option value="${t.id}">${t.entrada ?? t.descricao ?? t.Entrada ?? t.id}</option>`).join('');

  } catch(err) {
    console.error('Erro ao popular selects de estoque:', err);
  }
}

/* ---- ADD ESTOQUE ---- */
document.getElementById('btnAddEstoque').addEventListener('click', async function() {
  const itemId      = parseInt(document.getElementById('eItem').value);
  const statusId    = parseInt(document.getElementById('eStatus').value);
  const tipoId      = parseInt(document.getElementById('eTipoEntrada').value);

  if (!itemId || !statusId || !tipoId) {
    toast('Selecione item, status e tipo de entrada.', 'error'); return;
  }

  this.disabled = true; this.textContent = 'Adicionando…';
  try {
    await api.post('/api/Estoque', {
      itemId, statusId,
      tipoEntradaId: tipoId,
      funcionarioId: funcionario.id || 1,
      item: null, status: null, tipoEntrada: null, funcionario: null,
    });
    toast('Item adicionado ao estoque!', 'success');
    await carregarEstoque();
  } catch(err) {
    toast('Erro ao adicionar ao estoque: ' + err.message, 'error');
  } finally {
    this.disabled = false;
    this.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar ao Estoque';
  }
});

/* ============================================================
   MODAL — NOVO ITEM
   ============================================================ */
async function abrirModalItem() {
  try {
    const [desenCog, areasDesen] = await Promise.all([
      api.get('/api/DesenCognitivo'),
      api.get('/api/AreaDesen'),
    ]);

    document.getElementById('iDesenCognitivo').innerHTML =
      '<option value="">Desenvolvimento Cognitivo…</option>' +
      desenCog.map(d => `<option value="${d.id}">${d.descricao}</option>`).join('');

    document.getElementById('iAreaDesen').innerHTML =
      '<option value="">Área de Desenvolvimento…</option>' +
      areasDesen.map(a => `<option value="${a.id}">${a.descricao}</option>`).join('');

  } catch(err) {
    toast('Erro ao carregar opções: ' + err.message, 'error');
  }

  document.getElementById('modalItem').classList.add('open');
}

document.getElementById('btnSalvarItem').addEventListener('click', async function() {
  const tipo        = document.getElementById('iTipo').value.trim();
  const descricao   = document.getElementById('iDescricao').value.trim();
  const faixaEtaria = document.getElementById('iFaixaEtaria').value.trim();
  const desenCogId  = parseInt(document.getElementById('iDesenCognitivo').value);
  const areaDesenId = parseInt(document.getElementById('iAreaDesen').value);

  if (!tipo || !descricao || !faixaEtaria || !desenCogId || !areaDesenId) {
    toast('Preencha todos os campos obrigatórios.', 'error'); return;
  }

  this.disabled = true; this.textContent = 'Salvando…';
  try {
    await api.post('/api/Item', {
      tipo, descricao, faixaEtaria,
      desenCognitivoId: desenCogId,
      areaDesenId,
      desenCognitivo: null, areaDesen: null,
    });
    toast('Item cadastrado com sucesso!', 'success');
    fecharModal('modalItem');
    ['iTipo','iDescricao','iFaixaEtaria'].forEach(id => document.getElementById(id).value = '');
    await recarregar();
  } catch(err) {
    toast('Erro ao salvar item: ' + err.message, 'error');
  } finally {
    this.disabled = false;
    this.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar';
  }
});

async function deletarItem(id) {
  if (!confirm('Excluir este item? As entradas de estoque relacionadas também serão afetadas.')) return;
  try {
    await api.delete(`/api/Item/${id}`);
    toast('Item excluído.', 'success');
    await recarregar();
  } catch(err) {
    toast('Erro ao excluir item: ' + err.message, 'error');
  }
}

async function deletarEstoque(id) {
  if (!confirm('Remover esta unidade do estoque?')) return;
  try {
    await api.delete(`/api/Estoque/${id}`);
    toast('Unidade removida do estoque.', 'success');
    await carregarEstoque();
  } catch(err) {
    toast('Erro ao remover: ' + err.message, 'error');
  }
}

/* ============================================================
   FILTROS E PESQUISA
   ============================================================ */
document.getElementById('pesquisaItem').addEventListener('keyup', function() {
  aplicarFiltroItens();
});

/* ============================================================
   UTILITÁRIOS
   ============================================================ */

/* ---- EDITAR ITEM ---- */
async function abrirEditarItem(id) {
  try {
    const [item, dc, ad] = await Promise.all([api.get(`/api/Item/${id}`), api.get('/api/DesenCognitivo'), api.get('/api/AreaDesen')]);
    document.getElementById('eiId').value        = item.id;
    document.getElementById('eiTipo').value      = item.tipo;
    document.getElementById('eiDescricao').value = item.descricao;
    document.getElementById('eiFaixa').value     = item.faixaEtaria;
    document.getElementById('eiCognitivo').innerHTML =
      dc.map(d=>`<option value="${d.id}" ${item.desenCognitivoId===d.id?'selected':''}>${d.descricao}</option>`).join('');
    document.getElementById('eiArea').innerHTML =
      ad.map(a=>`<option value="${a.id}" ${item.areaDesenId===a.id?'selected':''}>${a.descricao}</option>`).join('');
    document.getElementById('modalEditItem').classList.add('open');
  } catch(e){toast('Erro ao carregar item.','error');}
}

document.getElementById('btnSalvarEditItem').addEventListener('click', async function() {
  const id    = parseInt(document.getElementById('eiId').value);
  const tipo  = document.getElementById('eiTipo').value.trim();
  const desc  = document.getElementById('eiDescricao').value.trim();
  const faixa = document.getElementById('eiFaixa').value.trim();
  const cogId = parseInt(document.getElementById('eiCognitivo').value);
  const areaId= parseInt(document.getElementById('eiArea').value);
  if(!tipo||!desc||!faixa||!cogId||!areaId){toast('Preencha todos os campos.','error');return;}
  this.disabled=true;this.textContent='Salvando…';
  try {
    await api.put(`/api/Item/${id}`,{id,tipo,descricao:desc,faixaEtaria:faixa,desenCognitivoId:cogId,areaDesenId:areaId,desenCognitivo:null,areaDesen:null});
    toast('Item atualizado!','success');
    fecharModal('modalEditItem');
    await recarregar();
  } catch(e){toast('Erro: '+e.message,'error');}
  finally{this.disabled=false;this.innerHTML='<i class="fa-solid fa-floppy-disk"></i> Atualizar';}
});

/* ============================================================
   TABELAS AUXILIARES — modal unificado com abas
   ============================================================ */

// ── Controle de abas ─────────────────────────────────────────
function mudarAba(tabId) {
  document.querySelectorAll('.mgmt-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  // ativa o botão correspondente
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.getAttribute('onclick')?.includes(tabId)) b.classList.add('active');
  });
}

async function abrirModalTabelas() {
  document.getElementById('modalTabelas').classList.add('open');
  await Promise.all([
    renderListaTipoEntrada(),
    renderListaStatus(),
    renderListaDesenCog(),
    renderListaAreaDesen(),
  ]);
}

// ── helpers de lista genérico ─────────────────────────────────
function mgmtLista(items, labelFn, deleteFn) {
  if (!items.length) return '<div class="mgmt-empty">Nenhum cadastrado ainda.</div>';
  return items.map(it => `
    <div class="mgmt-item">
      <span>${labelFn(it)}</span>
      <button class="btn btn-danger btn-sm" onclick="${deleteFn}(${it.id})">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>`).join('');
}

// ── TIPO DE ENTRADA ───────────────────────────────────────────
async function renderListaTipoEntrada() {
  const el = document.getElementById('listaTipoEntrada');
  try {
    const data = await api.get('/api/TipoEntrada');
    el.innerHTML = mgmtLista(data, t => t.entrada ?? t.descricao ?? '—', 'deletarTipoEntrada');
  } catch { el.innerHTML = '<div class="mgmt-empty" style="color:red">Erro ao carregar.</div>'; }
}

async function salvarTipoEntrada() {
  const input = document.getElementById('tEntradaNome');
  const nome  = input.value.trim();
  if (!nome) { toast('Digite o nome do tipo de entrada.', 'error'); return; }
  try {
    await api.post('/api/TipoEntrada', { entrada: nome });
    input.value = '';
    toast('Tipo de entrada cadastrado!', 'success');
    await renderListaTipoEntrada();
    await popularFormEstoque();
  } catch(err) { toast('Erro: ' + err.message, 'error'); }
}

async function deletarTipoEntrada(id) {
  if (!confirm('Excluir este tipo de entrada?')) return;
  try {
    await api.delete('/api/TipoEntrada/' + id);
    toast('Excluído.', 'success');
    await renderListaTipoEntrada();
    await popularFormEstoque();
  } catch(err) { toast('Erro ao excluir: ' + err.message, 'error'); }
}

// ── STATUS ────────────────────────────────────────────────────
async function renderListaStatus() {
  const el = document.getElementById('listaStatus');
  try {
    const data = await api.get('/api/Status');
    el.innerHTML = mgmtLista(data, s => s.descricao ?? '—', 'deletarStatus');
  } catch { el.innerHTML = '<div class="mgmt-empty" style="color:red">Erro ao carregar.</div>'; }
}

async function salvarStatus() {
  const input = document.getElementById('sStatusNome');
  const nome  = input.value.trim();
  if (!nome) { toast('Digite o nome do status.', 'error'); return; }
  try {
    await api.post('/api/Status', { descricao: nome });
    input.value = '';
    toast('Status cadastrado!', 'success');
    await renderListaStatus();
    await popularFormEstoque();
  } catch(err) { toast('Erro: ' + err.message, 'error'); }
}

async function deletarStatus(id) {
  if (!confirm('Excluir este status?')) return;
  try {
    await api.delete('/api/Status/' + id);
    toast('Excluído.', 'success');
    await renderListaStatus();
    await popularFormEstoque();
  } catch(err) { toast('Erro ao excluir: ' + err.message, 'error'); }
}

// ── DESENVOLVIMENTO COGNITIVO ─────────────────────────────────
async function renderListaDesenCog() {
  const el = document.getElementById('listaDesenCog');
  try {
    const data = await api.get('/api/DesenCognitivo');
    el.innerHTML = mgmtLista(data, d => d.descricao ?? '—', 'deletarDesenCog');
  } catch { el.innerHTML = '<div class="mgmt-empty" style="color:red">Erro ao carregar.</div>'; }
}

async function salvarDesenCog() {
  const input = document.getElementById('dcNome');
  const nome  = input.value.trim();
  if (!nome) { toast('Digite o nome do desenvolvimento cognitivo.', 'error'); return; }
  try {
    await api.post('/api/DesenCognitivo', { descricao: nome });
    input.value = '';
    toast('Desenvolvimento cognitivo cadastrado!', 'success');
    await renderListaDesenCog();
    // atualiza o select do modal de item
    const desenCogs = await api.get('/api/DesenCognitivo');
    document.getElementById('iDesenCognitivo').innerHTML =
      '<option value="">Desenvolvimento Cognitivo…</option>' +
      desenCogs.map(d => `<option value="${d.id}">${d.descricao}</option>`).join('');
  } catch(err) { toast('Erro: ' + err.message, 'error'); }
}

async function deletarDesenCog(id) {
  if (!confirm('Excluir este desenvolvimento cognitivo?')) return;
  try {
    await api.delete('/api/DesenCognitivo/' + id);
    toast('Excluído.', 'success');
    await renderListaDesenCog();
  } catch(err) { toast('Erro ao excluir: ' + err.message, 'error'); }
}

// ── ÁREA DE DESENVOLVIMENTO ───────────────────────────────────
async function renderListaAreaDesen() {
  const el = document.getElementById('listaAreaDesen');
  try {
    const data = await api.get('/api/AreaDesen');
    el.innerHTML = mgmtLista(data, a => a.descricao ?? '—', 'deletarAreaDesen');
  } catch { el.innerHTML = '<div class="mgmt-empty" style="color:red">Erro ao carregar.</div>'; }
}

async function salvarAreaDesen() {
  const input = document.getElementById('adNome');
  const nome  = input.value.trim();
  if (!nome) { toast('Digite o nome da área de desenvolvimento.', 'error'); return; }
  try {
    await api.post('/api/AreaDesen', { descricao: nome });
    input.value = '';
    toast('Área de desenvolvimento cadastrada!', 'success');
    await renderListaAreaDesen();
    // atualiza o select do modal de item
    const areas = await api.get('/api/AreaDesen');
    document.getElementById('iAreaDesen').innerHTML =
      '<option value="">Área de Desenvolvimento…</option>' +
      areas.map(a => `<option value="${a.id}">${a.descricao}</option>`).join('');
  } catch(err) { toast('Erro: ' + err.message, 'error'); }
}

async function deletarAreaDesen(id) {
  if (!confirm('Excluir esta área de desenvolvimento?')) return;
  try {
    await api.delete('/api/AreaDesen/' + id);
    toast('Excluído.', 'success');
    await renderListaAreaDesen();
  } catch(err) { toast('Erro ao excluir: ' + err.message, 'error'); }
}

/* ============================================================
   UTILITÁRIO DE ORDENAÇÃO GENÉRICO
   ============================================================ */
function sortArray(arr, col, dir, getters) {
  const fn = getters[col] ?? (x => x[col]);
  return [...arr].sort((a, b) => {
    const va = fn(a), vb = fn(b);
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ?  1 : -1;
    return 0;
  });
}

/* ============================================================
   FILTRO + SORT — ITENS
   ============================================================ */
let itensSortCol = 'id';
let itensSortDir = 'asc';

function toggleDirItens() {
  itensSortDir = itensSortDir === 'asc' ? 'desc' : 'asc';
  document.getElementById('iDirBtn').textContent = itensSortDir === 'asc' ? '↑' : '↓';
  aplicarFiltroItens();
}

function setSortItens(col) {
  if (itensSortCol === col) {
    itensSortDir = itensSortDir === 'asc' ? 'desc' : 'asc';
    document.getElementById('iDirBtn').textContent = itensSortDir === 'asc' ? '↑' : '↓';
  } else {
    itensSortCol = col;
    itensSortDir = 'asc';
    document.getElementById('iOrdenarPor').value = col;
    document.getElementById('iDirBtn').textContent = '↑';
  }
  aplicarFiltroItens();
}

function aplicarFiltroItens() {
  const q    = (document.getElementById('pesquisaItem').value || '').toLowerCase();
  const tipo = document.getElementById('filtroTipo').value;
  itensSortCol = document.getElementById('iOrdenarPor').value;

  let lista = todosItens.filter(i =>
    (!tipo || i.tipo === tipo) &&
    (!q    || i.descricao.toLowerCase().includes(q) || i.tipo.toLowerCase().includes(q) ||
              (i.desenCognitivo?.descricao ?? '').toLowerCase().includes(q))
  );

  lista = sortArray(lista, itensSortCol, itensSortDir, {
    id:       i => i.id,
    descricao:i => (i.descricao ?? '').toLowerCase(),
    tipo:     i => (i.tipo ?? '').toLowerCase(),
    faixa:    i => (i.faixaEtaria ?? '').toLowerCase(),
  });

  document.getElementById('iResultCount').textContent =
    lista.length < todosItens.length
      ? `${lista.length} de ${todosItens.length} itens`
      : `${lista.length} itens`;

  renderItens(lista, itensSortCol, itensSortDir);
}

/* ============================================================
   FILTRO + SORT — ESTOQUE
   ============================================================ */
let estoqueSortCol = 'id';
let estoqueSortDir = 'asc';

function toggleDirEstoque() {
  estoqueSortDir = estoqueSortDir === 'asc' ? 'desc' : 'asc';
  document.getElementById('eDirBtn').textContent = estoqueSortDir === 'asc' ? '↑' : '↓';
  aplicarFiltroEstoque();
}

function setSortEstoque(col) {
  if (estoqueSortCol === col) {
    estoqueSortDir = estoqueSortDir === 'asc' ? 'desc' : 'asc';
    document.getElementById('eDirBtn').textContent = estoqueSortDir === 'asc' ? '↑' : '↓';
  } else {
    estoqueSortCol = col;
    estoqueSortDir = 'asc';
    document.getElementById('eOrdenarPor').value = col;
    document.getElementById('eDirBtn').textContent = '↑';
  }
  aplicarFiltroEstoque();
}

function aplicarFiltroEstoque() {
  const statusFiltro = document.getElementById('eFiltroStatus')?.value ?? '';
  estoqueSortCol = document.getElementById('eOrdenarPor')?.value ?? 'id';

  let lista = todosEstoque.filter(e =>
    !statusFiltro || String(e.statusId) === statusFiltro
  );

  lista = sortArray(lista, estoqueSortCol, estoqueSortDir, {
    id:          e => e.id,
    item:        e => (e.item?.descricao ?? '').toLowerCase(),
    status:      e => (e.status?.descricao ?? '').toLowerCase(),
    funcionario: e => (e.funcionario?.nome ?? '').toLowerCase(),
  });

  document.getElementById('eResultCount').textContent =
    lista.length < todosEstoque.length
      ? `${lista.length} de ${todosEstoque.length} unidades`
      : `${lista.length} unidades`;

  renderEstoque(lista);
}

/* INIT */
recarregar();