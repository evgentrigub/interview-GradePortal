using System.Collections.Generic;
using GradePortalAPI.Models.Base;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Models
{
    public class User : ModelBase, IUser
    {
        public string City { get; set; }
        public string Position { get; set; }
        public ICollection<UserSkill> UserSkills { get; set; } = new List<UserSkill>();
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public string QuickSearchName { get; set; }
        public string QuickSearchCity { get; set; }
        public string QuickSearchPosition { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
    }
}