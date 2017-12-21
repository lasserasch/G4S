using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.RichTextElement.Controllers
{
    public class RichTextElementController : BaseModuleController<Models.RichTextElement>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.RichTextElement>();
            return PartialView("/Views/RichTextElement.cshtml", model);
        }

        public ActionResult RightAligned()
        {
            var model = GetDataSourceItem<Models.RichTextElement>();
            return PartialView("/Views/RichTextElementAlignRight.cshtml", model);
        }
    }
}