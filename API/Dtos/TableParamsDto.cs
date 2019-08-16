using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GradePortalAPI.Dtos
{
    public class TableParamsDto
    {
        private int pageSize;
        public int Page{ get; set; }
        public int PageSize
        {
            get => pageSize <= 0 ? 10 : this.pageSize;
            set => pageSize = value > 5000 ? 5000 : value;
        }

        public int Skip() => Page * PageSize;
        public int Take() => PageSize;
    }
}
