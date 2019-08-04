using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;

namespace GradePortalAPI.Models.Interfaces
{
    interface ISkill
    {
        string Name { get; set; }
        string Description { get; set; }
        int AverageAssessment { get; set; }
        ICollection<UserSkill> UserSkills { get; set; }
}
}
