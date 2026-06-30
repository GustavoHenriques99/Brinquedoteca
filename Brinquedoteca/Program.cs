using Brinquedoteca.Data;
using Brinquedoteca.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Brinquedoteca.BackgroundServices;

var builder = WebApplication.CreateBuilder(args);

// CONEXÃO POSTGRES
var connectionString = builder.Configuration.GetConnectionString("ConnectionPostgres")!;

// DB CONTEXT
builder.Services.AddDbContext<BrinquedotecaDbContext>(x => x.UseNpgsql(connectionString));

// SERVICES
builder.Services.AddScoped<RAService>();
builder.Services.AddScoped<EmprestimoService>();
builder.Services.AddScoped<DesenCognitivoService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<NotificacaoService>();

// Autenticação
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("CHAVE_SUPER_SECRETA_123"))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddHostedService<VerificacaoEmprestimosService>();

// CONTROLLERS
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        // Permite serializar propriedades com 'private set' (como RA do Aluno)
        opts.JsonSerializerOptions.IncludeFields = false;
        // Mantém camelCase padrão (rA, id, etc.)
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        // Evita ciclos de referência circular (Emprestimo -> Estoque -> Emprestimo...)
        opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        opts.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// SWAGGER
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();