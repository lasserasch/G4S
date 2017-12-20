using G4S.Foundation.ModuleBase.Models;


namespace G4S.Modules.HeroSlider.Models
{
  
    public class HeroSlide : BaseModel
    {
        public string Title { get; set; }
        public string NavigationTitle { get; set; }
        public string Text { get; set; }
        public Glass.Mapper.Sc.Fields.Image Image { get; set; }
        public Glass.Mapper.Sc.Fields.Link Link { get; set; }
        public string FocusTitle { get; set; }
        public string FocusSubtitle { get; set; }
        public string FocusText { get; set; }
        



    }
}