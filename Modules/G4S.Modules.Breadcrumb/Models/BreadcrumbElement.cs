using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace G4S.Modules.Breadcrumb.Models
{
    public class BreadcrumbElement : BaseModel
    {
        public virtual string Title { get; set; }
        public virtual string Url { get; set; }
        public bool IsCurrent { get; set; }
        [SitecoreParent(InferType = false)]
        public virtual BreadcrumbElement Parent { get; set; }
        public virtual string Name { get; set; }
    }
}