using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.Service.Controllers
{
    public class ServiceController : BaseModuleController<Models.Service>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.Service>();
            return PartialView("/Views/Service.cshtml", model);
        }
    }
}