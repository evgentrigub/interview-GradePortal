using System.Collections.Generic;

namespace GradePortalAPI.Models.ViewModels
{
    public class UserDataTable
    {
        public IList<UserViewModel> Items { get; set; }
        public int TotalCount { get; set; }
    }
}