using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.CountrySelector.Models
{
    public class Site : BaseModel
    {
       
        public Glass.Mapper.Sc.Fields.Link Link { get; set; }

        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<Site> Sites { get; set; }
    }
}