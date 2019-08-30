using System.ComponentModel.DataAnnotations;

namespace GradePortalAPI.Dtos
{
    public class UserDto
    {
        [Required(ErrorMessage = "First name is required")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Username is required")]
        public string Username { get; set; }

        public string City { get; set; }
        public string Position { get; set; }
        public string Password { get; set; }
    }
}