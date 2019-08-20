using System.Collections.Generic;
using System.Linq;
using GradePortalAPI.Dtos;
using GradePortalAPI.Models.Enums;
using GradePortalAPI.Models.ViewModels;
using JetBrains.Annotations;

namespace GradePortalAPI.Models.Interfaces
{
    public interface ISearchService
    {
        [NotNull]
        IQueryable<SkillDto> SkillSearch([NotNull] string query);

        [NotNull]
        IQueryable<string> ParamSearch([NotNull] string query, SearchGroup num);

        UserDataTable UsersSearch(Dictionary<string, string> options, int skip, int take);
    }
}