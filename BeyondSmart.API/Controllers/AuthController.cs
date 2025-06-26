using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BeyondSmart.API.Data;
using BeyondSmart.API.DTOs;
using BeyondSmart.API.Models;
using BeyondSmart.API.Services;

namespace BeyondSmart.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthController(ApplicationDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var token = _jwtService.GenerateToken(user);

            var response = new LoginResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role.ToString()
                }
            };

            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(CreateUserDto createUserDto)
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == createUserDto.Email))
            {
                return BadRequest(new { message = "User with this email already exists" });
            }

            // Validate role
            if (!Enum.TryParse<UserRole>(createUserDto.Role, true, out var role))
            {
                return BadRequest(new { message = "Invalid role specified" });
            }

            var user = new User
            {
                Name = createUserDto.Name,
                Email = createUserDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password),
                Role = role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString()
            };

            return CreatedAtAction(nameof(Register), new { id = user.Id }, userDto);
        }
    }
}
