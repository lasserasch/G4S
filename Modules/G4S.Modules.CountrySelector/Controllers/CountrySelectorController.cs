using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.CountrySelector.Controllers
{
    public class CountrySelectorController : BaseModuleController<Models.CountrySelector>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.CountrySelector>();
            return PartialView("/Views/CountrySelector.cshtml", model);
        }
    
    }
}