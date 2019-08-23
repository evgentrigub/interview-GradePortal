using System.Collections.Generic;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Models
{
    public class Skill : ModelBase, ISkill
    {
        public ICollection<UserSkill> UserSkills { get; set; } = new List<UserSkill>();
        public string Name { get; set; }
        public string Description { get; set; }
        public string QuickSearch { get; set; }
    }
}