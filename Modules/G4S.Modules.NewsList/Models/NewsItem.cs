using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System;

namespace G4S.Modules.NewsList.Models
{
    [SitecoreType(TemplateId = "{DC32AF2F-E4A0-460F-A8A7-5DCC517D1223}", AutoMap = true)]
    public class NewsItem : BaseModel
    {
        public string Title { get; set; }
        public DateTime Date { get; set; }
        public string SummaryText { get; set; }
        public string Url { get; set; }
    }
}