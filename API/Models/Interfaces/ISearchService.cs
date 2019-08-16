using System.Linq;
using GradePortalAPI.Dtos;
using GradePortalAPI.Models.Enums;
using JetBrains.Annotations;

namespace GradePortalAPI.Models.Interfaces
{
    public interface ISearchService
    {
        [NotNull]
        IQueryable<SkillDto> SkillSearch([NotNull] string query);
        [NotNull]
        IQueryable<string> ParamSearch([NotNull]string query, SearchGroup num);
    }
}