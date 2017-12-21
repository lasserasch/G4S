using G4S.Configuration.Core.Interfaces;
using G4S.Foundation.ModuleBase.Controllers;
using System;
using System.Linq;
using System.Web.Mvc;

namespace G4S.Modules.NewsList.Controllers
{
    public class NewsListController : BaseModuleController<Models.NewsList>
    {
        private readonly IDictionaryService _dictionaryService;
        public NewsListController(IDictionaryService dictionaryService)
        {
            _dictionaryService = dictionaryService;
        }
        public override ActionResult Index()
        {
            var model = GetDataSourceItem<Models.NewsList>();
            var newsmodel = new Models.NewsList();

            newsmodel.Title = _dictionaryService.GetDictionaryValue("newsrootnotset");
            if (model.NewsRoot != Guid.Empty)
            {
                newsmodel = SitecoreContext.GetItem<Models.NewsList>(model.NewsRoot);

                if (newsmodel != null)
                {
                    newsmodel.Title = _dictionaryService.GetDictionaryValue("nonewstoshow");
                    if (newsmodel.NewsItems != null)
                    {
                        newsmodel.NewsItems = newsmodel.NewsItems.OrderByDescending(x => x.Date).Take(3);
                        newsmodel.Title = model.Title;
                    }
                }
            }
            newsmodel.ReadNewsLinkText = _dictionaryService.GetDictionaryValue("readnewslinktext");
            return PartialView("/Views/NewsList.cshtml", newsmodel);
        }
    }
}