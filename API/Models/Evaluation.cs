using GradePortalAPI.Models.Base;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Models
{
    public class Evaluation : ModelBase, IEvaluation
    {
        public virtual User User { get; set; }
        public virtual Skill Skill { get; set; }
        public virtual User Expert { get; set; }
        public int Value { get; set; }
    }
}