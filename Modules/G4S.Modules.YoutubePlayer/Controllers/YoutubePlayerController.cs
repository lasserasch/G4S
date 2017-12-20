using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.YoutubePlayer.Controllers
{
    public class YoutubePlayerController : BaseModuleController<Models.YoutubePlayer>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.YoutubePlayer>();
            return PartialView("/Views/YoutubePlayer.cshtml", model);
        }
    }
}