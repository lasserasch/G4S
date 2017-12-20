using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.HeroSlider.Models
{
    public class HeroSlider : BaseModel
    {
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<HeroSlide> Slides { get; set; }
    }
}