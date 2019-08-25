using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace GradePortalAPI.Models.Errors
{
    public class NotFoundCustomException: BaseCustomException
    {
        public NotFoundCustomException(string message) : base(message, (int)HttpStatusCode.NotFound)
        {
        }
    }
}
