using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System;
using System.Collections.Generic;

namespace G4S.Modules.NewsList.Models
{
    public class NewsList : BaseModel
    {
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<NewsItem> NewsItems { get; set; }
        public Guid NewsRoot { get; set; }
        public string Title { get; set; }
    }
}