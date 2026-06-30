<p align="center">
  <img src="imgBrinquedoteca/Home.jpeg" alt="Brinquedoteca Banner" width="100%"/>
</p>

<h1 align="center">🧩 Brinquedoteca</h1>

<p align="center">
  Sistema web de gerenciamento de brinquedoteca escolar — controle de empréstimos, estoque, alunos e muito mais.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/HTML%20%2F%20CSS%20%2F%20JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
</p>

---

## 📋 Sobre o Projeto

O **Brinquedoteca** é um sistema completo para gerenciamento de brinquedotecas escolares, desenvolvido como **Projeto Integrador 2026**. Ele permite o controle de empréstimos de brinquedos, cadastro de alunos, gestão de estoque e visualização de dados por meio de um dashboard interativo.

### ✨ Funcionalidades

- 🎲 **Gestão de Brinquedos** — cadastro de itens com tipo, área de desenvolvimento e desenvolvimento cognitivo
- 👤 **Cadastro de Alunos** — com geração automática de RA (Registro do Aluno)
- 🔄 **Empréstimos** — registro, controle de devolução e alertas de atraso
- 📦 **Estoque Detalhado** — rastreamento de cada unidade física por status (Disponível / Emprestado)
- 📊 **Dashboard** — gráficos de status do estoque, itens por tipo, área de desenvolvimento e ranking dos mais emprestados
- 📬 **Notificações por E-mail** — alertas automáticos para empréstimos próximos do vencimento e atrasados
- 🔐 **Autenticação JWT** — login seguro para funcionários

---

## 🖥️ Telas do Sistema

<table>
  <tr>
    <td align="center"><b>🏠 Home</b></td>
    <td align="center"><b>📊 Dashboard</b></td>
  </tr>
  <tr>
    <td><img src="imgBrinquedoteca/Home.jpeg" alt="Home"/></td>
    <td><img src="imgBrinquedoteca/dashboard.jpeg" alt="Dashboard"/></td>
  </tr>
  <tr>
    <td align="center"><b>👤 Cadastro de Aluno</b></td>
    <td align="center"><b>🔄 Registrar Empréstimo</b></td>
  </tr>
  <tr>
    <td><img src="imgBrinquedoteca/cadastroAluno.jpg" alt="Cadastro Aluno"/></td>
    <td><img src="imgBrinquedoteca/cadastroEmprestimo.jpg" alt="Cadastro Empréstimo"/></td>
  </tr>
  <tr>
    <td align="center"><b>📦 Estoque</b></td>
    <td align="center"><b>🗂️ Cadastros Auxiliares</b></td>
  </tr>
  <tr>
    <td><img src="imgBrinquedoteca/Estoque.jpeg" alt="Estoque"/></td>
    <td><img src="imgBrinquedoteca/CadastroAuxiliares.jpeg" alt="Cadastros"/></td>
  </tr>
  <tr>
    <td align="center"><b>🧠 Desenvolvimento Cognitivo</b></td>
    <td align="center"><b>🏷️ Status do Estoque</b></td>
  </tr>
  <tr>
    <td><img src="imgBrinquedoteca/DesenvolvimentoCognitivo.jpg" alt="Desenvolvimento Cognitivo"/></td>
    <td><img src="imgBrinquedoteca/Status.jpg" alt="Status"/></td>
  </tr>
</table>

---

## 🏗️ Arquitetura

