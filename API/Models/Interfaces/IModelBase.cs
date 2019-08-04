using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GradePortalAPI.Models.Interfaces
{
    interface IModelBase
    {
        string Id { get; set; }

        bool IsActive { get; set; }

        DateTime CreatedDate { get; set; }

        string QuickSearch { get; set; }
    }
}
