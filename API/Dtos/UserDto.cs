using GradePortalAPI.Models;

namespace GradePortalAPI.Dtos
{
    public class UserDto: ModelBase
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}