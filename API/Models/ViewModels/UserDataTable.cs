using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GradePortalAPI.Models.ViewModels
{
    public class UserDataTable
    {
        public IList<UserViewModel> Items { get; set; }
        public int TotalCount { get; set; }
    }
}
