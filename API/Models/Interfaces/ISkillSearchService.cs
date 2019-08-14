using System.Linq;
using GradePortalAPI.Dtos;
using JetBrains.Annotations;

namespace GradePortalAPI.Models.Interfaces
{
    public interface ISkillSearchService
    {
        [ContractAnnotation("query:null => halt")]
        [NotNull]
        IQueryable<SkillDto> Search([NotNull] string query);
    }
}