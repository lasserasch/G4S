using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.Text.Models
{
    public class TableRow : BaseModel
    {
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<TableColumn> Columns { get; set; }
    }
}