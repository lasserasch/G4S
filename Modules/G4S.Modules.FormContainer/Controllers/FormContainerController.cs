using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.FormContainer.Controllers
{
    public class FormContainerController : BaseModuleController<Models.FormContainer>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.FormContainer>();
            return PartialView("/Views/FormContainer.cshtml", model);
        }
    }
}