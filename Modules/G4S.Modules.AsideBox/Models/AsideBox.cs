using G4S.Foundation.ModuleBase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace G4S.Modules.AsideBox.Models
{
    public class AsideBox : BaseModel
    {
        public string Title { get; set; }
        public string Text { get; set; }
        public Glass.Mapper.Sc.Fields.Link Link { get; set; }
    }
}