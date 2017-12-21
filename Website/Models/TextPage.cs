using G4S.Foundation.ModuleBase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Website.Models
{
    public class TextPage : BaseModel
    {
        public string Title { get; set; }
        public string FirstSectionContent { get; set; }
        public string SecondSectionContent { get; set; }
        public string ThirdSectionContent { get; set; }
        public string Label { get; set; }
    }
}