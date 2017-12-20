using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.ComparisonChart.Models
{
    public class ComparisonChart : BaseModel
    {
        public string Title { get; set; }
        public Glass.Mapper.Sc.Fields.Link Link { get; set; }
        public string Text { get; set; }
        public Glass.Mapper.Sc.Fields.Image BackgroundImage { get; set; }
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<ChartItem> Items { get; set; }
    }
}