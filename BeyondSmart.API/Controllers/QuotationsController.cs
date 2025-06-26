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
    public class QuotationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public QuotationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Quotation>>> GetQuotations()
        {
            return await _context.Quotations
                .Include(q => q.Client)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Quotation>> GetQuotation(int id)
        {
            var quotation = await _context.Quotations
                .Include(q => q.Client)
                .Include(q => q.Projects)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quotation == null)
            {
                return NotFound();
            }

            return quotation;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Sales")]
        public async Task<ActionResult<Quotation>> PostQuotation(Quotation quotation)
        {
            // Verify client exists
            if (!await _context.Clients.AnyAsync(c => c.Id == quotation.ClientId))
            {
                return BadRequest("Client not found");
            }

            // Calculate total if not provided
            if (quotation.Total == 0)
            {
                quotation.Total = (quotation.Area * quotation.PricePerMeter) - quotation.Discount;
            }

            _context.Quotations.Add(quotation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetQuotation), new { id = quotation.Id }, quotation);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Sales")]
        public async Task<IActionResult> PutQuotation(int id, Quotation quotation)
        {
            if (id != quotation.Id)
            {
                return BadRequest();
            }

            // Verify client exists
            if (!await _context.Clients.AnyAsync(c => c.Id == quotation.ClientId))
            {
                return BadRequest("Client not found");
            }

            // Recalculate total
            quotation.Total = (quotation.Area * quotation.PricePerMeter) - quotation.Discount;

            _context.Entry(quotation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuotationExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteQuotation(int id)
        {
            var quotation = await _context.Quotations.FindAsync(id);
            if (quotation == null)
            {
                return NotFound();
            }

            _context.Quotations.Remove(quotation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool QuotationExists(int id)
        {
            return _context.Quotations.Any(e => e.Id == id);
        }
    }
}
