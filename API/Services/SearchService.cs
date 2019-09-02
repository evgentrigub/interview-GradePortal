using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models.Enums;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.ViewModels;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;

namespace GradePortalAPI.Services
{
    public class SearchService : ISearchService
    {
        private static readonly IQueryable<SkillDto> Empty = new SkillDto[0].AsQueryable();
        private static readonly IQueryable<string> EmptyArr = new string[0].AsQueryable();

        [NotNull] private readonly DataContext _context;
        private readonly IMapper _mapper;

        public SearchService(
            [NotNull] DataContext context,
            IMapper mapper
        )
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(context));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        /// <inheritdoc />
        public IQueryable<SkillDto> SkillSearch(string query)
        {
            if (query == null)
                throw new AppException("Search query is null");

            if (string.IsNullOrWhiteSpace(query) || query.Length < 3) return Empty;

            try
            {
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
            catch (AppException e)
            {
                throw new AppException("Skill search. Error" + e.Message);
            }
        }

        /// <inheritdoc />
        public IQueryable<string> ParamSearch(string query, SearchGroup num)
        {
            if (query == null)
                throw new AppException("Search query or is null");

            if (string.IsNullOrWhiteSpace(query) || query.Length < 3) return EmptyArr;

            var res = EmptyArr;

            try
            {
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

                return res.Take(10);
            }
            catch (AppException e)
            {
                throw new AppException("Param search Error" + e.Message);
            }
        }

        /// <inheritdoc />
        public async Task<UserDataTable> UsersSearch(Dictionary<string, string> options, int skip, int take)
        {
            var res = _context.Users.Include(r => r.UserSkills).ThenInclude(r => r.Skill).AsQueryable();

            try
            {
                var name = GetFilterFromFiltersDictionaryOrDefault("name", options);
                if (name != null)
                {
                    name = name.ToUpperInvariant().Replace(" ", "");
                    res = res.Where(r => r.QuickSearchName.Contains(name));
                }

                var city = GetFilterFromFiltersDictionaryOrDefault("city", options);
                if (city != null)
                {
                    city = city.ToUpperInvariant();
                    res = res.Where(r => r.QuickSearchCity.Contains(city));
                }

                var position = GetFilterFromFiltersDictionaryOrDefault("pos", options);
                if (position != null)
                {
                    position = position.ToUpperInvariant();
                    res = res.Where(r => r.QuickSearchPosition.Contains(position));
                }

                var skill = GetFilterFromFiltersDictionaryOrDefault("skill", options);
                if (skill != null)
                {
                    skill = skill.ToUpperInvariant();
                    res = res.Where(u =>
                        u.UserSkills.Select(c => c.Skill).Any(s => s.QuickSearch.Contains(skill)));
                }

                var cutRes = await res.Skip(skip).Take(take).ToListAsync();

                var usersView = _mapper.Map<IEnumerable<UserViewModel>>(cutRes);

                var userTableData = new UserDataTable
                {
                    Items = usersView,
                    TotalCount = res.Count()
                };

                return userTableData;
            }
            catch (Exception e)
            {
                throw new AppException("Users search Error" + e.Message);
            }
        }

        private string GetFilterFromFiltersDictionaryOrDefault(string filterKey, IDictionary<string, string> filters)
        {
            if (filters.ContainsKey(filterKey) && !string.IsNullOrEmpty(filters[filterKey])) return filters[filterKey];

            return null;
        }
    }
}