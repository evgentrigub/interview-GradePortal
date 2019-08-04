using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Models
{
    public class Evaluation: ModelBase, IEvaluation
    {
        public string UserId { get; set; }
        public string SkillId { get; set; }
        public string ExpertId { get; set; }
        public int Value { get; set; }
    }
}
