using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Memory;
using JamaatConnect.Application.Interfaces;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using JamaatConnect.Application.DTOs;
using JamaatConnect.Application.Common;
using JamaatConnect.Domain.Entities;
using JamaatConnect.Domain.Enums;

namespace JamaatConnect.Api.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IConfiguration _config;
        private readonly ISmtpEmailService _email;
        private readonly IMemoryCache _cache;

        public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, RoleManager<Role> roleManager, IConfiguration config, ISmtpEmailService email, IMemoryCache cache)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _config = config;
            _email = email;
            _cache = cache;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            var existing = await _userManager.FindByEmailAsync(request.Email);
            if (existing != null)
                return Conflict(new { error = "Email already registered" });

            var user = new User(request.DisplayName, request.Email, request.Phone);
            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            // Assign default "Participant" role
            if (!await _roleManager.RoleExistsAsync("Participant"))
                await _roleManager.CreateAsync(new Role("Participant", "Registered participant"));
            await _userManager.AddToRoleAsync(user, "Participant");

            await SendCodeAsync(user, "registration", TimeSpan.FromMinutes(10));
            return Ok(new RegistrationResponse("A verification code has been sent to your email. Please verify your account to continue."));
        }

        [HttpPost("verify-registration")]
        public async Task<ActionResult<AuthResponse>> VerifyRegistration([FromBody] VerifyRegistrationRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null || !IsValidCode(user.Email!, "registration", request.Code))
                return BadRequest(new { error = "This code is invalid or has expired." });

            user.EmailConfirmed = true;
            var update = await _userManager.UpdateAsync(user);
            if (!update.Succeeded) return BadRequest(new { errors = update.Errors.Select(e => e.Description) });
            _cache.Remove(CodeKey(user.Email!, "registration"));
            await SendWelcomeEmailAsync(user);

            var token = await GenerateJwtToken(user);
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new AuthResponse(token.AccessToken, user.DisplayName, user.Email, roles, token.RefreshToken));
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return Unauthorized(new { error = "Invalid credentials" });

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
                return Unauthorized(new { error = "Invalid credentials" });

            var token = await GenerateJwtToken(user);
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new AuthResponse(token.AccessToken, user.DisplayName, user.Email, roles, token.RefreshToken,
                roles.Contains("Administrator") && !user.EmailConfirmed));
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiry <= DateTime.UtcNow)
                return Unauthorized(new { error = "Invalid or expired refresh token" });

            var newToken = await GenerateJwtToken(user);
            user.SetRefreshToken(newToken.RefreshToken, DateTime.UtcNow.AddDays(7));
            await _userManager.UpdateAsync(user);

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new AuthResponse(newToken.AccessToken, user.DisplayName, user.Email, roles, newToken.RefreshToken,
                roles.Contains("Administrator") && !user.EmailConfirmed));
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user != null)
                await SendCodeAsync(user, "reset");

            // Do not reveal whether an email address is registered.
            return Ok(new { message = "If the address is registered, a 30-second verification code has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null || !IsValidCode(user.Email!, "reset", request.Code))
                return BadRequest(new { error = "This code is invalid or has expired." });

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            _cache.Remove(CodeKey(user.Email!, "reset"));
            return Ok(new { message = "Password updated successfully." });
        }

        [Authorize]
        [HttpPost("request-credential-change-code")]
        public async Task<IActionResult> RequestCredentialChangeCode()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();
            await SendCodeAsync(user, "credentials");
            return Ok(new { message = "A verification code has been sent to your email." });
        }

        [Authorize]
        [HttpPost("change-credentials")]
        public async Task<IActionResult> ChangeCredentials([FromBody] ChangeCredentialsRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();
            if (!IsValidCode(user.Email!, "credentials", request.Code))
                return BadRequest(new { error = "This code is invalid or has expired." });

            if (!string.IsNullOrWhiteSpace(request.DisplayName)) user.UpdateProfile(request.DisplayName.Trim(), user.PhonePrivate);
            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var passwordResult = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
                if (!passwordResult.Succeeded) return BadRequest(new { errors = passwordResult.Errors.Select(e => e.Description) });
            }

            user.EmailConfirmed = true; // seeded administrators are required to complete this once.
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
            _cache.Remove(CodeKey(user.Email!, "credentials"));
            return Ok(new { displayName = user.DisplayName, message = "Your credentials have been updated and verified." });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user != null)
            {
                user.ClearRefreshToken();
                await _userManager.UpdateAsync(user);
            }
            return Ok();
        }

        private async Task<(string AccessToken, string RefreshToken)> GenerateJwtToken(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Name, user.DisplayName)
            };
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "dev-secret-key-min-32-chars-long-for-signing"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(60);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"] ?? "JamaatConnect",
                audience: _config["Jwt:Audience"] ?? "JamaatConnect",
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
            var refreshToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray().Concat(Guid.NewGuid().ToByteArray()).ToArray());

            return (accessToken, refreshToken);
        }

        private async Task SendWelcomeEmailAsync(User user)
        {
            const string subject = "Welcome to Jamaat Connect | জামাত কানেক্টে স্বাগতম";
            var name = System.Net.WebUtility.HtmlEncode(user.DisplayName);
            var body = $"<html><body style='font-family:Arial,sans-serif;color:#173b36'><h2>Welcome, {name}!</h2><p>Your Jamaat Connect account is ready. You can now explore and create travel listings.</p><hr/><h2>স্বাগতম, {name}!</h2><p>আপনার জামাত কানেক্ট অ্যাকাউন্ট প্রস্তুত। এখন আপনি ভ্রমণের তালিকা দেখতে ও তৈরি করতে পারবেন।</p></body></html>";
            await _email.SendEmailAsync(user.Email!, subject, body, $"Welcome, {user.DisplayName}! আপনার জামাত কানেক্ট অ্যাকাউন্ট প্রস্তুত।");
        }

        private async Task SendCodeAsync(User user, string purpose, TimeSpan? lifetime = null)
        {
            var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            var expiry = lifetime ?? (purpose == "reset" ? TimeSpan.FromSeconds(30) : TimeSpan.FromMinutes(10));
            _cache.Set(CodeKey(user.Email!, purpose), code, expiry);
            var actionEnglish = purpose == "reset" ? "reset your password" : purpose == "registration" ? "verify your new account" : "confirm your credential changes";
            var actionBangla = purpose == "reset" ? "আপনার পাসওয়ার্ড রিসেট করুন" : purpose == "registration" ? "আপনার নতুন অ্যাকাউন্ট যাচাই করুন" : "আপনার তথ্য পরিবর্তন নিশ্চিত করুন";
            var expiryText = purpose == "reset" ? "30 seconds" : "10 minutes";
            var expiryBangla = purpose == "reset" ? "৩০ সেকেন্ড" : "১০ মিনিট";
            var subject = "Your Jamaat Connect verification code | জামাত কানেক্ট যাচাইকরণ কোড";
            var body = $"<html><body style='font-family:Arial,sans-serif;color:#173b36'><h2>Verification code: {code}</h2><p>Use this code to {actionEnglish}. It expires in <strong>{expiryText}</strong>.</p><hr/><h2>যাচাইকরণ কোড: {code}</h2><p>{actionBangla}। কোডটি <strong>{expiryBangla}</strong> পর্যন্ত কার্যকর থাকবে।</p></body></html>";
            await _email.SendEmailAsync(user.Email!, subject, body, $"Code: {code}. Valid for {expiryText}. কোডটি {expiryBangla} কার্যকর।");
        }

        private bool IsValidCode(string email, string purpose, string code) =>
            _cache.TryGetValue(CodeKey(email, purpose), out string? stored) && stored == code;

        private static string CodeKey(string email, string purpose) => $"auth-code:{purpose}:{email.ToUpperInvariant()}";

        public record RegisterRequest(string DisplayName, string Email, string? Phone, string Password);
        public record LoginRequest(string Email, string Password);
        public record RefreshRequest(string Email, string RefreshToken);
        public record ForgotPasswordRequest(string Email);
        public record VerifyRegistrationRequest(string Email, string Code);
        public record RegistrationResponse(string Message);
        public record ResetPasswordRequest(string Email, string Code, string NewPassword);
        public record ChangeCredentialsRequest(string Code, string? DisplayName, string? NewPassword);
        public record AuthResponse(string AccessToken, string DisplayName, string Email, IEnumerable<string> Roles, string? RefreshToken = null, bool MustChangeCredentials = false);
    }
}
