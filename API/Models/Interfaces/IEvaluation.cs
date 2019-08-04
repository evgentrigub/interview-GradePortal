using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GradePortalAPI.Models.Interfaces
{
    interface IEvaluation: IModelBase
    {
        User User { get; set; }
        Skill Skill { get; set; }
        User Expert { get; set; }
        int Value { get; set; }

    }
}
