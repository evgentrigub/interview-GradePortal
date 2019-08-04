using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Models
{
    public class Evaluation: ModelBase, IEvaluation
    {
        public virtual User User { get; set; }
        public virtual Skill Skill { get; set; }
        public virtual User Expert { get; set; }
        public int Value { get; set; }
    }
}
