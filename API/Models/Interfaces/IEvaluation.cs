using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GradePortalAPI.Models.Interfaces
{
    interface IEvaluation: IModelBase
    {
        string UserId { get; set; }
        string SkillId { get; set; }
        string ExpertId { get; set; }
        int Value { get; set; }

    }
}
