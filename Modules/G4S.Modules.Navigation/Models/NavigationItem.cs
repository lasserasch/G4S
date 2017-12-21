using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.Navigation.Models
{
    public class NavigationItem : BaseModel
    {
        public string Name { get; set; }
        public string Url { get; set; }
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<NavigationItem> NavigationItems { get; set; }
        public virtual string NavigationTitle { get; set; }
        public virtual string CssClass { get; set; }
        [SitecoreParent(InferType = false)]
        public virtual NavigationItem Parent { get; set; }
    }
}