namespace GradePortalAPI.Dtos
{
    public class TableParamsDto
    {
        private int _pageSize;
        public int Page { get; set; }

        public int PageSize
        {
            get => _pageSize <= 0 ? 10 : _pageSize;
            set => _pageSize = value > 5000 ? 5000 : value;
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