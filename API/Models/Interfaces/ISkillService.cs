using System.Collections.Generic;
using System.Threading.Tasks;
using GradePortalAPI.Models.Base;

namespace GradePortalAPI.Models.Interfaces
{
    public interface ISkillService: IBaseRepository<Skill>
    {
        IEnumerable<Skill> GetUserSkills(string userId);
        Skill AddOrCreateSkill(string userId, Skill skill);
    }
}