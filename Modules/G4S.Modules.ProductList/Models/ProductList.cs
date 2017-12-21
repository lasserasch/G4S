using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace G4S.Modules.ProductList.Models
{
    public class ProductList : BaseModel
    {
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<Product> Products { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
    }
}