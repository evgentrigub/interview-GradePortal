using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace GradePortalAPI.Models.Errors
{
    public class BadRequestCustomException: BaseCustomException
    {
        public BadRequestCustomException(string message, string description) : base(message, description, (int)HttpStatusCode.BadRequest)
        {
            Status = (int)HttpStatusCode.BadRequest;
        }
    }
}
