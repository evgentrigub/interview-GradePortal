using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Models.ViewModels;

namespace GradePortalAPI.Models.Interfaces
{
    public interface ISkillService
    {
        Skill Create(SkillViewModel skill);
        void Update(Skill skill);

    }
}
