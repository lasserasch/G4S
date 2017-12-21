using G4S.Configuration.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace G4S.Foundation.Search.Models
{
    public class SearchResult : ISearchResult
    {
        public string Title { get; set; }
        public string Text { get; set; }
        public string Url { get; set; }
    }
}