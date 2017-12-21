using G4S.Foundation.ModuleBase.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace G4S.Modules.Breadcrumb.Controllers
{
    public class BreadcrumbController : BaseModuleController<Models.Breadcrumb>
    {
        public override ActionResult Index()
        {
            var model = new Models.Breadcrumb();
            var homeElement = SitecoreContext.GetHomeItem<Models.BreadcrumbElement>();
            var currentElement = SitecoreContext.GetCurrentItem<Models.BreadcrumbElement>();
            currentElement.IsCurrent = true;

            model.Elements = new List<Models.BreadcrumbElement>
            {
                currentElement
            };

            bool hasReachedHome = false;
            while (!hasReachedHome)
            {
                if (currentElement == null)
                    break;

                else if (currentElement.Parent == null)
                    break;

                else if (currentElement.Parent.Id == homeElement.Id)
                    hasReachedHome = true;

                model.Elements.Add(currentElement.Parent);
                currentElement = currentElement.Parent;
            }

            model.Elements.Reverse();

            return PartialView("/Views/Breadcrumb.cshtml", model);
        }
    }
}