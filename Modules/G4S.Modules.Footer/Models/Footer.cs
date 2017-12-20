using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System.Collections.Generic;

namespace G4S.Modules.Footer.Models
{
    public class Footer : BaseModel
    {
        public Glass.Mapper.Sc.Fields.Image IsoImage { get; set; }
        public Glass.Mapper.Sc.Fields.Image LogoImage { get; set; }
        public string CompanyName { get; set; }
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<FooterSection> LinkSections { get; set; }
        public string SocialTitle { get; set; }
        public Glass.Mapper.Sc.Fields.Link FacebookLink { get; set; }
        public Glass.Mapper.Sc.Fields.Link LinkedInLink { get; set; }
        public Glass.Mapper.Sc.Fields.Link YoutubeLink { get; set; }
    }
}