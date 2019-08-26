using System;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Models.Base
{
    public abstract class ModelBase : IModelBase
    {
        public ModelBase()
        {
            Id = Guid.NewGuid().ToString();
            IsActive = true;
            CreatedDate = DateTime.Now;
        }

        /// <inheritdoc />
        public string Id { get; set; }

        /// <inheritdoc />
        public bool IsActive { get; set; }

        /// <inheritdoc />
        public DateTime CreatedDate { get; set; }
    }
}