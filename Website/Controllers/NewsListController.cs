using G4S.Foundation.ModuleBase.Controllers;
using System;
using System.Linq;
using System.Web.Mvc;

namespace G4S.Modules.NewsList.Controllers
{
    public class NewsListController : BaseModuleController<Models.NewsList>
    {
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.NewsList>();
            Models.NewsList newsmodel = new Models.NewsList();
            if (model.NewsRoot != Guid.Empty)
            {
               newsmodel = SitecoreContext.GetItem<Models.NewsList>(model.NewsRoot);
                newsmodel.NewsItems = model.NewsItems.OrderByDescending(x => x.Date).Take(3);
                newsmodel.Title = model.Title;
            }
            else
            {
                newsmodel.Title = "Ingen nyheder at vise";
            }
               
            return PartialView("/Views/NewsList.cshtml", newsmodel);
        }
    }
}