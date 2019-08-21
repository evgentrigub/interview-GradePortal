using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.Interfaces.Base;

namespace GradePortalAPI.Models.Base
{
    public interface IBaseRepository<TEnity>
        where  TEnity: class
    {
        Task<TEnity> FindById(string id);
        Task<IResult> Delete(string id);
    }
}
