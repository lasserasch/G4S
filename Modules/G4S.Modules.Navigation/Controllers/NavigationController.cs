using G4S.Configuration.Core.Interfaces;
using G4S.Foundation.ModuleBase.Controllers;
using System.Web.Mvc;

namespace G4S.Modules.Navigation.Controllers
{

    public class NavigationController : BaseModuleController<Models.Navigation>
    {
        private readonly IDictionaryService _dictionaryService;
        public NavigationController(IDictionaryService dictionaryService)
        {
            _dictionaryService = dictionaryService;
        }
        public override ActionResult Index()
        {
            var model = SitecoreContext.GetHomeItem<Models.Navigation>();
            foreach (var item in model.NavigationItems)
            {
                AddCssClassToNavItem(item);
            }
            model.ChooseCountryText = _dictionaryService.GetDictionaryValue("choosecountrytext");
            return PartialView("/Views/Navigation.cshtml", model);
        }

        public ActionResult AsideNavigation()
        {
            var model = SitecoreContext.GetHomeItem<Models.Navigation>();
            foreach (var item in model.NavigationItems)
            {
                AddCssClassToNavItem(item);
            }
            model.ChooseCountryText = _dictionaryService.GetDictionaryValue("choosecountrytext");
            return PartialView("/Views/AsideNavigation.cshtml", model);
        }

        private void AddCssClassToNavItem(Models.NavigationItem item)
        {
            var currentitem = SitecoreContext.GetCurrentItem<Models.NavigationItem>();
            item.CssClass = "";
            if (currentitem.Parent != null && currentitem.Parent.Id == item.Id)
            {
                item.CssClass += " is-open";
            }
            else if (currentitem.Parent != null && currentitem.Parent.Parent != null && currentitem.Parent.Parent.Id == item.Id)
            {
                item.CssClass += " is-open";
            }
            if (item.Id == currentitem.Id)
            {
                item.CssClass += " is-current is-open";
            }
            else
            {
                if (item.NavigationItems != null)
                {
                    foreach (var i in item.NavigationItems)
                    {
                        AddCssClassToNavItem(i);
                    }
                }
            }
        }
    }
}