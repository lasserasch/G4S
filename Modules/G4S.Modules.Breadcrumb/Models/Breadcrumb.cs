using G4S.Foundation.ModuleBase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace G4S.Modules.Breadcrumb.Models
{
    public class Breadcrumb : BaseModel
    {
        public List<BreadcrumbElement> Elements { get; set; }
    }
}