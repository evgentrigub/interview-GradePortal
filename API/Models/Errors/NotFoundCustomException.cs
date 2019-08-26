using System.Net;

namespace GradePortalAPI.Models.Errors
{
    public class NotFoundCustomException : BaseCustomException
    {
        public NotFoundCustomException(string message) : base(message, (int) HttpStatusCode.NotFound)
        {
        }
    }
}