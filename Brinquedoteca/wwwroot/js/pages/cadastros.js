/* ============================================================
   CADASTROS — lógica da página
   ============================================================ */

/* ============================================================
   FACTORY DE CRUD GENÉRICO
   ============================================================ */
function makeCRUD({ endpoint, listId, inputId, campo, labelCampo }) {
  async function carregar() {
    const ul = document.getElementById(listId);
    try {
      const itens = await api.get(endpoint);
      if (!itens.length) { ul.innerHTML = `<li class="empty-cad">Nenhum registro ainda.</li>`; return; }
      ul.innerHTML = itens.map(item => `
        <li id="li-${listId}-${item.id}">
          <span class="nome">${item[campo]}</span>
          <div class="acoes">
            <button class="ic-btn edit" onclick="editar('${listId}','${endpoint}',${item.id},'${campo}','${String(item[campo]).replace(/'/g,"\\'")}')">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="ic-btn del" onclick="excluir('${endpoint}',${item.id})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </li>`).join('');
    } catch(e) { ul.innerHTML = `<li class="empty-cad">Erro ao carregar.</li>`; }
  }

  async function add() {
    const input = document.getElementById(inputId);
    const val = input.value.trim();
    if (!val) { toast('Digite um valor.','error'); return; }
    try {
      const body = {}; body[campo] = val;
      await api.post(endpoint, body);
      toast('Cadastrado!','success');
      input.value = '';
      await carregar();
    } catch(e) { toast('Erro: '+e.message,'error'); }
  }

  // Enter para adicionar
  document.getElementById(inputId).addEventListener('keydown', e => { if(e.key==='Enter') add(); });

  return { carregar, add };
}

function editar(listId, endpoint, id, campo, valor) {
  const li = document.getElementById(`li-${listId}-${id}`);
  if (!li) return;
  li.innerHTML = `
    <div class="edit-row">
      <input type="text" id="ei-${id}" value="${valor}" maxlength="50">
      <button class="btn btn-sm" style="padding:6px 10px" onclick="salvar('${endpoint}',${id},'${campo}','${listId}')">
        <i class="fa-solid fa-check"></i>
      </button>
      <button class="btn btn-danger btn-sm" style="padding:6px 10px" onclick="recarregar()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>`;
  document.getElementById(`ei-${id}`)?.focus();
  document.getElementById(`ei-${id}`)?.addEventListener('keydown', e => {
    if(e.key==='Enter') salvar(endpoint, id, campo, listId);
  });
}

async function salvar(endpoint, id, campo, listId) {
  const val = document.getElementById(`ei-${id}`)?.value.trim();
  if (!val) { toast('Campo obrigatório.','error'); return; }
  try {
    const body = { id }; body[campo] = val;
    await api.put(`${endpoint}/${id}`, body);
    toast('Atualizado!','success');
    recarregar();
  } catch(e) { toast('Erro: '+e.message,'error'); }
}

async function excluir(endpoint, id) {
  if (!confirm('Excluir este item?')) return;
  try { await api.delete(`${endpoint}/${id}`); toast('Excluído.','success'); recarregar(); }
  catch(e) { toast('Erro: '+e.message,'error'); }
}

/* ---- INSTÂNCIAS ---- */
const crud = {
  turma:      makeCRUD({ endpoint:'/api/Turma',          listId:'listTurma',       inputId:'inputTurma',       campo:'nomeTurma' }),
  area:       makeCRUD({ endpoint:'/api/AreaDesen',       listId:'listArea',        inputId:'inputArea',        campo:'descricao' }),
  cognitivo:  makeCRUD({ endpoint:'/api/DesenCognitivo', listId:'listCognitivo',   inputId:'inputCognitivo',   campo:'descricao' }),
  status:     makeCRUD({ endpoint:'/api/Status',          listId:'listStatus',      inputId:'inputStatus',      campo:'descricao' }),
  tipoEntrada:makeCRUD({ endpoint:'/api/TipoEntrada',     listId:'listTipoEntrada', inputId:'inputTipoEntrada', campo:'entrada'   }),
};

async function recarregar() {
  await Promise.all(Object.values(crud).map(c => c.carregar()));
}

recarregar();
