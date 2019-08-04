using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Models
{
    public class Skill: ModelBase, ISkill
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public virtual ICollection<UserSkill> UserSkills { get; set; }
    }
}
