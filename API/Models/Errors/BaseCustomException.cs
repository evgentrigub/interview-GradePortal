using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GradePortalAPI.Models.Errors
{
    public class BaseCustomException: Exception
    {
        public int Status { get; set; }
        public string Description { get; set; }
        public BaseCustomException(string message, string description, int status) : base(message)
        {
            Status = status;
            Description = description;
        }
    }
}
