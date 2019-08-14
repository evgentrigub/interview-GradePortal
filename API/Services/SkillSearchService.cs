using System;
using System.Linq;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models.Interfaces;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;

namespace GradePortalAPI.Services
{
    public class SkillSearchService : ISkillSearchService
    {
        private static readonly IQueryable<SkillDto> Empty = new SkillDto[0].AsQueryable();
        [NotNull] private readonly DataContext _context;

        public SkillSearchService([NotNull] DataContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public IQueryable<SkillDto> Search(string query)
        {
            if (query == null) throw new ArgumentNullException(nameof(query));

            if (string.IsNullOrWhiteSpace(query) || query.Length < 3) return Empty;

            var res = _context.Skills
                .Where(r => EF.Functions.Like(r.Name, $"%{query}%"))
                .Select(r => new SkillDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description
                });

            return res.Take(20);
        }
    }
}