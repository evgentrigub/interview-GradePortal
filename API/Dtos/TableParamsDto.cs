namespace GradePortalAPI.Dtos
{
    public class TableParamsDto
    {
        private int pageSize;
        public int Page { get; set; }

        public int PageSize
        {
            get => pageSize <= 0 ? 10 : pageSize;
            set => pageSize = value > 5000 ? 5000 : value;
        }

        public int Skip()
        {
            return Page * PageSize;
        }

        public int Take()
        {
            return PageSize;
        }
    }
}