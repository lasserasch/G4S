using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.Footer.Controllers
{
    public class FooterController : BaseModuleController<Models.Footer>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.Footer>();
            return PartialView("/Views/Footer.cshtml", model);
        }
    }
}