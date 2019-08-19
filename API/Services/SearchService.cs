using System;
using System.Collections.Generic;
using System.Linq;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
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
                    res = _context.Users.Where(r => EF.Functions.Like(r.Position, $"%{query}%"))
                        .Select(r => r.Position);
                    break;
                case SearchGroup.Skill:
                    res = _context.Skills.Where(r => EF.Functions.Like(r.Name, $"%{query}%")).Select(r => r.Name);
                    break;
            }

            return (res ?? throw new InvalidOperationException()).Take(10);
        }

        public IQueryable<User> UsersSearch(Dictionary<string, string> options)
        {
            var res = _context.Users.Include(r => r.UserSkills).ThenInclude(r => r.Skill).AsQueryable();

            var name = GetFilterFromFiltersDictionaryOrDefault("name", options);
            if (name != null)
            {
                name = name.ToUpperInvariant().Replace(" ", "");
                res = res.Where(r => r.QuickSearch.Contains(name));
            }

            var city = GetFilterFromFiltersDictionaryOrDefault("city", options);
            if (city != null)
            {
                city = city.ToUpperInvariant();
                res = res.Where(r => r.City.ToUpperInvariant().Contains(city));
            }

            var position = GetFilterFromFiltersDictionaryOrDefault("pos", options);
            if (position != null)
            {
                position = position.ToUpperInvariant();
                res = res.Where(r => r.Position.ToUpperInvariant().Contains(position));
            }

            var skill = GetFilterFromFiltersDictionaryOrDefault("skill", options);
            if (skill != null)
            {
                skill = skill.ToUpperInvariant();
                res = res.Where(u =>
                    u.UserSkills.Select(c => c.Skill).Any(s => s.Name.ToUpperInvariant().Contains(skill)));
            }

            return res;
        }

        private string GetFilterFromFiltersDictionaryOrDefault(string filterKey, IDictionary<string, string> filters)
        {
            if (filters.ContainsKey(filterKey) && !string.IsNullOrEmpty(filters[filterKey])) return filters[filterKey];

            return null;
        }
    }
}