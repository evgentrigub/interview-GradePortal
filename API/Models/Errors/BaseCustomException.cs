using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GradePortalAPI.Models.Errors
{
    public class BaseCustomException
    {
        public string Message { get; }
        public int Status { get; }

        public BaseCustomException(string message, int status)
        {
            Message = message;
            Status = status;
        }
    }
}
