using G4S.Foundation.ModuleBase.Models;

namespace G4S.Modules.ComparisonChart.Models
{
    public class ChartItem : BaseModel
    {
        public string Header { get; set; }
        public string Title { get; set; }
        public string SubTitle { get; set; }
        public string SubTitleText { get; set; }
        public string InstallationTitle { get; set; }
        public string InstallationPrice { get; set; }
        public string SubscriptionTitle { get; set; }
        public string MounthlyFee { get; set; }
        public string TotalPrice { get; set; }
        public string BonusTitle { get; set; }
        public string BonusText { get; set; }
        public Glass.Mapper.Sc.Fields.Image BonusImage { get; set; }
        public string Text { get; set; }
        public Glass.Mapper.Sc.Fields.Image Image { get; set; }

    }
}