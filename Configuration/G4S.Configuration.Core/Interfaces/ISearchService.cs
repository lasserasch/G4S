using System;
using System.Collections.Generic;
using System.Text;

namespace G4S.Configuration.Core.Interfaces
{
    public interface ISearchService
    {
        List<ISearchResult> Search(string query);
    }
}
