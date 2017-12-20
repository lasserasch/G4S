using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.Service.Models
{
    public class Service : BaseModel
    {
        public string Title { get; set; }
        public string Text { get; set; }
        public Glass.Mapper.Sc.Fields.Link Link { get; set; }
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<ServiceLink> ServiceLinks { get; set; }
    }
}