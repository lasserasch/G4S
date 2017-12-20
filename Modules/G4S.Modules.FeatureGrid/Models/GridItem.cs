using G4S.Foundation.ModuleBase.Models;

namespace G4S.Modules.FeatureGrid.Models
{
    public class GridItem : BaseModel
    {
        public string Title { get; set; }
        public string Text { get; set; }
        public Glass.Mapper.Sc.Fields.Image Image { get; set; }

    }
}