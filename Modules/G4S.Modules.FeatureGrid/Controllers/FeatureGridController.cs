using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.FeatureGrid.Controllers
{
    public class FeatureGridController : BaseModuleController<Models.FeatureGrid>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.FeatureGrid>();
            return PartialView("/Views/FeatureGrid.cshtml", model);
        }
    }
}