using System.Collections.Generic;
using System.Threading.Tasks;
using GradePortalAPI.Dtos;
using GradePortalAPI.Models.Base;
using GradePortalAPI.Models.Interfaces.Base;

namespace GradePortalAPI.Models.Interfaces
{
    public interface IUserService: IBaseRepository<User>
    {
        Task<IResult<User>> Authenticate(string username, string password);
        IResult<User> Create(User user, string password);
        Task<IResult<IList<User>>> GetAll(TableParamsDto tableParams);
        User GetById(string id);
        Task<IResult<User>> GetByUserName(string username);
        IResult Update(string id, User user, string password = null);
        IResult Delete(int id);
        int CountAllUsers();
    }
}