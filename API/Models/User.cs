using System.Collections.Generic;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Models
{
    public class User: ModelBase, IUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public virtual ICollection<UserSkill> UserSkills { get; set; }
    }
}