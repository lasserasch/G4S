using G4S.Foundation.ModuleBase.Models;

namespace G4S.Modules.RowOneElement.Models
{
    public class RowOneElement : BaseModel
    {
        public Glass.Mapper.Sc.Fields.Image BackgroundImage { get; set; }
        public bool Short { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
        public string ButtonClass { get; set; }
        public Glass.Mapper.Sc.Fields.Link Link { get; set; }
    }
}