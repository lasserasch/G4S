using G4S.Foundation.ModuleBase.Models;
using System;

namespace G4S.Modules.NewsList.Models
{
    public class NewsItem : BaseModel
    {
        public string Title { get; set; }
        public DateTime Date { get; set; }
        public string Text { get; set; }
        public Glass.Mapper.Sc.Fields.Link Url { get; set; }
    }
}