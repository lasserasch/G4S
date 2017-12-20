using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.Jobs.Controllers
{
    public class JobController : BaseModuleController<Models.Jobs>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.Jobs>();
            return PartialView("/Views/Jobs.cshtml", model);
        }
    }
}