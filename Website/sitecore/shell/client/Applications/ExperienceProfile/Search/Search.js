define(["sitecore", "../Common/DataProviderHelper.js", "/-/speak/v1/experienceprofile/CintelUtl.js"], function (sc, providerHelper, cintelUtil) {
    var textProperty = "text";
    var isVisibleProperty = "isVisible";

    var contactsPath = "/contacts";
    var baseUrl = "/sitecore/api/ao/v1" + contactsPath + "/";

    var app = sc.Definitions.App.extend({
        _pageSize: 0,
        initialized: function () {
            this._pageSize = this.SearchDataProvider.get('pageSize');
            var searchTable = "search";

            providerHelper.setupHeaders([
              { urlKey: contactsPath + "/" + searchTable + "?", headerValue: "default" }
            ]);

            providerHelper.initProvider(this.SearchDataProvider, "ContactSearchResults", baseUrl + searchTable, this.SearchMessageBar);
            providerHelper.subscribeAccordionHeader(this.SearchDataProvider, this.ResultsAccordion);
            providerHelper.subscribeSorting(this.SearchDataProvider, this.SearchResults);
            providerHelper.setDefaultSorting(this.SearchDataProvider, "visitCount", true); ////// 

            var searchText = decodeURIComponent(cintelUtil.getQueryParam(textProperty));
            this.SearchTextBox.set(textProperty, searchText);
            this.setDefaultDate();
            this.toggleFiltersVisibility();
            this.findContacts();

            cintelUtil.removeBreadCrumbLastLink(this.Breadcrumb);
            this.SearchResults.on("change:items", cintelUtil.removeMailLink, this.SearchResults);
            this.on('getMoreData', this.getMoreData, this);
        },
        setDefaultDate: function () {
            var _date = new Date();
            var fromDate = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate());

            fromDate.setDate(fromDate.getDate() - 30);
            fromDate = fromDate.getFullYear().toString()
                          + (fromDate.getMonth().toString().length == 1 ? "0" + (fromDate.getMonth() + 1).toString() : fromDate.getMonth().toString())
                          + (fromDate.getDate().toString().length == 1 ? "0" + fromDate.getDate().toString() : fromDate.getDate().toString());

            _date = new Date();
            var toDate = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate() + 1);
            toDate = toDate.getFullYear().toString()
                          + (toDate.getMonth().toString().length == 1 ? "0" + (toDate.getMonth() + 1).toString() : toDate.getMonth().toString())
                          + (toDate.getDate().toString().length == 1 ? "0" + toDate.getDate().toString() : toDate.getDate().toString());

            this.FromDatePick.set("date", fromDate);
            this.ToDatePick.set("date", toDate);
        },
        findContacts: function () {
            var match = this.SearchTextBox.get(textProperty) || "*";

            if (!this.ResultsBorder.get(isVisibleProperty)) {
                this.ResultsBorder.viewModel.show();
            }

            history.pushState(null, null, "search?text=" + encodeURIComponent(match));

            providerHelper.addQueryParameter(this.SearchDataProvider, "match", encodeURIComponent(match));
            providerHelper.addQueryParameter(this.SearchDataProvider, "searchfromdatefilter", encodeURIComponent(this.FromDatePick.get("formattedDate")));
            providerHelper.addQueryParameter(this.SearchDataProvider, "searchtodatefilter", encodeURIComponent(this.ToDatePick.get("formattedDate")));
            this.setChannelFilters();
            this.setCampaignFilters();
            this.setOutcomeFilters();
            this.setGoalFilters();
            this.setProfileFilters();
            this.setDeviceFilters();
            providerHelper.getListData(this.SearchDataProvider);
        },
        setChannelFilters: function () {
            var ChannelFilterIDs = this.ChannelsTreeview.get("checkedItemIds");
            var SearchChannelFilters;
            if (ChannelFilterIDs != null && ChannelFilterIDs != "") {
                ChannelFilterIDs = ChannelFilterIDs.toString();
                ChannelFilterIDs = ChannelFilterIDs.split('|').join(',').replace(/{/g, "{\"ItemId\": \"").replace(/}/g, "\"}");
                SearchChannelFilters = this.applyFilterFormatter("CHANNEL_FILTERS", ChannelFilterIDs);
                providerHelper.addQueryParameter(this.SearchDataProvider, "searchchannelfilters", encodeURIComponent(JSON.stringify(SearchChannelFilters)));
            }
            else { SearchChannelFilters = null; }
            providerHelper.addQueryParameter(this.SearchDataProvider, "searchchannelfilters", encodeURIComponent(JSON.stringify(SearchChannelFilters)));
        },
        setCampaignFilters: function () {
            var CampaignFilterIDs = this.CampaignsTreeview.get("checkedItemIds");
            var SearchCampaignFilters;
            if (CampaignFilterIDs != null && CampaignFilterIDs != "") {
                CampaignFilterIDs = CampaignFilterIDs.toString();
                CampaignFilterIDs = CampaignFilterIDs.split('|').join(',').replace(/{/g, "{\"ItemId\": \"").replace(/}/g, "\"}");
                SearchCampaignFilters = this.applyFilterFormatter("CAMPAIGN_FILTERS", CampaignFilterIDs);
            }
            else { SearchCampaignFilters = null; }
            providerHelper.addQueryParameter(this.SearchDataProvider, "searchcampaignfilters", encodeURIComponent(JSON.stringify(SearchCampaignFilters)));
        },
        setOutcomeFilters: function () {
            var OutcomeFilterIDs = this.OutcomeTreeview.get("checkedItemIds");
            var SearchOutcomeFilters;
            if (OutcomeFilterIDs != null && OutcomeFilterIDs != "") {
                OutcomeFilterIDs = OutcomeFilterIDs.toString();
                OutcomeFilterIDs = OutcomeFilterIDs.split('|').join(',').replace(/{/g, "{\"ItemId\": \"").replace(/}/g, "\"}");
                SearchOutcomeFilters = this.applyFilterFormatter("OUTCOME_FILTERS", OutcomeFilterIDs);
            }
            else { SearchOutcomeFilters = null; }
            providerHelper.addQueryParameter(this.SearchDataProvider, "searchoutcomefilters", encodeURIComponent(JSON.stringify(SearchOutcomeFilters)));
        },
        setGoalFilters: function () {
            var GoalFilterIDs = this.GoalsTreeview.get("checkedItemIds");
            var SearchGoalFilters;
            if (GoalFilterIDs != null && GoalFilterIDs != "") {
                GoalFilterIDs = GoalFilterIDs.toString();
                GoalFilterIDs = GoalFilterIDs.split('|').join(',').replace(/{/g, "{\"ItemId\": \"").replace(/}/g, "\"}");
                SearchGoalFilters = this.applyFilterFormatter("GOAL_FILTERS", GoalFilterIDs);
            }
            else { SearchGoalFilters = null; }
            providerHelper.addQueryParameter(this.SearchDataProvider, "searchgoalfilters", encodeURIComponent(JSON.stringify(SearchGoalFilters)));
        },
        setProfileFilters: function () {
            var ProfileFilterIDs = this.ProfilesTreeview.get("checkedItemIds");
            var SearchProfileFilters;
            if (ProfileFilterIDs != null && ProfileFilterIDs != "") {
                ProfileFilterIDs = ProfileFilterIDs.toString();
                ProfileFilterIDs = ProfileFilterIDs.split('|').join(',').replace(/{/g, "{\"ItemId\": \"").replace(/}/g, "\"}");
                SearchProfileFilters = this.applyFilterFormatter("PROFILE_FILTERS", ProfileFilterIDs);
            }
            else { SearchProfileFilters = null; }
            providerHelper.addQueryParameter(this.SearchDataProvider, "searchprofilefilters", encodeURIComponent(JSON.stringify(SearchProfileFilters)));
        },
        setDeviceFilters: function () {
            var DeviceFilterIDs = this.DevicesTreeview.get("checkedItemIds");
            var SearchDeviceFilters;
            if (DeviceFilterIDs != null && DeviceFilterIDs != "") {
                DeviceFilterIDs = DeviceFilterIDs.toString();
                DeviceFilterIDs = DeviceFilterIDs.split('|').join(',').replace(/{/g, "{\"ItemId\": \"").replace(/}/g, "\"}");
                SearchDeviceFilters = this.applyFilterFormatter("DEVICE_FILTERS", DeviceFilterIDs);
            }
            else { SearchDeviceFilters = null; }
            providerHelper.addQueryParameter(this.SearchDataProvider, "searchdevicefilters", encodeURIComponent(JSON.stringify(SearchDeviceFilters)));
        },
        getMoreData: function () {
            providerHelper.getMoreListData(this.SearchDataProvider, this._pageSize);
        },
        toggleFiltersVisibility: function () {
            this.LeftContentBorder.toggle();
            if (this.LeftContentBorder.attributes.isVisible) {
                $("div[data-sc-id='RightContentBorder']").width("75%");
            }
            else {
                $("div[data-sc-id='RightContentBorder']").width("");
            }
        },
        applyFilterFormatter: function (FILTER_NAME, FILTER_IDs) {
            var jsonFormatterString = '{"name": "<FILTER_NAME>", "SearchItems": [<FILTER_IDs>]}';
            var filterJSON = jsonFormatterString.replace("<FILTER_NAME>", FILTER_NAME);
            filterJSON = filterJSON.replace("<FILTER_IDs>", FILTER_IDs);
            return JSON.parse(filterJSON);
        }
    });
    return app;
});