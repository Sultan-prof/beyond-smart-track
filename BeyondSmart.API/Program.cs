using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using BeyondSmart.API.Data;
using BeyondSmart.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure Entity Framework with InMemory Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseInMemoryDatabase("BeyondSmartDB"));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
        };
    });

builder.Services.AddAuthorization();

// Register services
builder.Services.AddScoped<IJwtService, JwtService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BeyondSmart API",
        Version = "v1",
        Description = "API for BeyondSmart ERP System"
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BeyondSmart API V1");
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    SeedData(context);
}

app.Run();

static void SeedData(ApplicationDbContext context)
{
    if (!context.Users.Any())
    {
        context.Users.AddRange(
            new BeyondSmart.API.Models.User
            {
                Name = "Admin User",
                Email = "admin@beyondsmart.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = BeyondSmart.API.Models.UserRole.Admin
            },
            new BeyondSmart.API.Models.User
            {
                Name = "Sales User",
                Email = "sales@beyondsmart.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("sales123"),
                Role = BeyondSmart.API.Models.UserRole.Sales
            },
            new BeyondSmart.API.Models.User
            {
                Name = "Warehouse User",
                Email = "warehouse@beyondsmart.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("warehouse123"),
                Role = BeyondSmart.API.Models.UserRole.Warehouse
            }
        );
        context.SaveChanges();
    }

    if (!context.Clients.Any())
    {
        context.Clients.AddRange(
            new BeyondSmart.API.Models.Client
            {
                Name = "ABC Corporation",
                Phone = "+1234567890",
                Email = "contact@abc-corp.com",
                City = "New York"
            },
            new BeyondSmart.API.Models.Client
            {
                Name = "XYZ Industries",
                Phone = "+1987654321",
                Email = "info@xyz-industries.com",
                City = "Los Angeles"
            }
        );
        context.SaveChanges();
    }

    if (!context.InventoryItems.Any())
    {
        context.InventoryItems.AddRange(
            new BeyondSmart.API.Models.InventoryItem
            {
                ProductName = "Security Camera HD",
                Unit = BeyondSmart.API.Models.InventoryUnit.pcs,
                Quantity = 50
            },
            new BeyondSmart.API.Models.InventoryItem
            {
                ProductName = "Fiber Optic Cable",
                Unit = BeyondSmart.API.Models.InventoryUnit.sqm,
                Quantity = 1000
            },
            new BeyondSmart.API.Models.InventoryItem
            {
                ProductName = "Network Switch 24-Port",
                Unit = BeyondSmart.API.Models.InventoryUnit.pcs,
                Quantity = 25
            }
        );
        context.SaveChanges();
    }
}
