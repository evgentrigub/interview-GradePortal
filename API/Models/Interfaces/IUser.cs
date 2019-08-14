namespace GradePortalAPI.Models.Interfaces
{
    internal interface IUser : IModelBase
    {
        string FirstName { get; set; }
        string LastName { get; set; }
        string Username { get; set; }
    }
}