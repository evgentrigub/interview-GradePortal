using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GradePortalAPI.Models
{
    public class UserSkill
    {
        public string UserId { get; set; }
        public User User { get; set; }
        public string SkillId { get; set; }
        public Skill Skill { get; set; }
    }
}
