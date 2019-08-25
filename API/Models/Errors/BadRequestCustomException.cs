using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace GradePortalAPI.Models.Errors
{
    public class BadRequestCustomException: BaseCustomException
    {
        public BadRequestCustomException(string message) : base(message, (int)HttpStatusCode.BadRequest)
        {
        }
    }
}
