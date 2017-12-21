using G4S.Foundation.ModuleBase.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace G4S.Modules.ProductList.Controllers
{
    public class ProductListController : BaseModuleController<Models.ProductList>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.ProductList>();
            return PartialView("/Views/ProductList.cshtml", model);
        }
    }
}