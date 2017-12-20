using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.Navigation.Models
{
    public class NavigationItem : BaseModel
    {
        public string Name { get; set; }
        public Glass.Mapper.Sc.Fields.Link Url { get; set; }
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<NavigationItem> NavigationItems { get; set; }
    }
}