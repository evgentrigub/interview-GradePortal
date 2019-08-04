using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Models
{
    public class User: ModelBase, IUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string City { get; set; }
        public string Position { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public ICollection<UserSkill> UserSkills{ get; set; }
    }
}