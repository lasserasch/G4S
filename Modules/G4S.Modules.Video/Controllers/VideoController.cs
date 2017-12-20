using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.Video.Controllers
{
    public class VideoController : BaseModuleController<Models.Video>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.Video>();
            return PartialView("/Views/Video.cshtml", model);
        }
    }
}