using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Models.ViewModels;

namespace GradePortalAPI.Dtos
{
    public class UserSkillsDto
    {
        public UserViewModel UserData { get; set; }
        public IList<SkillDto> Skills { get; set; }
    }
}
