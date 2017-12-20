using G4S.Foundation.ModuleBase.Models;

namespace G4S.Modules.SegmentPicker.Models
{
    public class SegmentPicker : BaseModel
    {
        public Glass.Mapper.Sc.Fields.Image LeftBackgroundImage { get; set; }
        public Glass.Mapper.Sc.Fields.Image RightBackgroundImage { get; set; }
        public Glass.Mapper.Sc.Fields.Link LeftLink { get; set; }
        public Glass.Mapper.Sc.Fields.Link RightLink { get; set; }
        public string LeftTitle { get; set; }
        public string RightTitle { get; set; }
        public string LeftText { get; set; }
        public string RightText { get; set; }

    }
}