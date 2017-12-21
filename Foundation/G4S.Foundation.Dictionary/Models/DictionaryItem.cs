using G4S.Foundation.ModuleBase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace G4S.Foundation.Dictionary.Models
{
    public class DictionaryItem : BaseModel
    {
        public string Value { get; set; }
        public string Key { get; set; }
    }
}