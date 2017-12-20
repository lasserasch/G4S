using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.Text.Controllers
{
    public class TextController : BaseModuleController<Models.Text>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.Text>();
            return PartialView("/Views/Text.cshtml", model);
        }
    }
}