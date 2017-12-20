using G4S.Foundation.ModuleBase.Controllers;
using System.Linq;
using System.Web.Mvc;

namespace G4S.Modules.NewsList.Controllers
{
    public class NavigationController : BaseModuleController<Models.NewsList>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.NewsList>();

            var newsmodel = SitecoreContext.GetItem<Models.NewsList>(model.NewsRoot);
            newsmodel.NewsItems = model.NewsItems.OrderByDescending(x => x.Date).Take(3);
            newsmodel.Title = model.Title;
            
            return PartialView("/Views/NewsList.cshtml", newsmodel);
        }
    }
}