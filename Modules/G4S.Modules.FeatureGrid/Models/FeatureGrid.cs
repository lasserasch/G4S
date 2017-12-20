using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.FeatureGrid.Models
{
    public class FeatureGrid : BaseModel
    {
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<GridItem> Items { get; set; }
    }
}