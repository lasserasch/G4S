using G4S.Foundation.ModuleBase.Models;

namespace G4S.Modules.Text.Models
{
    public class TableColumn : BaseModel
    {
        public string Text { get; set; }
        public bool CenterText { get; set; }
    }
}