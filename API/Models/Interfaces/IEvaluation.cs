namespace GradePortalAPI.Models.Interfaces
{
    internal interface IEvaluation : IModelBase
    {
        User User { get; set; }
        Skill Skill { get; set; }
        User Expert { get; set; }
        int Value { get; set; }
    }
}