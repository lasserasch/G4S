using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.Splitter.Controllers
{
    public class SplitterController : BaseModuleController<Models.Splitter>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.Splitter>();
            return PartialView("/Views/Splitter.cshtml", model);
        }
    }
}