using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.Text.Models
{
    public class Text : BaseModel
    {
        public string Title { get; set; }
        public string Value { get; set; }
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<TableRow> Rows { get; set; }

    }
}