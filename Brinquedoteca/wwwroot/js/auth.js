/* ============================================================
   AUTH — verificação de sessão e logout
   Incluir em todas as páginas protegidas (exceto login.html)
   ============================================================ */

(function guardSession() {
  if (sessionStorage.getItem('logado') !== 'true') {
    window.location.href = 'login.html';
  }
})();

function sair() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Fecha modal ao clicar fora
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', function (e) {
      if (e.target === this) this.classList.remove('open');
    });
  });
});
