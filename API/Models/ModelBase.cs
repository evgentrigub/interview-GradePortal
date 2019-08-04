using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Models
{
    public class ModelBase: IModelBase
    {
        /// <inheritdoc/>
        public string Id { get; set; }
        /// <inheritdoc/>
        public bool IsActive { get; set; }
        /// <inheritdoc/>
        public DateTime CreatedDate { get; set; }
        /// <inheritdoc/>
        public string QuickSearch { get; set; }
    }
}
