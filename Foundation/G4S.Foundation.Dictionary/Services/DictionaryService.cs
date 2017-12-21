using G4S.Configuration.Core.Interfaces;
using Glass.Mapper.Sc.Web.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace G4S.Foundation.Dictionary.Services
{
    public class DictionaryService : GlassController, IDictionaryService
    {
        private readonly Models.Dictionary _dictionary;
        public DictionaryService()
        {
           _dictionary = SitecoreContext.GetItem<Models.Dictionary>(Guid.Parse("{BDB1D35B-9BD5-4069-9887-192454328A48}"));
         
        }
        public string GetDictionaryValue(string key)
        {
            if (_dictionary == null)
                return "Dictionary not found";

            var result = _dictionary.DictionaryItems.FirstOrDefault(x => x.Key.ToLower() == key.ToLower());
            if (result != null)
            {
                return result.Value;
            }
            return string.Format("Dictionary item with key '{0}' could not be found", key);
        }
    }
}