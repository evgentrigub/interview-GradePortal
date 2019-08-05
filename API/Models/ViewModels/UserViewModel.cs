using System.Collections.Generic;

namespace GradePortalAPI.Models.ViewModels
{
    public class UserViewModel
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string City { get; set; }
        public string Position { get; set; }
        public ICollection<UserSkill> UserSkills { get; set; }
    }
}