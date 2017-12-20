using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.Footer.Models
{
    public class FooterSection : BaseModel
    {
        public string Title { get; set; }
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<FooterLink> Links { get; set; }
    }
}