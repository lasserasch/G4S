using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.SegmentPicker.Controllers
{
    public class SegmentPickerController : BaseModuleController<Models.SegmentPicker>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.SegmentPicker>();
            return PartialView("/Views/SegmentPicker.cshtml", model);
        }
    }
    
}