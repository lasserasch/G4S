using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.RowOneElement.Controllers
{
    public class RowOneElementController : BaseModuleController<Models.RowOneElement>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.RowOneElement>();
            return PartialView("/Views/RowOneElement.cshtml", model);
        }
    }
}