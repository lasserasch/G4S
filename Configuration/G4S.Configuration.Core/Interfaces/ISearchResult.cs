using System;
using System.Collections.Generic;
using System.Text;

namespace G4S.Configuration.Core.Interfaces
{
    public interface ISearchResult
    {
        string Title { get; set; }
        string Text { get; set; }
        string Url { get; set; }
    }
}
