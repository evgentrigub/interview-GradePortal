namespace GradePortalAPI.Models.Errors
{
    public class CustomErrorResponse
    {
        public string Message { get; set; }
        public string Description { get; set; }
        public int Status { get; set; }
    }
}