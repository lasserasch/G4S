using G4S.Foundation.ModuleBase.Models;

namespace G4S.Modules.Video.Models
{
    public class Video : BaseModel
    {
        public Glass.Mapper.Sc.Fields.Image Image { get; set; }
        public string VideoUrl { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }


    }
}