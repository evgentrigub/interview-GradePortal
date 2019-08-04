using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GradePortalAPI.Models.Interfaces
{
    interface IUser
    {
        string FirstName { get; set; }
        string LastName { get; set; }
        string Username { get; set; }
        byte[] PasswordHash { get; set; }
        byte[] PasswordSalt { get; set; }
        ICollection<UserSkill> UserSkills { get; set; }

    }
}
