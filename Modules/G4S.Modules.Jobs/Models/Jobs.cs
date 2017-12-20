using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.Jobs.Models
{
    public class Jobs : BaseModel
    {
        public string Title { get; set; }
        public string Text { get; set; }
        public Glass.Mapper.Sc.Fields.Link Link { get; set; }
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<Job> JobList { get; set; }

    }
}