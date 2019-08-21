using System.Collections.Generic;
using GradePortalAPI.Dtos;
using GradePortalAPI.Models.Interfaces.Base;

namespace GradePortalAPI.Models.Interfaces
{
    public interface IUserService
    {
        User Authenticate(string username, string password);
        IEnumerable<User> GetAll(TableParamsDto tableParams);
        User GetById(string id);
        User GetByUserName(string username);
        IResult<User> Create(User user, string password);
        void Update(string id, User user, string password = null);
        void Delete(int id);
        int CountAllUsers();
    }
}