```
BrinquedotecaAPI/
└── Brinquedoteca/
    ├── Controllers/         # Endpoints da API REST
    │   ├── AlunoController
    │   ├── EmprestimoController
    │   ├── EstoqueController
    │   ├── ItemController
    │   ├── FuncionarioController
    │   ├── TurmaController
    │   ├── StatusController
    │   ├── TipoEntradaController
    │   ├── AreaDesenController
    │   └── DesenCognitivoController
    ├── Models/              # Entidades do banco de dados
    ├── Services/            # Regras de negócio
    │   ├── RAService            (geração automática de RA)
    │   ├── EmprestimoService    (lógica de empréstimos)
    │   ├── EmailService         (envio de e-mails)
    │   └── NotificacaoService   (alertas de atraso)
    ├── BackgroundService/   # Verificação periódica de empréstimos
    ├── DTO/                 # Data Transfer Objects
    ├── wwwroot/             # Frontend (HTML + CSS + JS)
    │   ├── index.html
    │   ├── dashboard.html
    │   ├── itens.html
    │   ├── cadastros.html
    │   └── login.html
    └── BancoBackup/         # Backup do banco (não versionado)
```

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| Backend | ASP.NET Core 8.0 (Web API) |
| Banco de Dados | PostgreSQL + Entity Framework Core 8 |
| Autenticação | JWT Bearer (System.IdentityModel.Tokens.Jwt) |
| E-mail | MailKit + MimeKit |
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Documentação | Swagger / OpenAPI |

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL](https://www.postgresql.org/download/) instalado e rodando
- Conta Gmail com [Senha de App](https://support.google.com/accounts/answer/185833) configurada (para notificações)

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/BrinquedotecaAPI.git
cd BrinquedotecaAPI/BrinquedotecaAPI
```

### 2. Configure o ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp Brinquedoteca/appsettings.Development.example.json Brinquedoteca/appsettings.Development.json
```

Edite o arquivo `appsettings.Development.json` com suas credenciais:

```json
{
  "ConnectionStrings": {
    "ConnectionPostgres": "Server=localhost; Port=5432; User Id=postgres; Password=SUA_SENHA; Database=db_brinquedoteca"
  },
  "EmailSettings": {
    "Email": "seu_email@gmail.com",
    "Senha": "sua_senha_de_app_do_gmail",
    "Host": "smtp.gmail.com",
    "Port": 587
  }
}
```

> ⚠️ **Nunca commite o arquivo `appsettings.Development.json` com dados reais!** Ele já está no `.gitignore`.

### 3. Crie o banco de dados

Crie o banco no PostgreSQL:

```sql
CREATE DATABASE db_brinquedoteca;
```

Você pode importar o backup disponível na pasta `BancoBackup/`:

```bash
psql -U postgres -d db_brinquedoteca -f BancoBackup/db_brinquedotecaBK.sql
```

### 4. Execute a aplicação

```bash
cd Brinquedoteca
dotnet run
```

A API estará disponível em `https://localhost:7XXX` e o frontend em `https://localhost:7XXX/index.html`.

A documentação Swagger estará em `https://localhost:7XXX/swagger`.

---

## 🔌 Endpoints da API

| Recurso | Rota Base |
|---------|-----------|
| Alunos | `GET/POST/PUT/DELETE /api/Aluno` |
| Empréstimos | `GET/POST/PUT/DELETE /api/Emprestimo` |
| Itens (Brinquedos) | `GET/POST/PUT/DELETE /api/Item` |
| Estoque | `GET/POST/DELETE /api/Estoque` |
| Funcionários | `GET/POST/PUT/DELETE /api/Funcionario` |
| Turmas | `GET/POST/PUT/DELETE /api/Turma` |
| Status | `GET/POST/PUT/DELETE /api/Status` |
| Tipo de Entrada | `GET/POST/PUT/DELETE /api/TipoEntrada` |
| Área de Desenvolvimento | `GET/POST/PUT/DELETE /api/AreaDesen` |
| Desenvolvimento Cognitivo | `GET/POST/PUT/DELETE /api/DesenCognitivo` |

> 💡 Consulte o Swagger em `/swagger` para ver todos os detalhes de cada endpoint.

---

## 🔐 Segurança

- Autenticação via **JWT Bearer Token**
- Senhas e strings de conexão mantidas em `appsettings.Development.json` (não versionado)
- Arquivo `.gitignore` configurado para nunca expor credenciais

---

## 👨‍💻 Equipe

Projeto desenvolvido como **Projeto Integrador 2026**.

---

## 📄 Licença

Este projeto é de uso acadêmico. Todos os direitos reservados aos autores.
