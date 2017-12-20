using System.Web.Mvc;
using G4S.Foundation.ModuleBase.Controllers;

namespace G4S.Modules.HeroSlider.Controllers
{
    public class HeroSliderController : BaseModuleController<Models.HeroSlider>
    {
        // GET: HeroSlider
        public ActionResult SliderContent()
        {
            var model = GetDataSourceItem<Models.HeroSlider>();
            return PartialView("/Views/HeroSliderContent.cshtml", model);
        }

        public ActionResult SliderFull()
        {
            var model = GetDataSourceItem<Models.HeroSlider>();
            return PartialView("/Views/HeroSliderFull.cshtml", model);
        }
    }
}