/* ============================================================
   LOGIN — lógica da página
   ============================================================ */

/* ============================================================
   LOGIN
   A API não tem endpoint de autenticação ainda, então verificamos
   se o servidor está disponível e se existe um funcionário com
   o e-mail informado via GET /api/Funcionario.
   ============================================================ */

const loginForm = document.getElementById('loginForm');
const btnLogin  = document.getElementById('btnLogin');
const loginErro = document.getElementById('loginErro');

function mostrarErro(msg) {
  loginErro.textContent = msg;
  loginErro.style.display = 'block';
}
function ocultarErro() {
  loginErro.style.display = 'none';
}

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  ocultarErro();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  btnLogin.disabled = true;
  btnLogin.innerHTML = '<span class="spinner"></span> Verificando...';

  try {
    // Tenta buscar funcionários na API
    const funcionarios = await api.get('/api/Funcionario');

    // Verifica se existe funcionário com esse e-mail
    // (autenticação simples — adapte quando a API tiver JWT/auth)
    const func = funcionarios.find(f =>
      f.email?.toLowerCase() === email.toLowerCase()
    );

    if (!func) {
      mostrarErro('E-mail não encontrado. Verifique suas credenciais.');
      return;
    }

    // Salva sessão simples no sessionStorage
    sessionStorage.setItem('funcionario', JSON.stringify(func));
    sessionStorage.setItem('logado', 'true');

    toast('Bem-vindo, ' + func.nome + '!', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 700);

  } catch (err) {
    mostrarErro(
      'Não foi possível conectar à API. ' +
      'Verifique se a API está rodando em ' + API_BASE + '.'
    );
    console.error(err);
  } finally {
    btnLogin.disabled = false;
    btnLogin.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Entrar no Sistema';
  }
});

// Modo demo sem API
function entrarOffline() {
  sessionStorage.setItem('logado', 'true');
  sessionStorage.setItem('funcionario', JSON.stringify({ nome: 'Demo', id: 0 }));
  window.location.href = 'index.html';
}

// Se já logado, vai direto pro dashboard
if (sessionStorage.getItem('logado') === 'true') {
  window.location.href = 'index.html';
}

// Redireciona se já logado
if (sessionStorage.getItem('logado') === 'true') {
  window.location.href = 'index.html';
}

