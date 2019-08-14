using System;

namespace GradePortalAPI.Models.Interfaces
{
    internal interface IModelBase
    {
        string Id { get; set; }

        bool IsActive { get; set; }

        DateTime CreatedDate { get; set; }
    }
}