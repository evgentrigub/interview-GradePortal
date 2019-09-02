using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Dtos;
using GradePortalAPI.Models.Enums;
using GradePortalAPI.Models.ViewModels;
using JetBrains.Annotations;

namespace GradePortalAPI.Models.Interfaces
{
    public interface ISearchService
    {
        /// <summary>
        ///     Search skill name and return skill info
        /// </summary>
        /// <param name="query"></param>
        /// <returns></returns>
        [NotNull]
        IQueryable<SkillDto> SkillSearch([NotNull] string query);

        /// <summary>
        ///     Return existed options (city, position, skill) for user search
        /// </summary>
        /// <param name="query"></param>
        /// <param name="num"></param>
        /// <returns></returns>
        [NotNull]
        IQueryable<string> ParamSearch([NotNull] string query, SearchGroup num);

        /// <summary>
        ///     Return users with search params in dictionary
        /// </summary>
        /// <param name="options"></param>
        /// <param name="skip"></param>
        /// <param name="take"></param>
        /// <returns></returns>
        Task<UserDataTable> UsersSearch(Dictionary<string, string> options, int skip, int take);
    }
}