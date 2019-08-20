using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace GradePortalAPI.Dtos
{
    public class SearchOptionsDto: TableParamsDto
    {
        public string SerializedFilters { get; set; }

        public Dictionary<string, string> Filters
        {
            get
            {
                if (!string.IsNullOrWhiteSpace(SerializedFilters))
                {
                    var deserializedFilters =
                        JsonConvert.DeserializeObject<IEnumerable<KeyValuePair<string, string>>>(SerializedFilters);
                    return deserializedFilters.ToDictionary(x => x.Key, x => x.Value);
                }

                return new Dictionary<string, string>();
            }
        }
    }
}