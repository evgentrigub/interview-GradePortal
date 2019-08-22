using System.Collections.Generic;
using System.Threading.Tasks;
using GradePortalAPI.Models.Base;
using GradePortalAPI.Models.Interfaces.Base;

namespace GradePortalAPI.Models.Interfaces
{
    public interface ISkillService: IBaseRepository<Skill>
    {
        /// <summary>
        /// Get user skills with user Id
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        Task<IResult<IList<Skill>>> GetUserSkills(string userId);

        /// <summary>
        /// Add skill to user collection, if skill exists
        /// Create new skill and add id to user collection, if skill id is null
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="skill"></param>
        /// <returns></returns>
        Task<IResult<Skill>> AddOrCreateSkill(string userId, Skill skill);
    }
}