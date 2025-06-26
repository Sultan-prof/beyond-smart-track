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
    public class MaintenanceRequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MaintenanceRequestsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MaintenanceRequest>>> GetMaintenanceRequests()
        {
            return await _context.MaintenanceRequests
                .Include(mr => mr.Project)
                    .ThenInclude(p => p.Client)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MaintenanceRequest>> GetMaintenanceRequest(int id)
        {
            var maintenanceRequest = await _context.MaintenanceRequests
                .Include(mr => mr.Project)
                    .ThenInclude(p => p.Client)
                .FirstOrDefaultAsync(mr => mr.Id == id);

            if (maintenanceRequest == null)
            {
                return NotFound();
            }

            return maintenanceRequest;
        }

        [HttpPost]
        public async Task<ActionResult<MaintenanceRequest>> PostMaintenanceRequest(MaintenanceRequest maintenanceRequest)
        {
            // Verify project exists
            if (!await _context.Projects.AnyAsync(p => p.Id == maintenanceRequest.ProjectId))
            {
                return BadRequest("Project not found");
            }

            _context.MaintenanceRequests.Add(maintenanceRequest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMaintenanceRequest), new { id = maintenanceRequest.Id }, maintenanceRequest);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutMaintenanceRequest(int id, MaintenanceRequest maintenanceRequest)
        {
            if (id != maintenanceRequest.Id)
            {
                return BadRequest();
            }

            // Verify project exists
            if (!await _context.Projects.AnyAsync(p => p.Id == maintenanceRequest.ProjectId))
            {
                return BadRequest("Project not found");
            }

            _context.Entry(maintenanceRequest).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MaintenanceRequestExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMaintenanceRequest(int id)
        {
            var maintenanceRequest = await _context.MaintenanceRequests.FindAsync(id);
            if (maintenanceRequest == null)
            {
                return NotFound();
            }

            _context.MaintenanceRequests.Remove(maintenanceRequest);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MaintenanceRequestExists(int id)
        {
            return _context.MaintenanceRequests.Any(e => e.Id == id);
        }
    }
}
