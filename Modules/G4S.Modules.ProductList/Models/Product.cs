using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace G4S.Modules.ProductList.Models
{
    [SitecoreType(TemplateId = "{6341359D-B56B-413D-BC54-2A9C371FDFD7}", AutoMap = true)]
    public class Product : BaseModel
    {
        public string Title { get; set; }
        public string Text { get; set; }
        public Glass.Mapper.Sc.Fields.Image Image { get; set; }
        public Glass.Mapper.Sc.Fields.Link Link { get; set; }
    }
}