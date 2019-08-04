using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GradePortalAPI.Models.Interfaces
{
    interface IUser: IModelBase
    {
        string FirstName { get; set; }
        string LastName { get; set; }
        string Username { get; set; }

    }
}
