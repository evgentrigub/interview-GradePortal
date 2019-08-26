namespace GradePortalAPI.Models.Errors
{
    public class BaseCustomException
    {
        public BaseCustomException(string message, int status)
        {
            Message = message;
            Status = status;
        }

        public string Message { get; }
        public int Status { get; }
    }
}