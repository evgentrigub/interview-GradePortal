namespace GradePortalAPI.Models.Interfaces
{
    internal interface ISkill : IModelBase
    {
        string Name { get; set; }
        string Description { get; set; }
    }
}