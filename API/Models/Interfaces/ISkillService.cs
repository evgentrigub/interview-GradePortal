using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Dtos;
using GradePortalAPI.Models.ViewModels;

namespace GradePortalAPI.Models.Interfaces
{
    public interface ISkillService
    {
        IEnumerable<Skill> GetUserSkills(string userId);
        Skill AddOrCreateSkill(string userId, Skill skill);
    }
}
