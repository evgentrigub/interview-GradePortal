using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Models.ViewModels
{
    public class UserAuthenticateModel: UserViewModel
    {
        public string Token { get; set; }
    }
}
