using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.ComparisonChart.Controllers
{
    public class ComparisonChartController : BaseModuleController<Models.ComparisonChart>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.ComparisonChart>();
            return PartialView("/Views/ComparisonChart.cshtml", model);
        }
    }
}