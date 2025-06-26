using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using BeyondSmart.API.Data;
using BeyondSmart.API.Models;

namespace BeyondSmart.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProjectsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            return await _context.Projects
                .Include(p => p.Client)
                .Include(p => p.Quotation)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Client)
                .Include(p => p.Quotation)
                .Include(p => p.MaintenanceRequests)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            return project;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Sales")]
        public async Task<ActionResult<Project>> PostProject(Project project)
        {
            // Verify quotation and client exist
            if (!await _context.Quotations.AnyAsync(q => q.Id == project.QuotationId))
            {
                return BadRequest("Quotation not found");
            }

            if (!await _context.Clients.AnyAsync(c => c.Id == project.ClientId))
            {
                return BadRequest("Client not found");
            }

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Sales")]
        public async Task<IActionResult> PutProject(int id, Project project)
        {
            if (id != project.Id)
            {
                return BadRequest();
            }

            // Verify quotation and client exist
            if (!await _context.Quotations.AnyAsync(q => q.Id == project.QuotationId))
            {
                return BadRequest("Quotation not found");
            }

            if (!await _context.Clients.AnyAsync(c => c.Id == project.ClientId))
            {
                return BadRequest("Client not found");
            }

            _context.Entry(project).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProjectExists(int id)
        {
            return _context.Projects.Any(e => e.Id == id);
        }
    }
}
