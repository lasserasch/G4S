using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.CountrySelector.Models
{
    public class CountrySelector
    {
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<Region> Regions { get; set; }
    }
}