using System.Collections.Generic;

namespace GradePortalAPI.Models.Interfaces
{
    public interface ISkillService
    {
        IEnumerable<Skill> GetUserSkills(string userId);
        Skill AddOrCreateSkill(string userId, Skill skill);
    }
}