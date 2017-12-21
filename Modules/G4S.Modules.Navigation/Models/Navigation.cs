using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.Navigation.Models
{
    public class Navigation
    {
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<NavigationItem> NavigationItems { get; set; }
        public string ChooseCountryText { get; set; }
    }
}