using System.Net;

namespace GradePortalAPI.Models.Errors
{
    public class BadRequestCustomException : BaseCustomException
    {
        public BadRequestCustomException(string message) : base(message, (int) HttpStatusCode.BadRequest)
        {
        }
    }
}