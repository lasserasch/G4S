using G4S.Foundation.ModuleBase.Models;
using Glass.Mapper.Sc.Configuration.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace G4S.Foundation.Dictionary.Models
{
    public class Dictionary : BaseModel
    {
        [SitecoreChildren(InferType = true)]
        public virtual IEnumerable<DictionaryItem> DictionaryItems { get; set; }
    }
}