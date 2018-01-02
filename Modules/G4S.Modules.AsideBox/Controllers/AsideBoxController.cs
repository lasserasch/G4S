using G4S.Foundation.ModuleBase.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace G4S.Modules.AsideBox.Controllers
{
    public class AsideBoxController : BaseModuleController<Models.AsideBox>
    {
        public ActionResult GreyBox()
        {
            var model = GetDataSourceItem<Models.AsideBox>();
            return PartialView("/Views/GreyBox.cshtml", model);
        }
        public ActionResult RedBox()
        {
            var model = GetDataSourceItem<Models.AsideBox>();
            return PartialView("/Views/RedBox.cshtml", model);
        }
        public ActionResult WhiteBox()
        {
            var model = GetDataSourceItem<Models.AsideBox>();
            return PartialView("/Views/WhiteBox.cshtml", model);
        }
    }
}