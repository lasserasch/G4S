using G4S.Foundation.ModuleBase.Models;

namespace G4S.Modules.YoutubePlayer.Models
{
    public class YoutubePlayer : BaseModel
    {
        public string VideoId { get; set; }
        public Glass.Mapper.Sc.Fields.Image BackgroundImage { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
    }
}