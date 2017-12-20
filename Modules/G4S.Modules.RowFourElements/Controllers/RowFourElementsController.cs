using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.RowFourElements.Controllers
{
    public class RowFourElementsController : BaseModuleController<Models.RowFourElements>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.RowFourElements>();
            return PartialView("/Views/RowFourElements.cshtml", model);
        }
    }
}