using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using JamaatConnect.Domain.Entities;
using JamaatConnect.Domain.Enums;
using JamaatConnect.Infrastructure.Data;
using JamaatConnect.Infrastructure.Services;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Application.Common;
using JamaatConnect.Application.Services;
using JamaatConnect.Application.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuration
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("Smtp"));
builder.Services.AddMemoryCache();

// 2. Database - Use localhost for local development, db for Docker
var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
if (builder.Environment.IsDevelopment() && !builder.Configuration.GetValue<bool>("UseDockerDb"))
{
    connStr = "Host=localhost;Database=jamaat_connect_dev;Username=jamaat_user;Password=jamaat_dev_password";
}
builder.Services.AddDbContext<JamaatContext>(opt =>
    opt.UseNpgsql(connStr));

// 3. ASP.NET Core Identity
builder.Services.AddIdentity<User, Role>(opt =>
{
    opt.Password.RequireDigit = true;
    opt.Password.RequiredLength = 8;
    opt.Password.RequireNonAlphanumeric = false;
    opt.Password.RequireUppercase = true;
    opt.Password.RequireLowercase = true;
    opt.User.RequireUniqueEmail = true;
    opt.SignIn.RequireConfirmedEmail = false;
})
.AddEntityFrameworkStores<JamaatContext>()
.AddDefaultTokenProviders();

// 4. JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "dev-secret-key-min-32-chars-long-for-signing";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "JamaatConnect";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "JamaatConnect";

builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(opt =>
{
    opt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.FromMinutes(1),
        NameClaimType = System.Security.Claims.ClaimTypes.Name,
        RoleClaimType = System.Security.Claims.ClaimTypes.Role
    };
});

// 4. Authorization Policies
builder.Services.AddAuthorization(opt =>
{
    opt.AddPolicy("RequireAdmin", p => p.RequireRole("Administrator"));
    opt.AddPolicy("RequireModerator", p => p.RequireRole("Administrator", "Moderator"));
    opt.AddPolicy("RequireOrganizer", p => p.RequireRole("Administrator", "Moderator", "Organizer"));
});

// 5. Application Services
builder.Services.AddScoped<IJamaatContext>(sp => sp.GetRequiredService<JamaatContext>());
builder.Services.AddScoped<IDateTimeProvider, DateTimeProvider>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IListingService, ListingService>();
builder.Services.AddScoped<IEnquiryService, EnquiryService>();
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<ISmtpEmailService, SmtpEmailService>();
        builder.Services.AddScoped<IModerationService, ModerationService>();
        builder.Services.AddScoped<IReportService, ReportService>();
        builder.Services.AddScoped<IOrganizerVerificationService, OrganizerVerificationService>();

// 6. Validators
builder.Services.AddValidatorsFromAssemblyContaining<CreateListingRequestValidator>();
builder.Services.AddFluentValidationAutoValidation();

// 7. Controllers & API
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(opt =>
    {
        opt.InvalidModelStateResponseFactory = ctx =>
        {
            var errors = ctx.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .Select(e => new { Field = e.Key, Errors = e.Value!.Errors.Select(err => err.ErrorMessage) });
            var problem = new Microsoft.AspNetCore.Mvc.ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Title = "Validation Failed",
                Status = 422,
                Detail = "One or more validation errors occurred",
                Extensions = { ["errors"] = errors }
            };
            return new Microsoft.AspNetCore.Mvc.UnprocessableEntityObjectResult(problem);
        };
    });

// 8. CORS
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("AllowFrontend", p =>
    {
        p.WithOrigins("http://localhost:4200", "https://localhost:4200", "http://localhost:4201", "https://localhost:4201")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials();
    });
});

// 9. OpenAPI / Swagger (minimal config - just built-in)
builder.Services.AddEndpointsApiExplorer();

// 10. Health Checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Initialize database and seed data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var db = services.GetRequiredService<JamaatContext>();
    await db.Database.MigrateAsync();
    var userManager = services.GetRequiredService<UserManager<User>>();
    var roleManager = services.GetRequiredService<RoleManager<Role>>();
    await SeedData.SeedAsync(db, userManager, roleManager);
}

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready");

app.Run();
