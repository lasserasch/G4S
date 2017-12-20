using G4S.Foundation.ModuleBase.Models;

namespace G4S.Modules.Service.Models
{
    public class ServiceLink : BaseModel
    {
        public string Title { get; set; }
        public string Text { get; set; }
        public Glass.Mapper.Sc.Fields.Link Link { get; set; }
    }
}