using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.Navigation.Controllers
{
    public class NavigationController : BaseModuleController<Models.Navigation>
    {
        public override ActionResult Index()
        {
            var model = SitecoreContext.GetHomeItem<Models.Navigation>();
            return PartialView("/Views/Navigation.cshtml", model);
        }
    }
}