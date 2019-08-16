using System;
using System.Diagnostics;
using System.Linq;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models.Enums;
using GradePortalAPI.Models.Interfaces;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;

namespace GradePortalAPI.Services
{
    public class SearchService : ISearchService
    {
        private static readonly IQueryable<SkillDto> Empty = new SkillDto[0].AsQueryable();

        [NotNull] private readonly DataContext _context;

        public SearchService([NotNull] DataContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public IQueryable<SkillDto> SkillSearch(string query)
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

        public IQueryable<string> ParamSearch(string query, SearchGroup num)
        {
            if (query == null) throw new ArgumentNullException(nameof(query));

            if (string.IsNullOrWhiteSpace(query) || query.Length < 3) return null;

            IQueryable<string> res = null;

            switch (num)
            {
                case SearchGroup.City:
                    res = _context.Users.Where(r => EF.Functions.Like(r.City, $"%{query}%")).Select(r => r.City);
                    break;
                case SearchGroup.Position:
                    res = _context.Users.Where(r => EF.Functions.Like(r.Position, $"%{query}%")).Select(r => r.Position);
                    break;
                case SearchGroup.Skill:
                    res = _context.Skills.Where(r => EF.Functions.Like(r.Name, $"%{query}%")).Select(r => r.Name);
                    break;
            }

            return (res ?? throw new InvalidOperationException()).Take(10);
        }
    }
}