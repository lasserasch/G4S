CREATE TABLE [dbo].[Accounts] (
    [AccountId]        UNIQUEIDENTIFIER NOT NULL,
    [BusinessName]     NVARCHAR (100)   NOT NULL,
    [Country]          NVARCHAR (100)   NOT NULL,
    [Classification]   INT              NOT NULL,
    [IntegrationId]    UNIQUEIDENTIFIER NULL,
    [IntegrationLabel] NVARCHAR (100)   NULL,
    [ExternalUser]     NVARCHAR (256)   NULL,
    PRIMARY KEY CLUSTERED ([AccountId] ASC)
);

GO
CREATE TABLE [dbo].[Assets] (
    [AssetId] UNIQUEIDENTIFIER NOT NULL,
    [Url]     VARCHAR (800)    NOT NULL
);

GO
CREATE TABLE [dbo].[BusinessUnits] (
    [BusinessUnitId] UNIQUEIDENTIFIER NOT NULL,
    [AccountId]      UNIQUEIDENTIFIER NOT NULL,
    [BusinessName]   NVARCHAR (100)   NULL,
    [Country]        NVARCHAR (100)   NULL,
    [Region]         NVARCHAR (100)   NULL,
    [City]           NVARCHAR (100)   NULL,
    PRIMARY KEY CLUSTERED ([BusinessUnitId] ASC)
);

GO
CREATE TABLE [dbo].[Contacts] (
    [ContactId]              UNIQUEIDENTIFIER NOT NULL,
    [AuthenticationLevel]    INT              NOT NULL,
    [Classification]         INT              NOT NULL,
    [ContactTags]            XML              NULL,
    [IntegrationLevel]       INT              NOT NULL,
    [ExternalUser]           NVARCHAR (100)   NULL,
    [OverrideClassification] INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([ContactId] ASC)
);

GO
CREATE TABLE [dbo].[DeviceNames] (
    [DeviceNameId] INT            NOT NULL,
    [DeviceName]   NVARCHAR (100) NOT NULL
);

GO
CREATE TABLE [dbo].[DimensionKeys] (
    [DimensionKeyId] BIGINT         NOT NULL,
    [DimensionKey]   NVARCHAR (MAX) NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_AutomationStates] (
    [PlanId]   UNIQUEIDENTIFIER NOT NULL,
    [StateId]  UNIQUEIDENTIFIER NOT NULL,
    [Contacts] BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_CampaignMetrics] (
    [SegmentRecordId] BIGINT           NOT NULL,
    [SegmentId]       UNIQUEIDENTIFIER NOT NULL,
    [Date]            SMALLDATETIME    NOT NULL,
    [SiteNameId]      INT              NOT NULL,
    [DimensionKeyId]  BIGINT           NOT NULL,
    [Visits]          INT              NOT NULL,
    [Value]           INT              NOT NULL,
    [MonetaryValue]   MONEY            NOT NULL,
    [Bounces]         INT              NOT NULL,
    [Conversions]     INT              NOT NULL,
    [Pageviews]       INT              NOT NULL,
    [TimeOnSite]      INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_ChannelMetrics] (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_Conversions] (
    [Date]         SMALLDATETIME    NOT NULL,
    [TrafficType]  INT              NOT NULL,
    [ContactId]    UNIQUEIDENTIFIER NOT NULL,
    [CampaignId]   UNIQUEIDENTIFIER NOT NULL,
    [GoalId]       UNIQUEIDENTIFIER NOT NULL,
    [SiteNameId]   INT              NOT NULL,
    [DeviceNameId] INT              NOT NULL,
    [LanguageId]   INT              NOT NULL,
    [AccountId]    UNIQUEIDENTIFIER NOT NULL,
    [ItemId]       UNIQUEIDENTIFIER NOT NULL,
    [GoalPoints]   BIGINT           NOT NULL,
    [Visits]       BIGINT           NOT NULL,
    [Value]        BIGINT           NOT NULL,
    [Count]        BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_ConversionsMetrics] (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_DeviceMetrics] (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_DownloadEventMetrics] (
    [SegmentRecordId] BIGINT           NOT NULL,
    [SegmentId]       UNIQUEIDENTIFIER NOT NULL,
    [Date]            SMALLDATETIME    NOT NULL,
    [SiteNameId]      INT              NOT NULL,
    [DimensionKeyId]  BIGINT           NOT NULL,
    [Visits]          INT              NOT NULL,
    [Value]           INT              NOT NULL,
    [Count]           INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_Downloads] (
    [Date]         SMALLDATETIME    NOT NULL,
    [TrafficType]  INT              NOT NULL,
    [CampaignId]   UNIQUEIDENTIFIER NOT NULL,
    [SiteNameId]   INT              NOT NULL,
    [DeviceNameId] INT              NOT NULL,
    [LanguageId]   INT              NOT NULL,
    [AccountId]    UNIQUEIDENTIFIER NOT NULL,
    [ItemId]       UNIQUEIDENTIFIER NOT NULL,
    [AssetId]      UNIQUEIDENTIFIER NOT NULL,
    [Visits]       BIGINT           NOT NULL,
    [Value]        BIGINT           NOT NULL,
    [Count]        BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_Failures] (
    [VisitId]               UNIQUEIDENTIFIER NOT NULL,
    [AccountId]             UNIQUEIDENTIFIER NOT NULL,
    [Date]                  SMALLDATETIME    NOT NULL,
    [ContactId]             UNIQUEIDENTIFIER NOT NULL,
    [PageEventDefinitionId] UNIQUEIDENTIFIER NOT NULL,
    [KeywordsId]            UNIQUEIDENTIFIER NOT NULL,
    [ReferringSiteId]       UNIQUEIDENTIFIER NOT NULL,
    [ContactVisitIndex]     INT              NOT NULL,
    [VisitPageIndex]        INT              NOT NULL,
    [FailureDetailsId]      UNIQUEIDENTIFIER NOT NULL,
    [Value]                 BIGINT           NOT NULL,
    [Count]                 BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_FollowHits] (
    [Date]       SMALLDATETIME    NOT NULL,
    [ItemId]     UNIQUEIDENTIFIER NOT NULL,
    [KeywordsId] UNIQUEIDENTIFIER NOT NULL,
    [Visits]     BIGINT           NOT NULL,
    [Value]      BIGINT           NOT NULL,
    [Count]      BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_FormFieldMetrics] (
    [FormId]               UNIQUEIDENTIFIER NOT NULL,
    [FieldId]              UNIQUEIDENTIFIER NOT NULL,
    [InteractionId]        UNIQUEIDENTIFIER NOT NULL,
    [InteractionStartDate] SMALLDATETIME    NOT NULL,
    [Completed]            INT              NOT NULL,
    [Errors]               INT              NOT NULL,
    [AverageTime]          FLOAT (53)       NOT NULL,
    [Dropouts]             INT              NOT NULL,
    [ErrorRate]            FLOAT (53)       NOT NULL,
    [Visits]               INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_FormMetrics] (
    [ContactId]            UNIQUEIDENTIFIER NOT NULL,
    [InteractionId]        UNIQUEIDENTIFIER NOT NULL,
    [InteractionStartDate] SMALLDATETIME    NOT NULL,
    [FormId]               UNIQUEIDENTIFIER NOT NULL,
    [Success]              INT              NOT NULL,
    [Submits]              INT              NOT NULL,
    [Errors]               INT              NOT NULL,
    [Dropouts]             INT              NOT NULL,
    [Visits]               INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_GeoMetrics] (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_GoalMetrics] (
    [SegmentRecordId] BIGINT           NOT NULL,
    [SegmentId]       UNIQUEIDENTIFIER NOT NULL,
    [Date]            SMALLDATETIME    NOT NULL,
    [SiteNameId]      INT              NOT NULL,
    [DimensionKeyId]  BIGINT           NOT NULL,
    [Visits]          INT              NOT NULL,
    [Value]           INT              NOT NULL,
    [Count]           INT              NOT NULL,
    [Conversions]     INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_LanguageMetrics] (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_MvTesting] (
    [TestSetId]            UNIQUEIDENTIFIER NOT NULL,
    [TestValues]           BINARY (16)      NOT NULL,
    [Visits]               BIGINT           NOT NULL,
    [Value]                BIGINT           NOT NULL,
    [Bounces]              BIGINT           NOT NULL,
    [TotalPageDuration]    BIGINT           NOT NULL,
    [TotalWebsiteDuration] BIGINT           NOT NULL,
    [PageCount]            BIGINT           NOT NULL,
    [Visitors]             BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_MvTestingDetails] (
    [TestSetId]  UNIQUEIDENTIFIER NOT NULL,
    [TestValues] BINARY (16)      NOT NULL,
    [Value]      BIGINT           NOT NULL,
    [Visits]     BIGINT           DEFAULT ((0)) NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_OutcomeMetrics] (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Conversions]        INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_PageMetrics] (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [TimeOnPage]         INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_PageViews] (
    [Date]            SMALLDATETIME    NOT NULL,
    [ItemId]          UNIQUEIDENTIFIER NOT NULL,
    [ContactId]       UNIQUEIDENTIFIER NOT NULL,
    [Views]           BIGINT           NOT NULL,
    [Duration]        BIGINT           NOT NULL,
    [Visits]          BIGINT           NOT NULL,
    [Value]           BIGINT           NOT NULL,
    [TestId]          UNIQUEIDENTIFIER NOT NULL,
    [TestCombination] BINARY (16)      NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_PageViewsByLanguage] (
    [Date]         SMALLDATETIME    NOT NULL,
    [SiteNameId]   INT              NOT NULL,
    [ItemId]       UNIQUEIDENTIFIER NOT NULL,
    [LanguageId]   INT              NOT NULL,
    [DeviceNameId] INT              NOT NULL,
    [Views]        BIGINT           NOT NULL,
    [Visits]       BIGINT           NOT NULL,
    [Duration]     BIGINT           NOT NULL,
    [Value]        BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_PageViewsMetrics] (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_PatternMetrics] (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_Personalization] (
    [Date]       DATE             NOT NULL,
    [RuleSetId]  UNIQUEIDENTIFIER NOT NULL,
    [RuleId]     UNIQUEIDENTIFIER NOT NULL,
    [TestSetId]  UNIQUEIDENTIFIER NOT NULL,
    [TestValues] BINARY (16)      NOT NULL,
    [IsDefault]  BIT              NOT NULL,
    [Visits]     BIGINT           NOT NULL,
    [Value]      BIGINT           NOT NULL,
    [Visitors]   BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_ReferringSiteMetrics] (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_RulesExposure] (
    [Date]      DATE             NOT NULL,
    [ItemId]    UNIQUEIDENTIFIER NOT NULL,
    [RuleSetId] UNIQUEIDENTIFIER NOT NULL,
    [RuleId]    UNIQUEIDENTIFIER NOT NULL,
    [Visits]    BIGINT           NOT NULL,
    [Visitors]  BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_Searches] (
    [Date]            SMALLDATETIME    NOT NULL,
    [TrafficType]     INT              NOT NULL,
    [CampaignId]      UNIQUEIDENTIFIER NOT NULL,
    [ItemId]          UNIQUEIDENTIFIER NOT NULL,
    [PageEventItemId] UNIQUEIDENTIFIER NOT NULL,
    [SiteNameId]      INT              NOT NULL,
    [DeviceNameId]    INT              NOT NULL,
    [LanguageId]      INT              NOT NULL,
    [AccountId]       UNIQUEIDENTIFIER NOT NULL,
    [KeywordsId]      UNIQUEIDENTIFIER NOT NULL,
    [Visits]          BIGINT           NOT NULL,
    [Value]           BIGINT           NOT NULL,
    [Count]           BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_SearchMetrics] (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Count]              INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_SegmentMetrics] (
    [SegmentRecordId]       BIGINT  NOT NULL,
    [ContactTransitionType] TINYINT NOT NULL,
    [Visits]                INT     NOT NULL,
    [Value]                 INT     NOT NULL,
    [Bounces]               INT     NOT NULL,
    [Conversions]           INT     NOT NULL,
    [TimeOnSite]            INT     NOT NULL,
    [Pageviews]             INT     NOT NULL,
    [Count]                 INT     NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_SegmentMetricsReduced] (
    [SegmentRecordId]       BIGINT  NOT NULL,
    [ContactTransitionType] TINYINT NOT NULL,
    [Visits]                INT     NOT NULL,
    [Value]                 INT     NOT NULL,
    [Bounces]               INT     NOT NULL,
    [Conversions]           INT     NOT NULL,
    [TimeOnSite]            INT     NOT NULL,
    [Pageviews]             INT     NOT NULL,
    [Count]                 INT     NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_SiteSearches] (
    [Date]         SMALLDATETIME    NOT NULL,
    [TrafficType]  INT              NOT NULL,
    [CampaignId]   UNIQUEIDENTIFIER NOT NULL,
    [ItemId]       UNIQUEIDENTIFIER NOT NULL,
    [SiteNameId]   INT              NOT NULL,
    [DeviceNameId] INT              NOT NULL,
    [LanguageId]   INT              NOT NULL,
    [AccountId]    UNIQUEIDENTIFIER NOT NULL,
    [KeywordsId]   UNIQUEIDENTIFIER NOT NULL,
    [Visits]       BIGINT           NOT NULL,
    [Value]        BIGINT           NOT NULL,
    [Count]        BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_SlowPages] (
    [Date]              SMALLDATETIME    NOT NULL,
    [ItemId]            UNIQUEIDENTIFIER NOT NULL,
    [Duration]          INT              NOT NULL,
    [VisitId]           UNIQUEIDENTIFIER NOT NULL,
    [AccountId]         UNIQUEIDENTIFIER NOT NULL,
    [ContactId]         UNIQUEIDENTIFIER NOT NULL,
    [ContactVisitIndex] INT              NOT NULL,
    [Value]             INT              NOT NULL,
    [Views]             BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_TestConversions] (
    [GoalId]     UNIQUEIDENTIFIER NOT NULL,
    [TestSetId]  UNIQUEIDENTIFIER NOT NULL,
    [TestValues] BINARY (16)      NOT NULL,
    [Visits]     BIGINT           NOT NULL,
    [Value]      BIGINT           NOT NULL,
    [Count]      BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_TestOutcomes] (
    [TestSetId]      UNIQUEIDENTIFIER NOT NULL,
    [TestOwner]      NVARCHAR (256)   NOT NULL,
    [CompletionDate] DATETIME         NOT NULL,
    [TestScore]      FLOAT (53)       NOT NULL,
    [Effect]         FLOAT (53)       NOT NULL,
    [Guess]          INT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_TestPageClicks] (
    [TestSetId]  UNIQUEIDENTIFIER NOT NULL,
    [TestValues] BINARY (16)      NOT NULL,
    [ItemId]     UNIQUEIDENTIFIER NOT NULL,
    [Views]      BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_TestStatistics] (
    [TestSetId]             UNIQUEIDENTIFIER NOT NULL,
    [Power]                 FLOAT (53)       NOT NULL,
    [P]                     FLOAT (53)       NOT NULL,
    [IsStatisticalRelevant] BIT              NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_Traffic] (
    [Date]            SMALLDATETIME    NOT NULL,
    [Checksum]        INT              NOT NULL,
    [TrafficType]     INT              NOT NULL,
    [CampaignId]      UNIQUEIDENTIFIER NULL,
    [ItemId]          UNIQUEIDENTIFIER NOT NULL,
    [KeywordsId]      UNIQUEIDENTIFIER NULL,
    [ReferringSiteId] UNIQUEIDENTIFIER NULL,
    [SiteNameId]      INT              NOT NULL,
    [DeviceNameId]    INT              NOT NULL,
    [LanguageId]      INT              NOT NULL,
    [FirstVisit]      BIT              NOT NULL,
    [Visits]          BIGINT           NOT NULL,
    [Value]           BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_ValueBySource] (
    [Date]            SMALLDATETIME NOT NULL,
    [TrafficType]     INT           NOT NULL,
    [SiteNameId]      INT           NOT NULL,
    [DeviceNameId]    INT           NOT NULL,
    [LanguageId]      INT           NOT NULL,
    [FirstVisitValue] BIGINT        NOT NULL,
    [Contacts]        BIGINT        NOT NULL,
    [Visits]          BIGINT        NOT NULL,
    [Value]           BIGINT        NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_Visits] (
    [Date]       SMALLDATETIME    NOT NULL,
    [ItemId]     UNIQUEIDENTIFIER NOT NULL,
    [ContactId]  UNIQUEIDENTIFIER NOT NULL,
    [LanguageId] INT              NOT NULL,
    [FirstVisit] BIT              NOT NULL,
    [PagesCount] BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Fact_VisitsByBusinessContactLocation] (
    [AccountId]      UNIQUEIDENTIFIER NOT NULL,
    [BusinessUnitId] UNIQUEIDENTIFIER NOT NULL,
    [Date]           SMALLDATETIME    NOT NULL,
    [TrafficType]    INT              NOT NULL,
    [SiteNameId]     INT              NOT NULL,
    [DeviceNameId]   INT              NOT NULL,
    [ContactId]      UNIQUEIDENTIFIER NOT NULL,
    [LanguageId]     INT              NOT NULL,
    [Latitude]       FLOAT (53)       NOT NULL,
    [Longitude]      FLOAT (53)       NOT NULL,
    [Visits]         BIGINT           NOT NULL,
    [Value]          BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[FailureDetails] (
    [FailureDetailsId] UNIQUEIDENTIFIER NOT NULL,
    [Url]              NVARCHAR (450)   NOT NULL,
    [ErrorText]        NVARCHAR (1000)  NULL,
    [PreviousUrl]      NVARCHAR (450)   NULL,
    [DataKey]          NVARCHAR (4000)  NULL,
    [Data]             NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([FailureDetailsId] ASC)
);

GO
CREATE TABLE [dbo].[FormFieldNames] (
    [FieldId]   UNIQUEIDENTIFIER NOT NULL,
    [FieldName] NVARCHAR (100)   NOT NULL
);

GO
CREATE TABLE [dbo].[Items] (
    [ItemId] UNIQUEIDENTIFIER NOT NULL,
    [Url]    VARCHAR (800)    NOT NULL
);

GO
CREATE TABLE [dbo].[Keywords] (
    [KeywordsId] UNIQUEIDENTIFIER NOT NULL,
    [Keywords]   NVARCHAR (400)   NOT NULL
);

GO
CREATE TABLE [dbo].[Languages] (
    [LanguageId] INT          NOT NULL,
    [Name]       VARCHAR (11) NOT NULL
);

GO
CREATE TABLE [dbo].[Properties] (
    [PropertyId] UNIQUEIDENTIFIER NOT NULL,
    [Key]        NVARCHAR (100)   NOT NULL,
    [Value]      NTEXT            NOT NULL,
    PRIMARY KEY CLUSTERED ([PropertyId] ASC)
);

GO
CREATE TABLE [dbo].[ReferringSites] (
    [ReferringSiteId] UNIQUEIDENTIFIER NOT NULL,
    [ReferringSite]   NVARCHAR (450)   NOT NULL
);

GO
CREATE TABLE [dbo].[SegmentRecords] (
    [SegmentRecordId] BIGINT           NOT NULL,
    [SegmentId]       UNIQUEIDENTIFIER NOT NULL,
    [Date]            SMALLDATETIME    NOT NULL,
    [SiteNameId]      INT              NOT NULL,
    [DimensionKeyId]  BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[SegmentRecordsReduced] (
    [SegmentRecordId] BIGINT           NOT NULL,
    [SegmentId]       UNIQUEIDENTIFIER NOT NULL,
    [Date]            SMALLDATETIME    NOT NULL,
    [SiteNameId]      INT              NOT NULL,
    [DimensionKeyId]  BIGINT           NOT NULL
);

GO
CREATE TABLE [dbo].[Segments] (
    [SegmentId]   UNIQUEIDENTIFIER NOT NULL,
    [DimensionId] UNIQUEIDENTIFIER NOT NULL,
    [Filter]      NVARCHAR (MAX)   NULL,
    [DeployDate]  DATETIME         NULL,
    [Status]      TINYINT          NOT NULL
);

GO
CREATE TABLE [dbo].[SiteNames] (
    [SiteNameId] INT            NOT NULL,
    [SiteName]   NVARCHAR (450) NOT NULL
);

GO
CREATE TABLE [dbo].[Taxonomy_TaxonEntity] (
    [Id]         UNIQUEIDENTIFIER NOT NULL,
    [ParentId]   UNIQUEIDENTIFIER NULL,
    [TaxonomyId] UNIQUEIDENTIFIER NOT NULL,
    [Type]       NVARCHAR (255)   NOT NULL,
    [Uri]        NVARCHAR (MAX)   NOT NULL,
    [IsDeleted]  BIT              DEFAULT ((0)) NOT NULL
);

GO
CREATE TABLE [dbo].[Taxonomy_TaxonEntityFieldDefinition] (
    [Id]                  UNIQUEIDENTIFIER NOT NULL,
    [Name]                NVARCHAR (255)   NOT NULL,
    [IsLanguageInvariant] BIT              NOT NULL
);

GO
CREATE TABLE [dbo].[Taxonomy_TaxonEntityFieldValue] (
    [TaxonId]      UNIQUEIDENTIFIER NOT NULL,
    [FieldId]      UNIQUEIDENTIFIER NOT NULL,
    [LanguageCode] NVARCHAR (10)    NOT NULL,
    [FieldValue]   NVARCHAR (MAX)   NOT NULL
);

GO
CREATE TABLE [dbo].[Testing_ClusterMembers] (
    [Date]      SMALLDATETIME    NOT NULL,
    [TestId]    UNIQUEIDENTIFIER NOT NULL,
    [ContactId] UNIQUEIDENTIFIER NOT NULL,
    [ClusterId] UNIQUEIDENTIFIER NOT NULL
);

GO
CREATE TABLE [dbo].[Testing_Clusters] (
    [Date]         SMALLDATETIME    NOT NULL,
    [TestId]       UNIQUEIDENTIFIER NOT NULL,
    [ClusterId]    UNIQUEIDENTIFIER NOT NULL,
    [FeatureName]  NVARCHAR (100)   NOT NULL,
    [FeatureValue] NVARCHAR (100)   NOT NULL
);

GO
CREATE TABLE [dbo].[Trail_AutomationStates] (
    [AutomationStateId] UNIQUEIDENTIFIER NOT NULL,
    [SeqNumber]         INT              NOT NULL,
    [Processed]         SMALLDATETIME    NOT NULL
);

GO
CREATE TABLE [dbo].[Trail_Interactions] (
    [Id]        VARBINARY (128) NOT NULL,
    [Processed] SMALLDATETIME   NOT NULL
);

GO
CREATE TABLE [dbo].[Trail_PathAnalyzer] (
    [Id]        UNIQUEIDENTIFIER NOT NULL,
    [Processed] SMALLDATETIME    DEFAULT (getutcdate()) NOT NULL
);

GO
CREATE TABLE [dbo].[TreeDefinitions] (
    [DefinitionId] UNIQUEIDENTIFIER NOT NULL,
    [Data]         NVARCHAR (MAX)   NOT NULL,
    [DeployDate]   DATETIME         NULL,
    [Status]       INT              NULL,
    [TaskId]       UNIQUEIDENTIFIER NULL
);

GO
CREATE TABLE [dbo].[Trees] (
    [DefinitionId] UNIQUEIDENTIFIER NOT NULL,
    [StartDate]    DATE             NOT NULL,
    [EndDate]      DATE             NOT NULL,
    [TreeBlob]     VARBINARY (MAX)  NOT NULL,
    [Visits]       INT              NULL,
    [Value]        INT              NULL,
    [Nodes]        INT              NULL,
    [Version]      ROWVERSION       NOT NULL
);

GO
CREATE VIEW [dbo].[CampaignsOverview]
AS
SELECT [TrafficOverview].[Date],
       [TrafficOverview].[Month],
       [TrafficOverview].[TrafficType],
       [TrafficOverview].[ItemId],
       [TrafficOverview].[Url],
       [TrafficOverview].[KeywordsId],
       [TrafficOverview].[Keywords],
       [TrafficOverview].[ReferringSiteId],
       [TrafficOverview].[ReferringSite],
       [TrafficOverview].[Multisite],
       [TrafficOverview].[Language],
       [TrafficOverview].[DeviceName],
       [TrafficOverview].[FirstVisit],
       [TrafficOverview].[Visits],
       [TrafficOverview].[Value]
FROM   [TrafficOverview]
WHERE  [TrafficOverview].[CampaignId] IS NOT NULL;

GO
CREATE VIEW [dbo].[Conversions]
AS
SELECT [Fact_Conversions].[Date] AS [Date],
       CAST (DATEADD(DAY, (-DATEPART(DAY, [Fact_Conversions].[Date]) + 1), [Fact_Conversions].[Date]) AS DATE) AS [Month],
       [Fact_Conversions].[TrafficType] AS [TrafficType],
       [Fact_Conversions].[ItemId] AS [ItemId],
       ISNULL([Fact_Conversions].[CampaignId], '00000000-0000-0000-0000-000000000000') AS [CampaignId],
       [Fact_Conversions].[ContactId] AS [ContactId],
       [Fact_Conversions].[AccountId] AS [AccountId],
       LOWER([SiteNames].[SiteName]) AS [Multisite],
       LOWER([DeviceNames].[DeviceName]) AS [DeviceName],
       LOWER([Languages].[Name]) AS [Language],
       [Fact_Conversions].[GoalId] AS [PageEventDefinitionId],
       [Fact_Conversions].[Value] AS [Value],
       [Fact_Conversions].[Visits] AS [Visits],
       [Fact_Conversions].[Count] AS [NumberOfEvents],
       [Fact_Conversions].[GoalPoints] AS [GoalPoints]
FROM   [Fact_Conversions]
       INNER JOIN
       [SiteNames]
       ON ([Fact_Conversions].[SiteNameId] = [SiteNames].[SiteNameId])
       INNER JOIN
       [DeviceNames]
       ON ([Fact_Conversions].[DeviceNameId] = [DeviceNames].[DeviceNameId])
       INNER JOIN
       [Languages]
       ON ([Fact_Conversions].[LanguageId] = [Languages].[LanguageId])
WHERE  [Fact_Conversions].[GoalId] IS NOT NULL;

GO
CREATE VIEW [dbo].[Downloads]
AS
SELECT [Fact_Downloads].[Date] AS [Date],
       CAST (DATEADD(DAY, (-DATEPART(DAY, [Fact_Downloads].[Date]) + 1), [Fact_Downloads].[Date]) AS DATE) AS [Month],
       [Fact_Downloads].[TrafficType] AS [TrafficType],
       [Fact_Downloads].[ItemId] AS [ItemId],
       ISNULL([Fact_Downloads].[CampaignId], '00000000-0000-0000-0000-000000000000') AS [CampaignId],
       LOWER([SiteNames].[SiteName]) AS [Multisite],
       LOWER([DeviceNames].[DeviceName]) AS [DeviceName],
       LOWER([Languages].[Name]) AS [Language],
       [Fact_Downloads].[AssetId] AS [AssetId],
       [Assets].[Url] AS [Asset],
       [Fact_Downloads].[Value] AS [Value],
       [Fact_Downloads].[Visits] AS [Visits],
       [Fact_Downloads].[Count] AS [NumberOfEvents]
FROM   [Fact_Downloads]
       INNER JOIN
       [SiteNames]
       ON ([Fact_Downloads].[SiteNameId] = [SiteNames].[SiteNameId])
       INNER JOIN
       [DeviceNames]
       ON ([Fact_Downloads].[DeviceNameId] = [DeviceNames].[DeviceNameId])
       INNER JOIN
       [Languages]
       ON ([Fact_Downloads].[LanguageId] = [Languages].[LanguageId])
       INNER JOIN
       [Assets]
       ON ([Fact_Downloads].[AssetId] = [Assets].[AssetId]);

GO
CREATE VIEW [dbo].[FollowHits]
AS
SELECT [Fact_FollowHits].[Date] AS [Date],
       CAST (DATEADD(DAY, (-DATEPART(DAY, [Fact_FollowHits].[Date]) + 1), [Fact_FollowHits].[Date]) AS DATE) AS [Month],
       [Fact_FollowHits].[ItemId] AS [ItemId],
       [Fact_FollowHits].[KeywordsId] AS [KeywordsId],
       [Keywords].[Keywords] AS [Keywords],
       [Fact_FollowHits].[Value] AS [Value],
       [Fact_FollowHits].[Visits] AS [Visits],
       [Fact_FollowHits].[Count] AS [NumberOfEvents]
FROM   [Fact_FollowHits]
       INNER JOIN
       [Keywords]
       ON ([Fact_FollowHits].[KeywordsId] = [Keywords].[KeywordsId]);

GO
CREATE VIEW [dbo].[NotFoundUrls]
AS
SELECT [Fact_Failures].[VisitId],
       [Fact_Failures].[AccountId],
       [Fact_Failures].[Date],
       [Fact_Failures].[ContactId],
       [Fact_Failures].[PageEventDefinitionId],
       [Fact_Failures].[KeywordsId],
       [Fact_Failures].[ReferringSiteId],
       [Fact_Failures].[VisitPageIndex],
       [Fact_Failures].[FailureDetailsId],
       [Fact_Failures].[ContactVisitIndex],
       [Fact_Failures].[Value],
       [FailureDetails].[Url],
       [FailureDetails].[Data] AS RequestedURL,
       [FailureDetails].[PreviousUrl]
FROM   [Fact_Failures]
       INNER JOIN
       [FailureDetails]
       ON [Fact_Failures].[FailureDetailsId] = [FailureDetails].[FailureDetailsId]
WHERE  ([Fact_Failures].[PageEventDefinitionId] = '3F0D6D6A-6D8A-4E29-AD0C-C369589F7504');

GO
CREATE VIEW [dbo].[ReportDataView]
AS
SELECT dbo.Fact_SegmentMetrics.SegmentRecordId,
       dbo.Fact_SegmentMetrics.ContactTransitionType,
       dbo.Fact_SegmentMetrics.Visits,
       dbo.Fact_SegmentMetrics.Value,
       dbo.Fact_SegmentMetrics.Bounces,
       dbo.Fact_SegmentMetrics.Conversions,
       CAST (dbo.Fact_SegmentMetrics.TimeOnSite AS BIGINT) AS TimeOnSite,
       dbo.Fact_SegmentMetrics.Pageviews,
       dbo.Fact_SegmentMetrics.Count,
       dbo.SegmentRecords.SegmentId,
       dbo.SegmentRecords.Date,
       dbo.SegmentRecords.SiteNameId,
       dbo.SegmentRecords.DimensionKeyId,
       dbo.DimensionKeys.DimensionKey
FROM   dbo.Fact_SegmentMetrics
       INNER JOIN
       dbo.SegmentRecords
       ON dbo.Fact_SegmentMetrics.SegmentRecordId = dbo.SegmentRecords.SegmentRecordId
       INNER JOIN
       dbo.DimensionKeys
       ON dbo.SegmentRecords.DimensionKeyId = dbo.DimensionKeys.DimensionKeyId
UNION
SELECT dbo.Fact_SegmentMetricsReduced.SegmentRecordId,
       dbo.Fact_SegmentMetricsReduced.ContactTransitionType,
       dbo.Fact_SegmentMetricsReduced.Visits,
       dbo.Fact_SegmentMetricsReduced.Value,
       dbo.Fact_SegmentMetricsReduced.Bounces,
       dbo.Fact_SegmentMetricsReduced.Conversions,
       CAST (dbo.Fact_SegmentMetricsReduced.TimeOnSite AS BIGINT) AS TimeOnSite,
       dbo.Fact_SegmentMetricsReduced.Pageviews,
       dbo.Fact_SegmentMetricsReduced.Count,
       dbo.SegmentRecordsReduced.SegmentId,
       dbo.SegmentRecordsReduced.Date,
       dbo.SegmentRecordsReduced.SiteNameId,
       dbo.SegmentRecordsReduced.DimensionKeyId,
       dbo.DimensionKeys.DimensionKey
FROM   dbo.Fact_SegmentMetricsReduced
       INNER JOIN
       dbo.SegmentRecordsReduced
       ON dbo.Fact_SegmentMetricsReduced.SegmentRecordId = dbo.SegmentRecordsReduced.SegmentRecordId
       INNER JOIN
       dbo.DimensionKeys
       ON dbo.SegmentRecordsReduced.DimensionKeyId = dbo.DimensionKeys.DimensionKeyId;

GO
CREATE VIEW [dbo].[SiteSearches]
AS
SELECT [Fact_SiteSearches].[Date] AS [Date],
       CAST (DATEADD(DAY, (-DATEPART(DAY, [Fact_SiteSearches].[Date]) + 1), [Fact_SiteSearches].[Date]) AS DATE) AS [Month],
       [Fact_SiteSearches].[TrafficType] AS [TrafficType],
       ISNULL([Fact_SiteSearches].[CampaignId], '00000000-0000-0000-0000-000000000000') AS [CampaignId],
       [Fact_SiteSearches].[ItemId] AS [ItemId],
       LOWER([SiteNames].[SiteName]) AS [Multisite],
       LOWER([DeviceNames].[DeviceName]) AS [DeviceName],
       LOWER([Languages].[Name]) AS [Language],
       [Fact_SiteSearches].[KeywordsId] AS [KeywordsId],
       [Keywords].[Keywords] AS [Keywords],
       [Fact_SiteSearches].[Value] AS [Value],
       [Fact_SiteSearches].[Visits] AS [Visits],
       [Fact_SiteSearches].[Count] AS [NumberOfEvents]
FROM   [Fact_SiteSearches]
       INNER JOIN
       [SiteNames]
       ON ([Fact_SiteSearches].[SiteNameId] = [SiteNames].[SiteNameId])
       INNER JOIN
       [DeviceNames]
       ON ([Fact_SiteSearches].[DeviceNameId] = [DeviceNames].[DeviceNameId])
       INNER JOIN
       [Languages]
       ON ([Fact_SiteSearches].[LanguageId] = [Languages].[LanguageId])
       INNER JOIN
       [Keywords]
       ON ([Fact_SiteSearches].[KeywordsId] = [Keywords].[KeywordsId]);

GO
CREATE VIEW [dbo].[SlowPages]
AS
SELECT   [Fact_SlowPages].[Date] AS [Date],
         CAST (DATEADD(DAY, (-DATEPART(DAY, [Fact_SlowPages].[Date]) + 1), [Fact_SlowPages].[Date]) AS DATE) AS [Month],
         [Fact_SlowPages].[ItemId] AS [ItemId],
         [Items].[Url] AS [Url],
         MAX([Fact_SlowPages].[Duration]) AS [TimeTaken],
         SUM([Fact_SlowPages].[Views]) AS [FailCount]
FROM     [Fact_SlowPages]
         INNER JOIN
         [Items]
         ON ([Fact_SlowPages].[ItemId] = [Items].[ItemId])
GROUP BY [Fact_SlowPages].[Date], [Fact_SlowPages].[ItemId], [Items].[Url];

GO
CREATE VIEW [dbo].[TopLeads]
AS
SELECT   [Fact_VisitsByBusinessContactLocation].[AccountId],
         [Accounts].[Classification] AS [VisitorClassification],
         [Accounts].[Country],
         [Accounts].[BusinessName],
         [BusinessUnits].[Region],
         [Date],
         [ContactId],
         SUM([Visits]) AS [TotalVisits],
         SUM([Value]) AS [TotalValue]
FROM     [Fact_VisitsByBusinessContactLocation]
         LEFT OUTER JOIN
         [Accounts]
         ON [Fact_VisitsByBusinessContactLocation].[AccountId] = [Accounts].[AccountId]
         LEFT OUTER JOIN
         [BusinessUnits]
         ON [Fact_VisitsByBusinessContactLocation].[BusinessUnitId] = [BusinessUnits].[BusinessUnitId]
GROUP BY [Fact_VisitsByBusinessContactLocation].[AccountId], [Accounts].[Country], [Accounts].[BusinessName], [Fact_VisitsByBusinessContactLocation].[Date], [Accounts].[Classification], [ContactId], [BusinessUnits].[Region];

GO
CREATE VIEW [dbo].[Traffic]
AS
SELECT [Fact_Traffic].[Date] AS [Date],
       CAST (DATEADD(DAY, (-DATEPART(DAY, [Fact_Traffic].[Date]) + 1), [Fact_Traffic].[Date]) AS DATE) AS [Month],
       [Fact_Traffic].[TrafficType] AS [TrafficType],
       ISNULL([Fact_Traffic].[CampaignId], '00000000-0000-0000-0000-000000000000') AS [CampaignId],
       [Fact_Traffic].[ItemId] AS [ItemId],
       LOWER(SUBSTRING([Items].[Url], 1, CHARINDEX('?', [Items].[Url] + '?') - 1)) AS [Url],
       ISNULL([Fact_Traffic].[KeywordsId], '00000000-0000-0000-0000-000000000000') AS [KeywordsId],
       LOWER([Keywords].[Keywords]) AS [Keywords],
       ISNULL([Fact_Traffic].[ReferringSiteId], '00000000-0000-0000-0000-000000000000') AS [ReferringSiteId],
       LOWER([ReferringSites].[ReferringSite]) AS [ReferringSite],
       LOWER([SiteNames].[SiteName]) AS [Multisite],
       LOWER([DeviceNames].[DeviceName]) AS [DeviceName],
       LOWER([Languages].[Name]) AS [Language],
       [Fact_Traffic].[FirstVisit] AS [FirstVisit],
       [Fact_Traffic].[Visits] AS [Visits],
       [Fact_Traffic].[Value] AS [Value]
FROM   [Fact_Traffic] WITH (NOLOCK)
       LEFT OUTER JOIN
       [Items] WITH (NOLOCK)
       ON ([Fact_Traffic].[ItemId] = [Items].[ItemId])
       LEFT OUTER JOIN
       [Keywords] WITH (NOLOCK)
       ON ([Fact_Traffic].[KeywordsId] = [Keywords].[KeywordsId])
       LEFT OUTER JOIN
       [ReferringSites] WITH (NOLOCK)
       ON ([Fact_Traffic].[ReferringSiteId] = [ReferringSites].[ReferringSiteId])
       LEFT OUTER JOIN
       [SiteNames] WITH (NOLOCK)
       ON ([Fact_Traffic].[SiteNameId] = [SiteNames].[SiteNameId])
       LEFT OUTER JOIN
       [DeviceNames] WITH (NOLOCK)
       ON ([Fact_Traffic].[DeviceNameId] = [DeviceNames].[DeviceNameId])
       LEFT OUTER JOIN
       [Languages] WITH (NOLOCK)
       ON ([Fact_Traffic].[LanguageId] = [Languages].[LanguageId]);

GO
CREATE VIEW [dbo].[TrafficOverview]
AS
SELECT [Date],
       [Month],
       [TrafficType],
       [CampaignId],
       [ItemId],
       [Url],
       [KeywordsId],
       [Keywords],
       [ReferringSiteId],
       [ReferringSite],
       [Multisite],
       [DeviceName],
       [Language],
       [FirstVisit],
       [Visits],
       [Value]
FROM   [Traffic];

GO
CREATE VIEW [dbo].[ValueBySource]
AS
WITH   [ValueBySource]
AS     (SELECT   [Fact_ValueBySource].[Date],
                 [Fact_ValueBySource].[TrafficType],
                 [Fact_ValueBySource].[SiteNameId],
                 [Fact_ValueBySource].[DeviceNameId],
                 [Fact_ValueBySource].[LanguageId],
                 SUM([Fact_ValueBySource].[Visits]) AS [Visits],
                 SUM([Fact_ValueBySource].[Value]) AS [Value],
                 SUM([Fact_ValueBySource].[FirstVisitValue]) AS [FirstVisitValue],
                 SUM([Fact_ValueBySource].[Contacts]) AS [Contacts]
        FROM     [Fact_ValueBySource]
        GROUP BY [Fact_ValueBySource].[Date], [Fact_ValueBySource].[TrafficType], [Fact_ValueBySource].[SiteNameId], [Fact_ValueBySource].[DeviceNameId], [Fact_ValueBySource].[LanguageId])
SELECT [ValueBySource].[Date],
       [ValueBySource].[TrafficType],
       [SiteNames].[SiteName] AS [Multisite],
       [DeviceNames].[DeviceName] AS [DeviceName],
       [Languages].[Name] AS [Language],
       [ValueBySource].[Visits],
       [ValueBySource].[Value],
       [ValueBySource].[FirstVisitValue],
       [ValueBySource].[Contacts]
FROM   [ValueBySource]
       INNER JOIN
       [SiteNames]
       ON ([ValueBySource].[SiteNameId] = [SiteNames].[SiteNameId])
       INNER JOIN
       [Languages]
       ON ([ValueBySource].[LanguageId] = [Languages].[LanguageId])
       INNER JOIN
       [DeviceNames]
       ON ([ValueBySource].[DeviceNameId] = [DeviceNames].[DeviceNameId]);

GO
ALTER TABLE [dbo].[Fact_Conversions]
    ADD CONSTRAINT [FK_Fact_Conversions_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[Accounts] ([AccountId]);


GO
ALTER TABLE [dbo].[Fact_Conversions] NOCHECK CONSTRAINT [FK_Fact_Conversions_Accounts];

GO
ALTER TABLE [dbo].[Fact_Conversions]
    ADD CONSTRAINT [FK_Fact_Conversions_DeviceNames] FOREIGN KEY ([DeviceNameId]) REFERENCES [dbo].[DeviceNames] ([DeviceNameId]);


GO
ALTER TABLE [dbo].[Fact_Conversions] NOCHECK CONSTRAINT [FK_Fact_Conversions_DeviceNames];

GO
ALTER TABLE [dbo].[Fact_Conversions]
    ADD CONSTRAINT [FK_Fact_Conversions_Languages] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([LanguageId]);


GO
ALTER TABLE [dbo].[Fact_Conversions] NOCHECK CONSTRAINT [FK_Fact_Conversions_Languages];

GO
ALTER TABLE [dbo].[Fact_Conversions]
    ADD CONSTRAINT [FK_Fact_Conversions_SiteNames] FOREIGN KEY ([SiteNameId]) REFERENCES [dbo].[SiteNames] ([SiteNameId]);


GO
ALTER TABLE [dbo].[Fact_Conversions] NOCHECK CONSTRAINT [FK_Fact_Conversions_SiteNames];

GO
ALTER TABLE [dbo].[Fact_Downloads]
    ADD CONSTRAINT [FK_Fact_Downloads_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[Accounts] ([AccountId]);


GO
ALTER TABLE [dbo].[Fact_Downloads] NOCHECK CONSTRAINT [FK_Fact_Downloads_Accounts];

GO
ALTER TABLE [dbo].[Fact_Downloads]
    ADD CONSTRAINT [FK_Fact_Downloads_Assets] FOREIGN KEY ([AssetId]) REFERENCES [dbo].[Assets] ([AssetId]);


GO
ALTER TABLE [dbo].[Fact_Downloads] NOCHECK CONSTRAINT [FK_Fact_Downloads_Assets];

GO
ALTER TABLE [dbo].[Fact_Downloads]
    ADD CONSTRAINT [FK_Fact_Downloads_DeviceNames] FOREIGN KEY ([DeviceNameId]) REFERENCES [dbo].[DeviceNames] ([DeviceNameId]);


GO
ALTER TABLE [dbo].[Fact_Downloads] NOCHECK CONSTRAINT [FK_Fact_Downloads_DeviceNames];

GO
ALTER TABLE [dbo].[Fact_Downloads]
    ADD CONSTRAINT [FK_Fact_Downloads_Languages] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([LanguageId]);


GO
ALTER TABLE [dbo].[Fact_Downloads] NOCHECK CONSTRAINT [FK_Fact_Downloads_Languages];

GO
ALTER TABLE [dbo].[Fact_Downloads]
    ADD CONSTRAINT [FK_Fact_Downloads_SiteNames] FOREIGN KEY ([SiteNameId]) REFERENCES [dbo].[SiteNames] ([SiteNameId]);


GO
ALTER TABLE [dbo].[Fact_Downloads] NOCHECK CONSTRAINT [FK_Fact_Downloads_SiteNames];

GO
ALTER TABLE [dbo].[Fact_Failures]
    ADD CONSTRAINT [FK_Fact_Failures_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[Accounts] ([AccountId]);


GO
ALTER TABLE [dbo].[Fact_Failures] NOCHECK CONSTRAINT [FK_Fact_Failures_Accounts];

GO
ALTER TABLE [dbo].[Fact_Failures]
    ADD CONSTRAINT [FK_Fact_Failures_FailureDetails] FOREIGN KEY ([FailureDetailsId]) REFERENCES [dbo].[FailureDetails] ([FailureDetailsId]);


GO
ALTER TABLE [dbo].[Fact_Failures] NOCHECK CONSTRAINT [FK_Fact_Failures_FailureDetails];

GO
ALTER TABLE [dbo].[Fact_Failures]
    ADD CONSTRAINT [FK_Fact_Failures_Keywords] FOREIGN KEY ([KeywordsId]) REFERENCES [dbo].[Keywords] ([KeywordsId]);


GO
ALTER TABLE [dbo].[Fact_Failures] NOCHECK CONSTRAINT [FK_Fact_Failures_Keywords];

GO
ALTER TABLE [dbo].[Fact_Failures]
    ADD CONSTRAINT [FK_Fact_Failures_ReferringSites] FOREIGN KEY ([ReferringSiteId]) REFERENCES [dbo].[ReferringSites] ([ReferringSiteId]);


GO
ALTER TABLE [dbo].[Fact_Failures] NOCHECK CONSTRAINT [FK_Fact_Failures_ReferringSites];

GO
ALTER TABLE [dbo].[Fact_FollowHits]
    ADD CONSTRAINT [FK_Fact_FollowHits_Items] FOREIGN KEY ([ItemId]) REFERENCES [dbo].[Items] ([ItemId]);


GO
ALTER TABLE [dbo].[Fact_FollowHits] NOCHECK CONSTRAINT [FK_Fact_FollowHits_Items];

GO
ALTER TABLE [dbo].[Fact_FollowHits]
    ADD CONSTRAINT [FK_Fact_FollowHits_Keywords] FOREIGN KEY ([KeywordsId]) REFERENCES [dbo].[Keywords] ([KeywordsId]);


GO
ALTER TABLE [dbo].[Fact_FollowHits] NOCHECK CONSTRAINT [FK_Fact_FollowHits_Keywords];

GO
ALTER TABLE [dbo].[Fact_PageViews]
    ADD CONSTRAINT [FK_Fact_PageViews_Items] FOREIGN KEY ([ItemId]) REFERENCES [dbo].[Items] ([ItemId]);


GO
ALTER TABLE [dbo].[Fact_PageViews] NOCHECK CONSTRAINT [FK_Fact_PageViews_Items];

GO
ALTER TABLE [dbo].[Fact_PageViewsByLanguage]
    ADD CONSTRAINT [FK_Fact_PageViewsByLanguage_DeviceNames] FOREIGN KEY ([DeviceNameId]) REFERENCES [dbo].[DeviceNames] ([DeviceNameId]);


GO
ALTER TABLE [dbo].[Fact_PageViewsByLanguage] NOCHECK CONSTRAINT [FK_Fact_PageViewsByLanguage_DeviceNames];

GO
ALTER TABLE [dbo].[Fact_PageViewsByLanguage]
    ADD CONSTRAINT [FK_Fact_PageViewsByLanguage_Items] FOREIGN KEY ([ItemId]) REFERENCES [dbo].[Items] ([ItemId]);


GO
ALTER TABLE [dbo].[Fact_PageViewsByLanguage] NOCHECK CONSTRAINT [FK_Fact_PageViewsByLanguage_Items];

GO
ALTER TABLE [dbo].[Fact_PageViewsByLanguage]
    ADD CONSTRAINT [FK_Fact_PageViewsByLanguage_Languages] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([LanguageId]);


GO
ALTER TABLE [dbo].[Fact_PageViewsByLanguage] NOCHECK CONSTRAINT [FK_Fact_PageViewsByLanguage_Languages];

GO
ALTER TABLE [dbo].[Fact_PageViewsByLanguage]
    ADD CONSTRAINT [FK_Fact_PageViewsByLanguage_SiteNames] FOREIGN KEY ([SiteNameId]) REFERENCES [dbo].[SiteNames] ([SiteNameId]);


GO
ALTER TABLE [dbo].[Fact_PageViewsByLanguage] NOCHECK CONSTRAINT [FK_Fact_PageViewsByLanguage_SiteNames];

GO
ALTER TABLE [dbo].[Fact_Searches]
    ADD CONSTRAINT [FK_Fact_Searches_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[Accounts] ([AccountId]);


GO
ALTER TABLE [dbo].[Fact_Searches] NOCHECK CONSTRAINT [FK_Fact_Searches_Accounts];

GO
ALTER TABLE [dbo].[Fact_Searches]
    ADD CONSTRAINT [FK_Fact_Searches_DeviceNames] FOREIGN KEY ([DeviceNameId]) REFERENCES [dbo].[DeviceNames] ([DeviceNameId]);


GO
ALTER TABLE [dbo].[Fact_Searches] NOCHECK CONSTRAINT [FK_Fact_Searches_DeviceNames];

GO
ALTER TABLE [dbo].[Fact_Searches]
    ADD CONSTRAINT [FK_Fact_Searches_Items] FOREIGN KEY ([ItemId]) REFERENCES [dbo].[Items] ([ItemId]);


GO
ALTER TABLE [dbo].[Fact_Searches] NOCHECK CONSTRAINT [FK_Fact_Searches_Items];

GO
ALTER TABLE [dbo].[Fact_Searches]
    ADD CONSTRAINT [FK_Fact_Searches_Keywords] FOREIGN KEY ([KeywordsId]) REFERENCES [dbo].[Keywords] ([KeywordsId]);


GO
ALTER TABLE [dbo].[Fact_Searches] NOCHECK CONSTRAINT [FK_Fact_Searches_Keywords];

GO
ALTER TABLE [dbo].[Fact_Searches]
    ADD CONSTRAINT [FK_Fact_Searches_Languages] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([LanguageId]);


GO
ALTER TABLE [dbo].[Fact_Searches] NOCHECK CONSTRAINT [FK_Fact_Searches_Languages];

GO
ALTER TABLE [dbo].[Fact_Searches]
    ADD CONSTRAINT [FK_Fact_Searches_PageEventItems] FOREIGN KEY ([PageEventItemId]) REFERENCES [dbo].[Items] ([ItemId]);


GO
ALTER TABLE [dbo].[Fact_Searches] NOCHECK CONSTRAINT [FK_Fact_Searches_PageEventItems];

GO
ALTER TABLE [dbo].[Fact_Searches]
    ADD CONSTRAINT [FK_Fact_Searches_SiteNames] FOREIGN KEY ([SiteNameId]) REFERENCES [dbo].[SiteNames] ([SiteNameId]);


GO
ALTER TABLE [dbo].[Fact_Searches] NOCHECK CONSTRAINT [FK_Fact_Searches_SiteNames];

GO
ALTER TABLE [dbo].[Fact_SiteSearches]
    ADD CONSTRAINT [FK_Fact_SiteSearches_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[Accounts] ([AccountId]);


GO
ALTER TABLE [dbo].[Fact_SiteSearches] NOCHECK CONSTRAINT [FK_Fact_SiteSearches_Accounts];

GO
ALTER TABLE [dbo].[Fact_SiteSearches]
    ADD CONSTRAINT [FK_Fact_SiteSearches_DeviceNames] FOREIGN KEY ([DeviceNameId]) REFERENCES [dbo].[DeviceNames] ([DeviceNameId]);


GO
ALTER TABLE [dbo].[Fact_SiteSearches] NOCHECK CONSTRAINT [FK_Fact_SiteSearches_DeviceNames];

GO
ALTER TABLE [dbo].[Fact_SiteSearches]
    ADD CONSTRAINT [FK_Fact_SiteSearches_Items] FOREIGN KEY ([ItemId]) REFERENCES [dbo].[Items] ([ItemId]);


GO
ALTER TABLE [dbo].[Fact_SiteSearches] NOCHECK CONSTRAINT [FK_Fact_SiteSearches_Items];

GO
ALTER TABLE [dbo].[Fact_SiteSearches]
    ADD CONSTRAINT [FK_Fact_SiteSearches_Keywords] FOREIGN KEY ([KeywordsId]) REFERENCES [dbo].[Keywords] ([KeywordsId]);


GO
ALTER TABLE [dbo].[Fact_SiteSearches] NOCHECK CONSTRAINT [FK_Fact_SiteSearches_Keywords];

GO
ALTER TABLE [dbo].[Fact_SiteSearches]
    ADD CONSTRAINT [FK_Fact_SiteSearches_Languages] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([LanguageId]);


GO
ALTER TABLE [dbo].[Fact_SiteSearches] NOCHECK CONSTRAINT [FK_Fact_SiteSearches_Languages];

GO
ALTER TABLE [dbo].[Fact_SiteSearches]
    ADD CONSTRAINT [FK_Fact_SiteSearches_SiteNames] FOREIGN KEY ([SiteNameId]) REFERENCES [dbo].[SiteNames] ([SiteNameId]);


GO
ALTER TABLE [dbo].[Fact_SiteSearches] NOCHECK CONSTRAINT [FK_Fact_SiteSearches_SiteNames];

GO
ALTER TABLE [dbo].[Fact_SlowPages]
    ADD CONSTRAINT [FK_Fact_SlowPages_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[Accounts] ([AccountId]);


GO
ALTER TABLE [dbo].[Fact_SlowPages] NOCHECK CONSTRAINT [FK_Fact_SlowPages_Accounts];

GO
ALTER TABLE [dbo].[Fact_SlowPages]
    ADD CONSTRAINT [FK_Fact_SlowPages_ContactId] FOREIGN KEY ([ContactId]) REFERENCES [dbo].[Contacts] ([ContactId]);


GO
ALTER TABLE [dbo].[Fact_SlowPages] NOCHECK CONSTRAINT [FK_Fact_SlowPages_ContactId];

GO
ALTER TABLE [dbo].[Fact_SlowPages]
    ADD CONSTRAINT [FK_Fact_SlowPages_Items] FOREIGN KEY ([ItemId]) REFERENCES [dbo].[Items] ([ItemId]);


GO
ALTER TABLE [dbo].[Fact_SlowPages] NOCHECK CONSTRAINT [FK_Fact_SlowPages_Items];

GO
ALTER TABLE [dbo].[Fact_Traffic]
    ADD CONSTRAINT [FK_Fact_Traffic_DeviceNames] FOREIGN KEY ([DeviceNameId]) REFERENCES [dbo].[DeviceNames] ([DeviceNameId]);


GO
ALTER TABLE [dbo].[Fact_Traffic] NOCHECK CONSTRAINT [FK_Fact_Traffic_DeviceNames];

GO
ALTER TABLE [dbo].[Fact_Traffic]
    ADD CONSTRAINT [FK_Fact_Traffic_Items] FOREIGN KEY ([ItemId]) REFERENCES [dbo].[Items] ([ItemId]);


GO
ALTER TABLE [dbo].[Fact_Traffic] NOCHECK CONSTRAINT [FK_Fact_Traffic_Items];

GO
ALTER TABLE [dbo].[Fact_Traffic]
    ADD CONSTRAINT [FK_Fact_Traffic_Keywords] FOREIGN KEY ([KeywordsId]) REFERENCES [dbo].[Keywords] ([KeywordsId]);


GO
ALTER TABLE [dbo].[Fact_Traffic] NOCHECK CONSTRAINT [FK_Fact_Traffic_Keywords];

GO
ALTER TABLE [dbo].[Fact_Traffic]
    ADD CONSTRAINT [FK_Fact_Traffic_Languages] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([LanguageId]);


GO
ALTER TABLE [dbo].[Fact_Traffic] NOCHECK CONSTRAINT [FK_Fact_Traffic_Languages];

GO
ALTER TABLE [dbo].[Fact_Traffic]
    ADD CONSTRAINT [FK_Fact_Traffic_ReferringSites] FOREIGN KEY ([ReferringSiteId]) REFERENCES [dbo].[ReferringSites] ([ReferringSiteId]);


GO
ALTER TABLE [dbo].[Fact_Traffic] NOCHECK CONSTRAINT [FK_Fact_Traffic_ReferringSites];

GO
ALTER TABLE [dbo].[Fact_Traffic]
    ADD CONSTRAINT [FK_Fact_Traffic_SiteNames] FOREIGN KEY ([SiteNameId]) REFERENCES [dbo].[SiteNames] ([SiteNameId]);


GO
ALTER TABLE [dbo].[Fact_Traffic] NOCHECK CONSTRAINT [FK_Fact_Traffic_SiteNames];

GO
ALTER TABLE [dbo].[Fact_ValueBySource]
    ADD CONSTRAINT [FK_Fact_ValueBySource_DeviceNames] FOREIGN KEY ([DeviceNameId]) REFERENCES [dbo].[DeviceNames] ([DeviceNameId]);


GO
ALTER TABLE [dbo].[Fact_ValueBySource] NOCHECK CONSTRAINT [FK_Fact_ValueBySource_DeviceNames];

GO
ALTER TABLE [dbo].[Fact_ValueBySource]
    ADD CONSTRAINT [FK_Fact_ValueBySource_Languages] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([LanguageId]);


GO
ALTER TABLE [dbo].[Fact_ValueBySource] NOCHECK CONSTRAINT [FK_Fact_ValueBySource_Languages];

GO
ALTER TABLE [dbo].[Fact_ValueBySource]
    ADD CONSTRAINT [FK_Fact_ValueBySource_SiteNames] FOREIGN KEY ([SiteNameId]) REFERENCES [dbo].[SiteNames] ([SiteNameId]);


GO
ALTER TABLE [dbo].[Fact_ValueBySource] NOCHECK CONSTRAINT [FK_Fact_ValueBySource_SiteNames];

GO
ALTER TABLE [dbo].[Fact_Visits]
    ADD CONSTRAINT [FK_Fact_Visits_Contacts] FOREIGN KEY ([ContactId]) REFERENCES [dbo].[Contacts] ([ContactId]);


GO
ALTER TABLE [dbo].[Fact_Visits] NOCHECK CONSTRAINT [FK_Fact_Visits_Contacts];

GO
ALTER TABLE [dbo].[Fact_Visits]
    ADD CONSTRAINT [FK_Fact_Visits_Items] FOREIGN KEY ([ItemId]) REFERENCES [dbo].[Items] ([ItemId]);


GO
ALTER TABLE [dbo].[Fact_Visits] NOCHECK CONSTRAINT [FK_Fact_Visits_Items];

GO
ALTER TABLE [dbo].[Fact_Visits]
    ADD CONSTRAINT [FK_Fact_Visits_Languages] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([LanguageId]);


GO
ALTER TABLE [dbo].[Fact_Visits] NOCHECK CONSTRAINT [FK_Fact_Visits_Languages];

GO
ALTER TABLE [dbo].[Fact_VisitsByBusinessContactLocation]
    ADD CONSTRAINT [FK_Fact_VisitsByBusinessContactLocation_DeviceNames] FOREIGN KEY ([DeviceNameId]) REFERENCES [dbo].[DeviceNames] ([DeviceNameId]);


GO
ALTER TABLE [dbo].[Fact_VisitsByBusinessContactLocation] NOCHECK CONSTRAINT [FK_Fact_VisitsByBusinessContactLocation_DeviceNames];

GO
ALTER TABLE [dbo].[Fact_VisitsByBusinessContactLocation]
    ADD CONSTRAINT [FK_Fact_VisitsByBusinessContactLocation_Locations] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[Accounts] ([AccountId]);


GO
ALTER TABLE [dbo].[Fact_VisitsByBusinessContactLocation] NOCHECK CONSTRAINT [FK_Fact_VisitsByBusinessContactLocation_Locations];

GO
ALTER TABLE [dbo].[Fact_VisitsByBusinessContactLocation]
    ADD CONSTRAINT [FK_Fact_VisitsByBusinessContactLocation_SiteNames] FOREIGN KEY ([SiteNameId]) REFERENCES [dbo].[SiteNames] ([SiteNameId]);


GO
ALTER TABLE [dbo].[Fact_VisitsByBusinessContactLocation] NOCHECK CONSTRAINT [FK_Fact_VisitsByBusinessContactLocation_SiteNames];

GO
ALTER TABLE [dbo].[Taxonomy_TaxonEntityFieldValue]
    ADD CONSTRAINT [FK_Taxonomy_TaxonEntityFieldValue_Taxonomy_TaxonEntity] FOREIGN KEY ([TaxonId]) REFERENCES [dbo].[Taxonomy_TaxonEntity] ([Id]);


GO
ALTER TABLE [dbo].[Taxonomy_TaxonEntityFieldValue] NOCHECK CONSTRAINT [FK_Taxonomy_TaxonEntityFieldValue_Taxonomy_TaxonEntity];

GO
ALTER TABLE [dbo].[Taxonomy_TaxonEntityFieldValue]
    ADD CONSTRAINT [FK_Taxonomy_TaxonEntityFieldValue_Taxonomy_TaxonEntityFieldDefinition] FOREIGN KEY ([FieldId]) REFERENCES [dbo].[Taxonomy_TaxonEntityFieldDefinition] ([Id]);


GO
ALTER TABLE [dbo].[Taxonomy_TaxonEntityFieldValue] NOCHECK CONSTRAINT [FK_Taxonomy_TaxonEntityFieldValue_Taxonomy_TaxonEntityFieldDefinition];

GO
ALTER TABLE [dbo].[Fact_MvTesting]
    ADD CONSTRAINT [DF_Fact_MvTesting_Bounces] DEFAULT ((0)) FOR [Bounces];

GO
ALTER TABLE [dbo].[Fact_MvTesting]
    ADD CONSTRAINT [DF_Fact_MvTesting_PageCount] DEFAULT ((0)) FOR [PageCount];

GO
ALTER TABLE [dbo].[Fact_MvTesting]
    ADD CONSTRAINT [DF_Fact_MvTesting_TotalPageDuration] DEFAULT ((0)) FOR [TotalPageDuration];

GO
ALTER TABLE [dbo].[Fact_MvTesting]
    ADD CONSTRAINT [DF_Fact_MvTesting_TotalWebsiteDuration] DEFAULT ((0)) FOR [TotalWebsiteDuration];

GO
ALTER TABLE [dbo].[Fact_MvTesting]
    ADD CONSTRAINT [DF_Fact_MvTesting_Visitors] DEFAULT ((0)) FOR [Visitors];

GO
ALTER TABLE [dbo].[Trees]
    ADD CONSTRAINT [Dates] CHECK ([StartDate] < [EndDate]);

GO
ALTER TABLE [dbo].[Assets]
    ADD CONSTRAINT [PK_Assets] PRIMARY KEY CLUSTERED ([AssetId] ASC);

GO
ALTER TABLE [dbo].[DeviceNames]
    ADD CONSTRAINT [PK_DeviceName] PRIMARY KEY CLUSTERED ([DeviceNameId] ASC);

GO
ALTER TABLE [dbo].[DimensionKeys]
    ADD CONSTRAINT [PK_DimensionKeys] PRIMARY KEY CLUSTERED ([DimensionKeyId] ASC);

GO
ALTER TABLE [dbo].[Fact_AutomationStates]
    ADD CONSTRAINT [PK_Fact_AutomationStates] PRIMARY KEY CLUSTERED ([PlanId] ASC, [StateId] ASC);

GO
ALTER TABLE [dbo].[Fact_CampaignMetrics]
    ADD CONSTRAINT [PK_Fact_CampaignRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_ChannelMetrics]
    ADD CONSTRAINT [PK_Fact_ChannelRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_Conversions]
    ADD CONSTRAINT [PK_Fact_Conversions] PRIMARY KEY CLUSTERED ([Date] ASC, [TrafficType] ASC, [ContactId] ASC, [CampaignId] ASC, [SiteNameId] ASC, [DeviceNameId] ASC, [LanguageId] ASC, [GoalId] ASC, [AccountId] ASC, [ItemId] ASC, [GoalPoints] ASC);

GO
ALTER TABLE [dbo].[Fact_ConversionsMetrics]
    ADD CONSTRAINT [PK_Fact_ConversionsRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_DeviceMetrics]
    ADD CONSTRAINT [PK_Fact_DeviceRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_DownloadEventMetrics]
    ADD CONSTRAINT [PK_Fact_DownloadEventRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_Downloads]
    ADD CONSTRAINT [PK_Fact_Downloads] PRIMARY KEY CLUSTERED ([Date] ASC, [TrafficType] ASC, [CampaignId] ASC, [SiteNameId] ASC, [DeviceNameId] ASC, [LanguageId] ASC, [AccountId] ASC, [AssetId] ASC, [ItemId] ASC);

GO
ALTER TABLE [dbo].[Fact_Failures]
    ADD CONSTRAINT [PK_Fact_Failures] PRIMARY KEY CLUSTERED ([VisitId] ASC, [AccountId] ASC, [Date] ASC, [ContactId] ASC, [PageEventDefinitionId] ASC, [KeywordsId] ASC, [ReferringSiteId] ASC, [ContactVisitIndex] ASC, [VisitPageIndex] ASC, [FailureDetailsId] ASC);

GO
ALTER TABLE [dbo].[Fact_FollowHits]
    ADD CONSTRAINT [PK_Fact_FollowHits] PRIMARY KEY CLUSTERED ([Date] ASC, [ItemId] ASC, [KeywordsId] ASC);

GO
ALTER TABLE [dbo].[Fact_FormFieldMetrics]
    ADD CONSTRAINT [PK_Fact_FormFieldMetrics] PRIMARY KEY CLUSTERED ([FormId] ASC, [FieldId] ASC, [InteractionId] ASC, [InteractionStartDate] ASC);

GO
ALTER TABLE [dbo].[Fact_GeoMetrics]
    ADD CONSTRAINT [PK_Fact_GeoRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_GoalMetrics]
    ADD CONSTRAINT [PK_Fact_GoalRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_LanguageMetrics]
    ADD CONSTRAINT [PK_Fact_LanguageRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_SegmentMetrics]
    ADD CONSTRAINT [PK_Fact_Metrics] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC, [ContactTransitionType] ASC);

GO
ALTER TABLE [dbo].[Fact_SegmentMetricsReduced]
    ADD CONSTRAINT [PK_Fact_MetricsReduced] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC, [ContactTransitionType] ASC);

GO
ALTER TABLE [dbo].[Fact_MvTesting]
    ADD CONSTRAINT [PK_Fact_MvTesting] PRIMARY KEY CLUSTERED ([TestSetId] ASC, [TestValues] ASC);

GO
ALTER TABLE [dbo].[Fact_MvTestingDetails]
    ADD CONSTRAINT [PK_Fact_MvTestingDetails] PRIMARY KEY CLUSTERED ([TestSetId] ASC, [TestValues] ASC, [Value] ASC);

GO
ALTER TABLE [dbo].[Fact_OutcomeMetrics]
    ADD CONSTRAINT [PK_Fact_OutcomeRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_PageMetrics]
    ADD CONSTRAINT [PK_Fact_PageRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_PageViewsByLanguage]
    ADD CONSTRAINT [PK_Fact_PageViewsByLanguage] PRIMARY KEY CLUSTERED ([Date] ASC, [SiteNameId] ASC, [ItemId] ASC, [LanguageId] ASC, [DeviceNameId] ASC);

GO
ALTER TABLE [dbo].[Fact_PageViewsMetrics]
    ADD CONSTRAINT [PK_Fact_PageViewsRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_PatternMetrics]
    ADD CONSTRAINT [PK_Fact_PatternRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_Personalization]
    ADD CONSTRAINT [PK_Fact_Personalization] PRIMARY KEY CLUSTERED ([TestSetId] ASC, [TestValues] ASC, [Date] ASC, [RuleSetId] ASC, [RuleId] ASC, [IsDefault] ASC);

GO
ALTER TABLE [dbo].[Fact_ReferringSiteMetrics]
    ADD CONSTRAINT [PK_Fact_ReferringSiteRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_RulesExposure]
    ADD CONSTRAINT [PK_Fact_RulesExposure] PRIMARY KEY CLUSTERED ([Date] ASC, [ItemId] ASC, [RuleSetId] ASC, [RuleId] ASC);

GO
ALTER TABLE [dbo].[Fact_Searches]
    ADD CONSTRAINT [PK_Fact_Searches] PRIMARY KEY CLUSTERED ([Date] ASC, [TrafficType] ASC, [CampaignId] ASC, [ItemId] ASC, [SiteNameId] ASC, [DeviceNameId] ASC, [LanguageId] ASC, [PageEventItemId] ASC, [AccountId] ASC, [KeywordsId] ASC);

GO
ALTER TABLE [dbo].[Fact_SearchMetrics]
    ADD CONSTRAINT [PK_Fact_SearchRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[SegmentRecords]
    ADD CONSTRAINT [PK_Fact_SegmentRecords_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[SegmentRecordsReduced]
    ADD CONSTRAINT [PK_Fact_SegmentRecordsReduced_1] PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC);

GO
ALTER TABLE [dbo].[Fact_SiteSearches]
    ADD CONSTRAINT [PK_Fact_SiteSearches] PRIMARY KEY CLUSTERED ([Date] ASC, [TrafficType] ASC, [CampaignId] ASC, [ItemId] ASC, [SiteNameId] ASC, [DeviceNameId] ASC, [LanguageId] ASC, [AccountId] ASC, [KeywordsId] ASC);

GO
ALTER TABLE [dbo].[Fact_TestConversions]
    ADD CONSTRAINT [PK_Fact_TestConversions] PRIMARY KEY CLUSTERED ([TestSetId] ASC, [TestValues] ASC, [GoalId] ASC);

GO
ALTER TABLE [dbo].[Fact_TestOutcomes]
    ADD CONSTRAINT [PK_Fact_TestOutcomes] PRIMARY KEY CLUSTERED ([TestSetId] ASC);

GO
ALTER TABLE [dbo].[Fact_TestPageClicks]
    ADD CONSTRAINT [PK_Fact_TestPageClicks_1] PRIMARY KEY CLUSTERED ([TestSetId] ASC, [TestValues] ASC, [ItemId] ASC);

GO
ALTER TABLE [dbo].[Fact_TestStatistics]
    ADD CONSTRAINT [PK_Fact_TestStatistics] PRIMARY KEY CLUSTERED ([TestSetId] ASC);

GO
ALTER TABLE [dbo].[Fact_ValueBySource]
    ADD CONSTRAINT [PK_Fact_ValueBySource] PRIMARY KEY CLUSTERED ([TrafficType] ASC, [SiteNameId] ASC, [DeviceNameId] ASC, [LanguageId] ASC, [Date] ASC);

GO
ALTER TABLE [dbo].[Fact_Visits]
    ADD CONSTRAINT [PK_Fact_Visits] PRIMARY KEY CLUSTERED ([Date] ASC, [FirstVisit] ASC, [ContactId] ASC, [ItemId] ASC, [LanguageId] ASC);

GO
ALTER TABLE [dbo].[Fact_VisitsByBusinessContactLocation]
    ADD CONSTRAINT [PK_Fact_VisitsByBusinessContactLocation] PRIMARY KEY CLUSTERED ([Date] ASC, [ContactId] ASC, [AccountId] ASC, [BusinessUnitId] ASC, [TrafficType] ASC, [SiteNameId] ASC, [DeviceNameId] ASC, [LanguageId] ASC, [Latitude] ASC, [Longitude] ASC);

GO
ALTER TABLE [dbo].[FormFieldNames]
    ADD CONSTRAINT [PK_FormFieldNames] PRIMARY KEY CLUSTERED ([FieldId] ASC);

GO
ALTER TABLE [dbo].[Fact_FormMetrics]
    ADD CONSTRAINT [PK_FormMetrics] PRIMARY KEY CLUSTERED ([ContactId] ASC, [InteractionId] ASC, [InteractionStartDate] ASC, [FormId] ASC);

GO
ALTER TABLE [dbo].[Items]
    ADD CONSTRAINT [PK_Items] PRIMARY KEY CLUSTERED ([ItemId] ASC);

GO
ALTER TABLE [dbo].[Keywords]
    ADD CONSTRAINT [PK_Keywords] PRIMARY KEY CLUSTERED ([KeywordsId] ASC);

GO
ALTER TABLE [dbo].[Languages]
    ADD CONSTRAINT [PK_Languages] PRIMARY KEY CLUSTERED ([LanguageId] ASC);

GO
ALTER TABLE [dbo].[Fact_PageViews]
    ADD CONSTRAINT [PK_PageViews] PRIMARY KEY CLUSTERED ([ItemId] ASC, [Date] ASC, [ContactId] ASC, [TestId] ASC, [TestCombination] ASC);

GO
ALTER TABLE [dbo].[ReferringSites]
    ADD CONSTRAINT [PK_ReferringSites] PRIMARY KEY CLUSTERED ([ReferringSiteId] ASC);

GO
ALTER TABLE [dbo].[Segments]
    ADD CONSTRAINT [PK_Segments] PRIMARY KEY CLUSTERED ([SegmentId] ASC);

GO
ALTER TABLE [dbo].[SiteNames]
    ADD CONSTRAINT [PK_SiteNames] PRIMARY KEY CLUSTERED ([SiteNameId] ASC);

GO
ALTER TABLE [dbo].[Fact_SlowPages]
    ADD CONSTRAINT [PK_SlowPages] PRIMARY KEY CLUSTERED ([Date] ASC, [ItemId] ASC, [VisitId] ASC, [AccountId] ASC, [ContactId] ASC, [Duration] ASC, [ContactVisitIndex] ASC, [Value] ASC);

GO
ALTER TABLE [dbo].[Taxonomy_TaxonEntity]
    ADD CONSTRAINT [PK_Taxonomy_TaxonEntity] PRIMARY KEY CLUSTERED ([Id] ASC);

GO
ALTER TABLE [dbo].[Taxonomy_TaxonEntityFieldDefinition]
    ADD CONSTRAINT [PK_Taxonomy_TaxonEntityFieldDefinition] PRIMARY KEY CLUSTERED ([Id] ASC);

GO
ALTER TABLE [dbo].[Taxonomy_TaxonEntityFieldValue]
    ADD CONSTRAINT [PK_Taxonomy_TaxonEntityFieldValue] PRIMARY KEY CLUSTERED ([TaxonId] ASC, [FieldId] ASC, [LanguageCode] ASC);

GO
ALTER TABLE [dbo].[Testing_ClusterMembers]
    ADD CONSTRAINT [PK_Testing_ClusterMembers] PRIMARY KEY CLUSTERED ([ContactId] ASC, [ClusterId] ASC);

GO
ALTER TABLE [dbo].[Testing_Clusters]
    ADD CONSTRAINT [PK_Testing_Clusters] PRIMARY KEY CLUSTERED ([ClusterId] ASC, [FeatureName] ASC);

GO
ALTER TABLE [dbo].[Trail_AutomationStates]
    ADD CONSTRAINT [PK_Trail_AutomationStates] PRIMARY KEY NONCLUSTERED ([AutomationStateId] ASC, [SeqNumber] ASC);

GO
ALTER TABLE [dbo].[Trail_Interactions]
    ADD CONSTRAINT [PK_Trail_Interactions] PRIMARY KEY NONCLUSTERED ([Id] ASC);

GO
ALTER TABLE [dbo].[Trail_PathAnalyzer]
    ADD CONSTRAINT [PK_Trail_PathAnalyzer] PRIMARY KEY NONCLUSTERED ([Id] ASC);

GO
ALTER TABLE [dbo].[TreeDefinitions]
    ADD CONSTRAINT [PK_TreeDefinitions] PRIMARY KEY CLUSTERED ([DefinitionId] ASC);

GO
ALTER TABLE [dbo].[Trees]
    ADD CONSTRAINT [PK_Trees] PRIMARY KEY CLUSTERED ([DefinitionId] ASC, [StartDate] ASC, [EndDate] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Assets_Url]
    ON [dbo].[Assets]([Url] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Conversion_Campaign]
    ON [dbo].[Fact_Conversions]([CampaignId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Conversion_DeviceName]
    ON [dbo].[Fact_Conversions]([DeviceNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Conversion_Goal]
    ON [dbo].[Fact_Conversions]([GoalId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Conversion_Language]
    ON [dbo].[Fact_Conversions]([LanguageId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Conversion_SiteName]
    ON [dbo].[Fact_Conversions]([SiteNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Conversion_TrafficType]
    ON [dbo].[Fact_Conversions]([TrafficType] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Downloads_Campaign]
    ON [dbo].[Fact_Downloads]([CampaignId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Downloads_DeviceName]
    ON [dbo].[Fact_Downloads]([DeviceNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Downloads_Language]
    ON [dbo].[Fact_Downloads]([LanguageId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Downloads_SiteName]
    ON [dbo].[Fact_Downloads]([SiteNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Downloads_TrafficType]
    ON [dbo].[Fact_Downloads]([TrafficType] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Failures_FailureDetails]
    ON [dbo].[Fact_Failures]([FailureDetailsId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Failures_Keywords]
    ON [dbo].[Fact_Failures]([KeywordsId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Failures_PageEventDefinition]
    ON [dbo].[Fact_Failures]([PageEventDefinitionId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Failures_ReferringSite]
    ON [dbo].[Fact_Failures]([ReferringSiteId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_FollowHits_Item]
    ON [dbo].[Fact_FollowHits]([ItemId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_FollowHits_Keywords]
    ON [dbo].[Fact_FollowHits]([KeywordsId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_MvTesting_TestSetId]
    ON [dbo].[Fact_MvTesting]([TestSetId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_MvTestingDetails_TestSetId]
    ON [dbo].[Fact_MvTestingDetails]([TestSetId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_PageViews_Contact]
    ON [dbo].[Fact_PageViews]([ContactId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_PageViews_Item]
    ON [dbo].[Fact_PageViews]([ItemId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Personalization_TestSetId]
    ON [dbo].[Fact_Personalization]([TestSetId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SegmentMetrics_All_Columns]
    ON [dbo].[Fact_SegmentMetrics]([SegmentRecordId] ASC, [ContactTransitionType] ASC, [Visits] ASC, [Value] ASC, [Bounces] ASC, [Conversions] ASC, [TimeOnSite] ASC, [Pageviews] ASC, [Count] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SegmentMetricsReduced_All_Columns]
    ON [dbo].[Fact_SegmentMetricsReduced]([SegmentRecordId] ASC, [ContactTransitionType] ASC, [Visits] ASC, [Value] ASC, [Bounces] ASC, [Conversions] ASC, [TimeOnSite] ASC, [Pageviews] ASC, [Count] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SiteSearches_AccountId]
    ON [dbo].[Fact_SiteSearches]([AccountId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SiteSearches_Campaign]
    ON [dbo].[Fact_SiteSearches]([CampaignId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SiteSearches_DeviceName]
    ON [dbo].[Fact_SiteSearches]([DeviceNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SiteSearches_Item]
    ON [dbo].[Fact_SiteSearches]([ItemId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SiteSearches_Keywords]
    ON [dbo].[Fact_SiteSearches]([KeywordsId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SiteSearches_Language]
    ON [dbo].[Fact_SiteSearches]([LanguageId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SiteSearches_SiteName]
    ON [dbo].[Fact_SiteSearches]([SiteNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SiteSearches_TrafficType]
    ON [dbo].[Fact_SiteSearches]([TrafficType] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SlowPages_Account]
    ON [dbo].[Fact_SlowPages]([AccountId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SlowPages_Contact]
    ON [dbo].[Fact_SlowPages]([ContactId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SlowPages_Duration]
    ON [dbo].[Fact_SlowPages]([Duration] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SlowPages_Item]
    ON [dbo].[Fact_SlowPages]([ItemId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_SlowPages_Visit]
    ON [dbo].[Fact_SlowPages]([VisitId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_TestConversions_GoalId]
    ON [dbo].[Fact_TestConversions]([GoalId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_TestOutcomes_TestSetId]
    ON [dbo].[Fact_TestOutcomes]([TestSetId] ASC);

GO
CREATE CLUSTERED INDEX [IX_ByDate]
    ON [dbo].[Fact_Traffic]([Date] ASC, [Checksum] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_ByDateAndTrafficType]
    ON [dbo].[Fact_Traffic]([Date] ASC, [TrafficType] ASC)
    INCLUDE([Visits], [Value]);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Traffic_Campaign]
    ON [dbo].[Fact_Traffic]([CampaignId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Traffic_DeviceName]
    ON [dbo].[Fact_Traffic]([DeviceNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Traffic_Item]
    ON [dbo].[Fact_Traffic]([ItemId] ASC, [KeywordsId] ASC, [ReferringSiteId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Traffic_Keywords]
    ON [dbo].[Fact_Traffic]([KeywordsId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Traffic_Language]
    ON [dbo].[Fact_Traffic]([LanguageId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Traffic_ReferringSite]
    ON [dbo].[Fact_Traffic]([ReferringSiteId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Traffic_SiteName]
    ON [dbo].[Fact_Traffic]([SiteNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Traffic_TrafficType]
    ON [dbo].[Fact_Traffic]([TrafficType] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_ValueBySource_DeviceName]
    ON [dbo].[Fact_ValueBySource]([DeviceNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_ValueBySource_Language]
    ON [dbo].[Fact_ValueBySource]([LanguageId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_ValueBySource_SiteName]
    ON [dbo].[Fact_ValueBySource]([SiteNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_ValueBySource_TrafficType]
    ON [dbo].[Fact_ValueBySource]([TrafficType] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Visits_Contact]
    ON [dbo].[Fact_Visits]([ContactId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Visits_FirstVisit]
    ON [dbo].[Fact_Visits]([FirstVisit] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Visits_Item]
    ON [dbo].[Fact_Visits]([ItemId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_Visits_Language]
    ON [dbo].[Fact_Visits]([LanguageId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_VisitsByBusinessContactLocation_Account]
    ON [dbo].[Fact_VisitsByBusinessContactLocation]([AccountId] ASC, [BusinessUnitId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_VisitsByBusinessContactLocation_Contact]
    ON [dbo].[Fact_VisitsByBusinessContactLocation]([ContactId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_VisitsByBusinessContactLocation_DeviceName]
    ON [dbo].[Fact_VisitsByBusinessContactLocation]([DeviceNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_VisitsByBusinessContactLocation_Language]
    ON [dbo].[Fact_VisitsByBusinessContactLocation]([LanguageId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_VisitsByBusinessContactLocation_SiteName]
    ON [dbo].[Fact_VisitsByBusinessContactLocation]([SiteNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Fact_VisitsByBusinessContactLocation_TrafficType]
    ON [dbo].[Fact_VisitsByBusinessContactLocation]([TrafficType] ASC);

GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_Properties_Column]
    ON [dbo].[Properties]([Key] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_SegmentRecords_All_Columns]
    ON [dbo].[SegmentRecords]([DimensionKeyId] ASC, [SegmentRecordId] ASC, [Date] ASC, [SegmentId] ASC, [SiteNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_SegmentRecords_All_Columns2]
    ON [dbo].[SegmentRecords]([SegmentId] ASC, [Date] ASC, [DimensionKeyId] ASC, [SegmentRecordId] ASC, [SiteNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_SegmentRecordsReduced_All_Columns]
    ON [dbo].[SegmentRecordsReduced]([DimensionKeyId] ASC, [SegmentRecordId] ASC, [Date] ASC, [SegmentId] ASC, [SiteNameId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_SegmentRecordsReduced_All_Columns2]
    ON [dbo].[SegmentRecordsReduced]([SegmentId] ASC, [Date] ASC, [DimensionKeyId] ASC, [SegmentRecordId] ASC, [SiteNameId] ASC);

GO
CREATE CLUSTERED INDEX [IX_Trail_AutomationStates_Processed]
    ON [dbo].[Trail_AutomationStates]([Processed] ASC);

GO
CREATE CLUSTERED INDEX [IX_Trail_Interactions_Processed]
    ON [dbo].[Trail_Interactions]([Processed] ASC);

GO
CREATE CLUSTERED INDEX [IX_Trail_PathAnalyzer_Processed]
    ON [dbo].[Trail_PathAnalyzer]([Processed] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Trees]
    ON [dbo].[Trees]([EndDate] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Trees_Visits]
    ON [dbo].[Trees]([Visits] ASC);

GO
CREATE FUNCTION [dbo].[GetTagValue]
(@data XML NULL, @tagName NVARCHAR (100) NULL)
RETURNS NVARCHAR (1000)
WITH EXECUTE AS OWNER
AS
BEGIN
    RETURN @data.value('(/tags/tag[@tagname = sql:variable("@tagName")]/@tagvalue)[1]', 'NVARCHAR(1000)');
END

GO
CREATE FUNCTION [dbo].[GetTaxonEntityChildIds]
(@Id UNIQUEIDENTIFIER NULL)
RETURNS NVARCHAR (MAX)
WITH EXECUTE AS OWNER
AS
BEGIN
    DECLARE @idString AS NVARCHAR (MAX);
    SELECT @idString = COALESCE (@idString + ',', '') + CAST (Id AS NVARCHAR (255))
    FROM   [Taxonomy_TaxonEntity]
    WHERE  ParentId = @Id;
    RETURN @idString;
END

GO
CREATE PROCEDURE [dbo].[__DeleteAllReportingData]
@exclude_tables NVARCHAR (MAX) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    CREATE TABLE #foreign_keys (
        [foreign_key_name]        NVARCHAR (MAX) NULL,
        [is_disabled]             BIT           ,
        [primary_table_name]      NVARCHAR (MAX) NULL,
        [primary_column_name]     NVARCHAR (MAX) NULL,
        [foriegn_key_table_name]  NVARCHAR (MAX) NULL,
        [foriegn_key_column_name] NVARCHAR (MAX) NULL
    );
    INSERT INTO #foreign_keys
    SELECT '[' + fk.name + ']' AS [foreign_key_name],
           fk.is_disabled AS [is_disabled],
           '[' + SCHEMA_NAME(pt.schema_id) + '].[' + OBJECT_NAME(pt.object_id) + ']' AS [primary_table_name],
           '[' + ptc.name + ']' AS [primary_column_name],
           '[' + SCHEMA_NAME(ft.schema_id) + '].[' + OBJECT_NAME(ft.object_id) + ']' AS [foriegn_key_table_name],
           '[' + ftc.name + ']' AS [foriegn_key_column_name]
    FROM   sys.foreign_keys AS fk
           INNER JOIN
           sys.foreign_key_columns AS fkc
           ON fkc.constraint_object_id = fk.object_id
           INNER JOIN
           sys.tables AS pt
           ON pt.object_id = fkc.parent_object_id
           INNER JOIN
           sys.tables AS ft
           ON ft.object_id = fkc.referenced_object_id
           INNER JOIN
           sys.columns AS ptc
           ON ptc.object_id = fkc.parent_object_id
              AND ptc.column_id = fkc.parent_column_id
           INNER JOIN
           sys.columns AS ftc
           ON ftc.object_id = fkc.referenced_object_id
              AND ftc.column_id = fkc.referenced_column_id;
    DECLARE @foreign_key_name AS SYSNAME, @is_disabled AS SYSNAME, @primary_table_name AS SYSNAME, @primary_column_name AS SYSNAME, @foriegn_key_table_name AS SYSNAME, @foriegn_key_column_name AS SYSNAME, @sql AS NVARCHAR (MAX);
    DECLARE foreign_keys CURSOR
        FOR SELECT   *
            FROM     #foreign_keys
            ORDER BY [primary_table_name];
    BEGIN
        OPEN foreign_keys;
        FETCH NEXT FROM foreign_keys INTO @foreign_key_name, @is_disabled, @primary_table_name, @primary_column_name, @foriegn_key_table_name, @foriegn_key_column_name;
        WHILE @@FETCH_STATUS <> -1
            BEGIN
                SET @sql = 'ALTER TABLE ' + @primary_table_name + ' DROP ' + @foreign_key_name;
                EXECUTE sp_executesql @sql;
                FETCH NEXT FROM foreign_keys INTO @foreign_key_name, @is_disabled, @primary_table_name, @primary_column_name, @foriegn_key_table_name, @foriegn_key_column_name;
            END
        CLOSE foreign_keys;
        DEALLOCATE foreign_keys;
    END
    DECLARE tables CURSOR
        FOR SELECT   '[' + [TABLE_SCHEMA] + '].[' + [TABLE_NAME] + ']' AS [primary_table_name]
            FROM     [INFORMATION_SCHEMA].[TABLES]
            WHERE    [TABLE_TYPE] = 'BASE TABLE'
                     AND CHARINDEX('[' + [TABLE_SCHEMA] + '].[' + [TABLE_NAME] + ']', @exclude_tables) = 0
            ORDER BY [TABLE_SCHEMA] + '.' + [TABLE_NAME];
    BEGIN
        OPEN tables;
        FETCH NEXT FROM tables INTO @primary_table_name;
        WHILE @@FETCH_STATUS <> -1
            BEGIN
                SET @sql = 'TRUNCATE TABLE ' + @primary_table_name;
                EXECUTE sp_executesql @sql;
                FETCH NEXT FROM tables INTO @primary_table_name;
            END
        CLOSE tables;
        DEALLOCATE tables;
    END
    DECLARE foreign_keys CURSOR
        FOR SELECT   *
            FROM     #foreign_keys
            ORDER BY [primary_table_name];
    BEGIN
        OPEN foreign_keys;
        FETCH NEXT FROM foreign_keys INTO @foreign_key_name, @is_disabled, @primary_table_name, @primary_column_name, @foriegn_key_table_name, @foriegn_key_column_name;
        WHILE @@FETCH_STATUS <> -1
            BEGIN
                SET @sql = 'ALTER TABLE ' + @primary_table_name + ' WITH NOCHECK ADD CONSTRAINT ' + @foreign_key_name + ' FOREIGN KEY(' + @primary_column_name + ')
                 REFERENCES ' + @foriegn_key_table_name + ' (' + @foriegn_key_column_name + ')
                ALTER TABLE ' + @primary_table_name + CASE WHEN @is_disabled = 1 THEN ' NOCHECK CONSTRAINT ' ELSE ' CHECK CONSTRAINT ' END + @foreign_key_name;
                EXECUTE sp_executesql @sql;
                FETCH NEXT FROM foreign_keys INTO @foreign_key_name, @is_disabled, @primary_table_name, @primary_column_name, @foriegn_key_table_name, @foriegn_key_column_name;
            END
        CLOSE foreign_keys;
        DEALLOCATE foreign_keys;
    END
    DROP TABLE #foreign_keys;
END

GO
CREATE PROCEDURE [dbo].[Add_AutomationStates]
@PlanId UNIQUEIDENTIFIER NULL, @StateId UNIQUEIDENTIFIER NULL, @Contacts BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [dbo].[Fact_AutomationStates]
         AS t
        USING (VALUES (@PlanId, @StateId, @Contacts)) AS s([PlanId], [StateId], [Contacts]) ON (t.[PlanId] = s.[PlanId]
                                                                                                AND t.[StateId] = s.[StateId])
        WHEN MATCHED THEN UPDATE 
        SET t.[Contacts] = t.[Contacts] + s.[Contacts]
        WHEN NOT MATCHED THEN INSERT ([PlanId], [StateId], [Contacts]) VALUES (s.[PlanId], s.[StateId], s.[Contacts]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_AutomationStates]
                SET    [Contacts] = ([Contacts] + @Contacts)
                WHERE  ([PlanId] = @PlanId)
                       AND ([StateId] = @StateId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_AutomationStates] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_CampaignMetrics_Tvp]
@table [dbo].[CampaignMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_CampaignMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]        = (Target.[Visits] + Source.[Visits]),
            Target.[Value]         = (Target.[Value] + Source.[Value]),
            Target.[MonetaryValue] = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[Bounces]       = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions]   = (Target.[Conversions] + Source.[Conversions]),
            Target.[Pageviews]     = (Target.[Pageviews] + Source.[Pageviews]),
            Target.[TimeOnSite]    = (Target.[TimeOnSite] + Source.[TimeOnSite])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [MonetaryValue], [Bounces], [Conversions], [Pageviews], [TimeOnSite]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[MonetaryValue], Source.[Bounces], Source.[Conversions], Source.[Pageviews], Source.[TimeOnSite]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_ChannelMetrics_Tvp]
@table [dbo].[ChannelMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_ChannelMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]             = (Target.[Visits] + Source.[Visits]),
            Target.[Value]              = (Target.[Value] + Source.[Value]),
            Target.[Bounces]            = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions]        = (Target.[Conversions] + Source.[Conversions]),
            Target.[TimeOnSite]         = (Target.[TimeOnSite] + Source.[TimeOnSite]),
            Target.[Pageviews]          = (Target.[Pageviews] + Source.[Pageviews]),
            Target.[MonetaryValue]      = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[OutcomeOccurrences] = (Target.[OutcomeOccurrences] + Source.[OutcomeOccurrences])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [MonetaryValue], [OutcomeOccurrences]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Bounces], Source.[Conversions], Source.[TimeOnSite], Source.[Pageviews], Source.[MonetaryValue], Source.[OutcomeOccurrences]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_Conversions]
@Date SMALLDATETIME NULL, @TrafficType INT NULL, @ContactId UNIQUEIDENTIFIER NULL, @CampaignId UNIQUEIDENTIFIER NULL, @GoalId UNIQUEIDENTIFIER NULL, @SiteNameId INT NULL, @DeviceNameId INT NULL, @LanguageId INT NULL, @AccountId UNIQUEIDENTIFIER NULL, @ItemId UNIQUEIDENTIFIER NULL, @GoalPoints BIGINT NULL, @Visits BIGINT NULL, @Value BIGINT NULL, @Count BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_Conversions]
         AS [target]
        USING (VALUES (@Date, @TrafficType, @ContactId, @CampaignId, @GoalId, @SiteNameId, @DeviceNameId, @LanguageId, @AccountId, @ItemId, @GoalPoints, @Visits, @Value, @Count)) AS [source]([Date], [TrafficType], [ContactId], [CampaignId], [GoalId], [SiteNameId], [DeviceNameId], [LanguageId], [AccountId], [ItemId], [GoalPoints], [Visits], [Value], [Count]) ON (([target].[Date] = [source].[Date])
                                                                                                                                                                                                                                                                                                                                                                            AND ([target].[TrafficType] = [source].[TrafficType])
                                                                                                                                                                                                                                                                                                                                                                            AND ([target].[ContactId] = [source].[ContactId])
                                                                                                                                                                                                                                                                                                                                                                            AND ([target].[CampaignId] = [source].[CampaignId])
                                                                                                                                                                                                                                                                                                                                                                            AND ([target].[GoalId] = [source].[GoalId])
                                                                                                                                                                                                                                                                                                                                                                            AND ([target].[SiteNameId] = [source].[SiteNameId])
                                                                                                                                                                                                                                                                                                                                                                            AND ([target].[DeviceNameId] = [source].[DeviceNameId])
                                                                                                                                                                                                                                                                                                                                                                            AND ([target].[LanguageId] = [source].[LanguageId])
                                                                                                                                                                                                                                                                                                                                                                            AND ([target].[AccountId] = [source].[AccountId])
                                                                                                                                                                                                                                                                                                                                                                            AND ([target].[ItemId] = [source].[ItemId])
                                                                                                                                                                                                                                                                                                                                                                            AND ([target].[GoalPoints] = [source].[GoalPoints]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits]),
            [target].[Value]  = ([target].[Value] + [source].[Value]),
            [target].[Count]  = ([target].[Count] + [source].[Count])
        WHEN NOT MATCHED THEN INSERT ([Date], [TrafficType], [ContactId], [CampaignId], [GoalId], [SiteNameId], [DeviceNameId], [LanguageId], [AccountId], [ItemId], [GoalPoints], [Visits], [Value], [Count]) VALUES ([source].[Date], [source].[TrafficType], [source].[ContactId], [source].[CampaignId], [source].[GoalId], [source].[SiteNameId], [source].[DeviceNameId], [source].[LanguageId], [source].[AccountId], [source].[ItemId], [source].[GoalPoints], [source].[Visits], [source].[Value], [source].[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_Conversions]
                SET    [Visits] = ([Visits] + @Visits),
                       [Value]  = ([Value] + @Value),
                       [Count]  = ([Count] + @Count)
                WHERE  ([Date] = @Date)
                       AND ([TrafficType] = @TrafficType)
                       AND ([ContactId] = @ContactId)
                       AND ([CampaignId] = @CampaignId)
                       AND ([GoalId] = @GoalId)
                       AND ([SiteNameId] = @SiteNameId)
                       AND ([DeviceNameId] = @DeviceNameId)
                       AND ([LanguageId] = @LanguageId)
                       AND ([AccountId] = @AccountId)
                       AND ([ItemId] = @ItemId)
                       AND ([GoalPoints] = @GoalPoints);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_Conversions] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_Conversions_Tvp]
@table [dbo].[Conversions_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_Conversions] WITH (HOLDLOCK)
         AS [target]
        USING @table AS [source] ON (([target].[Date] = [source].[Date])
                                     AND ([target].[TrafficType] = [source].[TrafficType])
                                     AND ([target].[ContactId] = [source].[ContactId])
                                     AND ([target].[CampaignId] = [source].[CampaignId])
                                     AND ([target].[GoalId] = [source].[GoalId])
                                     AND ([target].[SiteNameId] = [source].[SiteNameId])
                                     AND ([target].[DeviceNameId] = [source].[DeviceNameId])
                                     AND ([target].[LanguageId] = [source].[LanguageId])
                                     AND ([target].[AccountId] = [source].[AccountId])
                                     AND ([target].[ItemId] = [source].[ItemId])
                                     AND ([target].[GoalPoints] = [source].[GoalPoints]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits]),
            [target].[Value]  = ([target].[Value] + [source].[Value]),
            [target].[Count]  = ([target].[Count] + [source].[Count])
        WHEN NOT MATCHED THEN INSERT ([Date], [TrafficType], [ContactId], [CampaignId], [GoalId], [SiteNameId], [DeviceNameId], [LanguageId], [AccountId], [ItemId], [GoalPoints], [Visits], [Value], [Count]) VALUES ([source].[Date], [source].[TrafficType], [source].[ContactId], [source].[CampaignId], [source].[GoalId], [source].[SiteNameId], [source].[DeviceNameId], [source].[LanguageId], [source].[AccountId], [source].[ItemId], [source].[GoalPoints], [source].[Visits], [source].[Value], [source].[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_ConversionsMetrics_Tvp]
@table [dbo].[ConversionsMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_ConversionsMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]             = (Target.[Visits] + Source.[Visits]),
            Target.[Value]              = (Target.[Value] + Source.[Value]),
            Target.[Pageviews]          = (Target.[Pageviews] + Source.[Pageviews]),
            Target.[MonetaryValue]      = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[OutcomeOccurrences] = (Target.[OutcomeOccurrences] + Source.[OutcomeOccurrences])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Pageviews], [MonetaryValue], [OutcomeOccurrences]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Pageviews], Source.[MonetaryValue], Source.[OutcomeOccurrences]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_DeviceMetrics_Tvp]
@table [dbo].[DeviceMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_DeviceMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]             = (Target.[Visits] + Source.[Visits]),
            Target.[Value]              = (Target.[Value] + Source.[Value]),
            Target.[Bounces]            = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions]        = (Target.[Conversions] + Source.[Conversions]),
            Target.[TimeOnSite]         = (Target.[TimeOnSite] + Source.[TimeOnSite]),
            Target.[Pageviews]          = (Target.[Pageviews] + Source.[Pageviews]),
            Target.[MonetaryValue]      = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[OutcomeOccurrences] = (Target.[OutcomeOccurrences] + Source.[OutcomeOccurrences])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [MonetaryValue], [OutcomeOccurrences]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Bounces], Source.[Conversions], Source.[TimeOnSite], Source.[Pageviews], Source.[MonetaryValue], Source.[OutcomeOccurrences]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_DownloadEventMetrics_Tvp]
@table [dbo].[DownloadEventMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_DownloadEventMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits] = (Target.[Visits] + Source.[Visits]),
            Target.[Value]  = (Target.[Value] + Source.[Value]),
            Target.[Count]  = (Target.[Count] + Source.[Count])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Count]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_Downloads]
@Date SMALLDATETIME NULL, @TrafficType INT NULL, @CampaignId UNIQUEIDENTIFIER NULL, @SiteNameId INT NULL, @DeviceNameId INT NULL, @LanguageId INT NULL, @AccountId UNIQUEIDENTIFIER NULL, @ItemId UNIQUEIDENTIFIER NULL, @AssetId UNIQUEIDENTIFIER NULL, @Visits BIGINT NULL, @Value BIGINT NULL, @Count BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_Downloads]
         AS [target]
        USING (VALUES (@Date, @TrafficType, @CampaignId, @SiteNameId, @DeviceNameId, @LanguageId, @AccountId, @ItemId, @AssetId, @Visits, @Value, @Count)) AS [source]([Date], [TrafficType], [CampaignId], [SiteNameId], [DeviceNameId], [LanguageId], [AccountId], [ItemId], [AssetId], [Visits], [Value], [Count]) ON (([target].[Date] = [source].[Date])
                                                                                                                                                                                                                                                                                                                          AND ([target].[TrafficType] = [source].[TrafficType])
                                                                                                                                                                                                                                                                                                                          AND ([target].[CampaignId] = [source].[CampaignId])
                                                                                                                                                                                                                                                                                                                          AND ([target].[SiteNameId] = [source].[SiteNameId])
                                                                                                                                                                                                                                                                                                                          AND ([target].[DeviceNameId] = [source].[DeviceNameId])
                                                                                                                                                                                                                                                                                                                          AND ([target].[LanguageId] = [source].[LanguageId])
                                                                                                                                                                                                                                                                                                                          AND ([target].[AccountId] = [source].[AccountId])
                                                                                                                                                                                                                                                                                                                          AND ([target].[ItemId] = [source].[ItemId])
                                                                                                                                                                                                                                                                                                                          AND ([target].[AssetId] = [source].[AssetId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits]),
            [target].[Value]  = ([target].[Value] + [source].[Value]),
            [target].[Count]  = ([target].[Count] + [source].[Count])
        WHEN NOT MATCHED THEN INSERT ([Date], [TrafficType], [CampaignId], [SiteNameId], [DeviceNameId], [LanguageId], [AccountId], [ItemId], [AssetId], [Visits], [Value], [Count]) VALUES ([source].[Date], [source].[TrafficType], [source].[CampaignId], [source].[SiteNameId], [source].[DeviceNameId], [source].[LanguageId], [source].[AccountId], [source].[ItemId], [source].[AssetId], [source].[Visits], [source].[Value], [source].[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_Downloads]
                SET    [Visits] = ([Visits] + @Visits),
                       [Value]  = ([Value] + @Value),
                       [Count]  = ([Count] + @Count)
                WHERE  ([Date] = @Date)
                       AND ([TrafficType] = @TrafficType)
                       AND ([CampaignId] = @CampaignId)
                       AND ([SiteNameId] = @SiteNameId)
                       AND ([DeviceNameId] = @DeviceNameId)
                       AND ([LanguageId] = @LanguageId)
                       AND ([AccountId] = @AccountId)
                       AND ([ItemId] = @ItemId)
                       AND ([AssetId] = @AssetId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_Downloads] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_Downloads_Tvp]
@table [dbo].[Downloads_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_Downloads] WITH (HOLDLOCK)
         AS [target]
        USING @table AS [source] ON (([target].[Date] = [source].[Date])
                                     AND ([target].[TrafficType] = [source].[TrafficType])
                                     AND ([target].[CampaignId] = [source].[CampaignId])
                                     AND ([target].[SiteNameId] = [source].[SiteNameId])
                                     AND ([target].[DeviceNameId] = [source].[DeviceNameId])
                                     AND ([target].[LanguageId] = [source].[LanguageId])
                                     AND ([target].[AccountId] = [source].[AccountId])
                                     AND ([target].[ItemId] = [source].[ItemId])
                                     AND ([target].[AssetId] = [source].[AssetId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits]),
            [target].[Value]  = ([target].[Value] + [source].[Value]),
            [target].[Count]  = ([target].[Count] + [source].[Count])
        WHEN NOT MATCHED THEN INSERT ([Date], [TrafficType], [CampaignId], [SiteNameId], [DeviceNameId], [LanguageId], [AccountId], [ItemId], [AssetId], [Visits], [Value], [Count]) VALUES ([source].[Date], [source].[TrafficType], [source].[CampaignId], [source].[SiteNameId], [source].[DeviceNameId], [source].[LanguageId], [source].[AccountId], [source].[ItemId], [source].[AssetId], [source].[Visits], [source].[Value], [source].[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_Failures]
@VisitId UNIQUEIDENTIFIER NULL, @AccountId UNIQUEIDENTIFIER NULL, @Date SMALLDATETIME NULL, @ContactId UNIQUEIDENTIFIER NULL, @PageEventDefinitionId UNIQUEIDENTIFIER NULL, @KeywordsId UNIQUEIDENTIFIER NULL, @ReferringSiteId UNIQUEIDENTIFIER NULL, @ContactVisitIndex INT NULL, @VisitPageIndex INT NULL, @FailureDetailsId UNIQUEIDENTIFIER NULL, @Value BIGINT NULL, @Count BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_Failures]
         AS [target]
        USING (VALUES (@VisitId, @AccountId, @Date, @ContactId, @PageEventDefinitionId, @KeywordsId, @ReferringSiteId, @ContactVisitIndex, @VisitPageIndex, @FailureDetailsId, @Value, @Count)) AS [source]([VisitId], [AccountId], [Date], [ContactId], [PageEventDefinitionId], [KeywordsId], [ReferringSiteId], [ContactVisitIndex], [VisitPageIndex], [FailureDetailsId], [Value], [Count]) ON (([target].[VisitId] = [source].[VisitId])
                                                                                                                                                                                                                                                                                                                                                                                                    AND ([target].[AccountId] = [source].[AccountId])
                                                                                                                                                                                                                                                                                                                                                                                                    AND ([target].[Date] = [source].[Date])
                                                                                                                                                                                                                                                                                                                                                                                                    AND ([target].[ContactId] = [source].[ContactId])
                                                                                                                                                                                                                                                                                                                                                                                                    AND ([target].[PageEventDefinitionId] = [source].[PageEventDefinitionId])
                                                                                                                                                                                                                                                                                                                                                                                                    AND ([target].[KeywordsId] = [source].[KeywordsId])
                                                                                                                                                                                                                                                                                                                                                                                                    AND ([target].[ReferringSiteId] = [source].[ReferringSiteId])
                                                                                                                                                                                                                                                                                                                                                                                                    AND ([target].[ContactVisitIndex] = [source].[ContactVisitIndex])
                                                                                                                                                                                                                                                                                                                                                                                                    AND ([target].[VisitPageIndex] = [source].[VisitPageIndex])
                                                                                                                                                                                                                                                                                                                                                                                                    AND ([target].[FailureDetailsId] = [source].[FailureDetailsId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Value] = ([target].[Value] + [source].[Value]),
            [target].[Count] = ([target].[Count] + [source].[Count])
        WHEN NOT MATCHED THEN INSERT ([VisitId], [AccountId], [Date], [ContactId], [PageEventDefinitionId], [KeywordsId], [ReferringSiteId], [ContactVisitIndex], [VisitPageIndex], [FailureDetailsId], [Value], [Count]) VALUES ([source].[VisitId], [source].[AccountId], [source].[Date], [source].[ContactId], [source].[PageEventDefinitionId], [source].[KeywordsId], [source].[ReferringSiteId], [source].[ContactVisitIndex], [source].[VisitPageIndex], [source].[FailureDetailsId], [source].[Value], [source].[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_Failures]
                SET    [Value] = ([Value] + @Value),
                       [Count] = ([Count] + @Count)
                WHERE  ([VisitId] = @VisitId)
                       AND ([AccountId] = @AccountId)
                       AND ([Date] = @Date)
                       AND ([ContactId] = @ContactId)
                       AND ([PageEventDefinitionId] = @PageEventDefinitionId)
                       AND ([KeywordsId] = @KeywordsId)
                       AND ([ReferringSiteId] = @ReferringSiteId)
                       AND ([ContactVisitIndex] = @ContactVisitIndex)
                       AND ([VisitPageIndex] = @VisitPageIndex)
                       AND ([FailureDetailsId] = @FailureDetailsId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_Failures] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_Failures_Tvp]
@table [dbo].[Failures_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_Failures] WITH (HOLDLOCK)
         AS [target]
        USING @table AS [source] ON (([target].[VisitId] = [source].[VisitId])
                                     AND ([target].[AccountId] = [source].[AccountId])
                                     AND ([target].[Date] = [source].[Date])
                                     AND ([target].[ContactId] = [source].[ContactId])
                                     AND ([target].[PageEventDefinitionId] = [source].[PageEventDefinitionId])
                                     AND ([target].[KeywordsId] = [source].[KeywordsId])
                                     AND ([target].[ReferringSiteId] = [source].[ReferringSiteId])
                                     AND ([target].[ContactVisitIndex] = [source].[ContactVisitIndex])
                                     AND ([target].[VisitPageIndex] = [source].[VisitPageIndex])
                                     AND ([target].[FailureDetailsId] = [source].[FailureDetailsId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Value] = ([target].[Value] + [source].[Value]),
            [target].[Count] = ([target].[Count] + [source].[Count])
        WHEN NOT MATCHED THEN INSERT ([VisitId], [AccountId], [Date], [ContactId], [PageEventDefinitionId], [KeywordsId], [ReferringSiteId], [ContactVisitIndex], [VisitPageIndex], [FailureDetailsId], [Value], [Count]) VALUES ([source].[VisitId], [source].[AccountId], [source].[Date], [source].[ContactId], [source].[PageEventDefinitionId], [source].[KeywordsId], [source].[ReferringSiteId], [source].[ContactVisitIndex], [source].[VisitPageIndex], [source].[FailureDetailsId], [source].[Value], [source].[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_FollowHits]
@Date SMALLDATETIME NULL, @ItemId UNIQUEIDENTIFIER NULL, @KeywordsId UNIQUEIDENTIFIER NULL, @Visits BIGINT NULL, @Value BIGINT NULL, @Count BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_FollowHits]
         AS [target]
        USING (VALUES (@Date, @ItemId, @KeywordsId, @Visits, @Value, @Count)) AS [source]([Date], [ItemId], [KeywordsId], [Visits], [Value], [Count]) ON (([target].[Date] = [source].[Date])
                                                                                                                                                          AND ([target].[ItemId] = [source].[ItemId])
                                                                                                                                                          AND ([target].[KeywordsId] = [source].[KeywordsId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits]),
            [target].[Value]  = ([target].[Value] + [source].[Value]),
            [target].[Count]  = ([target].[Count] + [source].[Count])
        WHEN NOT MATCHED THEN INSERT ([Date], [ItemId], [KeywordsId], [Visits], [Value], [Count]) VALUES ([source].[Date], [source].[ItemId], [source].[KeywordsId], [source].[Visits], [source].[Value], [source].[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_FollowHits]
                SET    [Visits] = ([Visits] + @Visits),
                       [Value]  = ([Value] + @Value),
                       [Count]  = ([Count] + @Count)
                WHERE  ([Date] = @Date)
                       AND ([ItemId] = @ItemId)
                       AND ([KeywordsId] = @KeywordsId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_FollowHits] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_FollowHits_Tvp]
@table [dbo].[FollowHits_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_FollowHits] WITH (HOLDLOCK)
         AS [target]
        USING @table AS [source] ON (([target].[Date] = [source].[Date])
                                     AND ([target].[ItemId] = [source].[ItemId])
                                     AND ([target].[KeywordsId] = [source].[KeywordsId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits]),
            [target].[Value]  = ([target].[Value] + [source].[Value]),
            [target].[Count]  = ([target].[Count] + [source].[Count])
        WHEN NOT MATCHED THEN INSERT ([Date], [ItemId], [KeywordsId], [Visits], [Value], [Count]) VALUES ([source].[Date], [source].[ItemId], [source].[KeywordsId], [source].[Visits], [source].[Value], [source].[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_GeoMetrics_Tvp]
@table [dbo].[GeoMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_GeoMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]             = (Target.[Visits] + Source.[Visits]),
            Target.[Value]              = (Target.[Value] + Source.[Value]),
            Target.[Bounces]            = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions]        = (Target.[Conversions] + Source.[Conversions]),
            Target.[TimeOnSite]         = (Target.[TimeOnSite] + Source.[TimeOnSite]),
            Target.[Pageviews]          = (Target.[Pageviews] + Source.[Pageviews]),
            Target.[MonetaryValue]      = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[OutcomeOccurrences] = (Target.[OutcomeOccurrences] + Source.[OutcomeOccurrences])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [MonetaryValue], [OutcomeOccurrences]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Bounces], Source.[Conversions], Source.[TimeOnSite], Source.[Pageviews], Source.[MonetaryValue], Source.[OutcomeOccurrences]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_GoalMetrics_Tvp]
@table [dbo].[GoalMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_GoalMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]      = (Target.[Visits] + Source.[Visits]),
            Target.[Value]       = (Target.[Value] + Source.[Value]),
            Target.[Count]       = (Target.[Count] + Source.[Count]),
            Target.[Conversions] = (Target.[Conversions] + Source.[Conversions])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Count], [Conversions]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Count], Source.[Conversions]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_LanguageMetrics_Tvp]
@table [dbo].[LanguageMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_LanguageMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]             = (Target.[Visits] + Source.[Visits]),
            Target.[Value]              = (Target.[Value] + Source.[Value]),
            Target.[Bounces]            = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions]        = (Target.[Conversions] + Source.[Conversions]),
            Target.[TimeOnSite]         = (Target.[TimeOnSite] + Source.[TimeOnSite]),
            Target.[Pageviews]          = (Target.[Pageviews] + Source.[Pageviews]),
            Target.[MonetaryValue]      = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[OutcomeOccurrences] = (Target.[OutcomeOccurrences] + Source.[OutcomeOccurrences])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [MonetaryValue], [OutcomeOccurrences]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Bounces], Source.[Conversions], Source.[TimeOnSite], Source.[Pageviews], Source.[MonetaryValue], Source.[OutcomeOccurrences]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_MvTesting]
@TestSetId UNIQUEIDENTIFIER NULL, @TestValues BINARY (16) NULL, @Visits BIGINT NULL, @Value BIGINT NULL, @Bounces BIGINT NULL, @TotalPageDuration BIGINT NULL, @TotalWebsiteDuration BIGINT NULL, @PageCount BIGINT NULL, @Visitors BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_MvTesting]
         AS [target]
        USING (VALUES (@TestSetId, @TestValues, @Visits, @Value, @Bounces, @TotalPageDuration, @TotalWebsiteDuration, @PageCount, @Visitors)) AS [source]([TestSetId], [TestValues], [Visits], [Value], [Bounces], [TotalPageDuration], [TotalWebsiteDuration], [PageCount], [Visitors]) ON (([target].[TestSetId] = [source].[TestSetId])
                                                                                                                                                                                                                                                                                             AND ([target].[TestValues] = [source].[TestValues]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits]               = ([target].[Visits] + [source].[Visits]),
            [target].[Value]                = ([target].[Value] + [source].[Value]),
            [target].[Bounces]              = ([target].[Bounces] + [source].[Bounces]),
            [target].[TotalPageDuration]    = ([target].[TotalPageDuration] + [source].[TotalPageDuration]),
            [target].[TotalWebsiteDuration] = ([target].[TotalWebsiteDuration] + [source].[TotalWebsiteDuration]),
            [target].[PageCount]            = ([target].[PageCount] + [source].[PageCount]),
            [target].[Visitors]             = ([target].[Visitors] + [source].[Visitors])
        WHEN NOT MATCHED THEN INSERT ([TestSetId], [TestValues], [Visits], [Value], [Bounces], [TotalPageDuration], [TotalWebsiteDuration], [PageCount], [Visitors]) VALUES ([source].[TestSetId], [source].[TestValues], [source].[Visits], [source].[Value], [source].[Bounces], [source].[TotalPageDuration], [source].[TotalWebsiteDuration], [source].[PageCount], [source].[Visitors]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_MvTesting]
                SET    [Visits]               = ([Visits] + @Visits),
                       [Value]                = ([Value] + @Value),
                       [Bounces]              = ([Bounces] + @Bounces),
                       [TotalPageDuration]    = ([TotalPageDuration] + @TotalPageDuration),
                       [TotalWebsiteDuration] = ([TotalWebsiteDuration] + @TotalWebsiteDuration),
                       [PageCount]            = ([PageCount] + @PageCount),
                       [Visitors]             = ([Visitors] + @Visitors)
                WHERE  ([TestSetId] = @TestSetId)
                       AND ([TestValues] = @TestValues);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_MvTesting] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_MvTestingDetails]
@TestSetId UNIQUEIDENTIFIER NULL, @TestValues BINARY (16) NULL, @Value BIGINT NULL, @Visits BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_MvTestingDetails]
         AS [target]
        USING (VALUES (@TestSetId, @TestValues, @Value, @Visits)) AS [source]([TestSetId], [TestValues], [Value], [Visits]) ON (([target].[TestSetId] = [source].[TestSetId])
                                                                                                                                AND ([target].[TestValues] = [source].[TestValues])
                                                                                                                                AND ([target].[Value] = [source].[Value]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits])
        WHEN NOT MATCHED THEN INSERT ([TestSetId], [TestValues], [Value], [Visits]) VALUES ([source].[TestSetId], [source].[TestValues], [source].[Value], [source].[Visits]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_MvTestingDetails]
                SET    [Visits] = ([Visits] + @Visits)
                WHERE  ([TestSetId] = @TestSetId)
                       AND ([TestValues] = @TestValues)
                       AND ([Value] = @Value);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_MvTestingDetails] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_OutcomeMetrics_Tvp]
@table [dbo].[OutcomeMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_OutcomeMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]             = (Target.[Visits] + Source.[Visits]),
            Target.[MonetaryValue]      = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[OutcomeOccurrences] = (Target.[OutcomeOccurrences] + Source.[OutcomeOccurrences]),
            Target.[Value]              = (Target.[Value] + Source.[Value]),
            Target.[Conversions]        = (Target.[Conversions] + Source.[Conversions])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [MonetaryValue], [OutcomeOccurrences], [Value], [Conversions]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[MonetaryValue], Source.[OutcomeOccurrences], Source.[Value], Source.[Conversions]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_PageMetrics_Tvp]
@table [dbo].[PageMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_PageMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]             = (Target.[Visits] + Source.[Visits]),
            Target.[Value]              = (Target.[Value] + Source.[Value]),
            Target.[Bounces]            = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions]        = (Target.[Conversions] + Source.[Conversions]),
            Target.[Pageviews]          = (Target.[Pageviews] + Source.[Pageviews]),
            Target.[TimeOnSite]         = (Target.[TimeOnSite] + Source.[TimeOnSite]),
            Target.[TimeOnPage]         = (Target.[TimeOnPage] + Source.[TimeOnPage]),
            Target.[MonetaryValue]      = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[OutcomeOccurrences] = (Target.[OutcomeOccurrences] + Source.[OutcomeOccurrences])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Bounces], [Conversions], [Pageviews], [TimeOnPage], [TimeOnSite], [MonetaryValue], [OutcomeOccurrences]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Bounces], Source.[Conversions], Source.[Pageviews], Source.[TimeOnPage], Source.[TimeOnSite], Source.[MonetaryValue], Source.[OutcomeOccurrences]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_PageViews]
@Date SMALLDATETIME NULL, @ItemId UNIQUEIDENTIFIER NULL, @ContactId UNIQUEIDENTIFIER NULL, @TestId UNIQUEIDENTIFIER NULL, @TestCombination BINARY (16) NULL, @Views BIGINT NULL, @Duration BIGINT NULL, @Visits BIGINT NULL, @Value BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_PageViews]
         AS [target]
        USING (VALUES (@Date, @ItemId, @ContactId, @TestId, @TestCombination, @Views, @Duration, @Visits, @Value)) AS [source]([Date], [ItemId], [ContactId], [TestId], [TestCombination], [Views], [Duration], [Visits], [Value]) ON ([target].[Date] = [source].[Date])
                                                                                                                                                                                                                                      AND ([target].[ItemId] = [source].[ItemId])
                                                                                                                                                                                                                                      AND ([target].[ContactId] = [source].[ContactId])
                                                                                                                                                                                                                                      AND ([target].[TestId] = [source].[TestId])
                                                                                                                                                                                                                                      AND ([target].[TestCombination] = [source].[TestCombination])
        WHEN MATCHED THEN UPDATE 
        SET [target].[Views]    = ([target].[Views] + [source].[Views]),
            [target].[Duration] = ([target].[Duration] + [source].[Duration]),
            [target].[Visits]   = ([target].[Visits] + [source].[Visits]),
            [target].[Value]    = ([target].[Value] + [source].[Value])
        WHEN NOT MATCHED THEN INSERT ([Date], [ItemId], [ContactId], [TestId], [TestCombination], [Views], [Duration], [Visits], [Value]) VALUES ([source].[Date], [source].[ItemId], [source].[ContactId], [source].[TestId], [source].[TestCombination], [source].[Views], [source].[Duration], [source].[Visits], [source].[Value]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_PageViews]
                SET    [Views]    = ([Views] + @Views),
                       [Duration] = ([Duration] + @Duration),
                       [Visits]   = ([Visits] + @Visits),
                       [Value]    = ([Value] + @Value)
                WHERE  ([Date] = @Date)
                       AND ([ItemId] = @ItemId)
                       AND ([ContactId] = @ContactId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_PageViews] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_PageViewsByLanguage]
@Date SMALLDATETIME NULL, @SiteNameId INT NULL, @ItemId UNIQUEIDENTIFIER NULL, @LanguageId INT NULL, @DeviceNameId INT NULL, @Views BIGINT NULL, @Visits BIGINT NULL, @Duration BIGINT NULL, @Value BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_PageViewsByLanguage]
         AS [target]
        USING (VALUES (@Date, @SiteNameId, @ItemId, @LanguageId, @DeviceNameId, @Views, @Visits, @Duration, @Value)) AS [source]([Date], [SiteNameId], [ItemId], [LanguageId], [DeviceNameId], [Views], [Visits], [Duration], [Value]) ON ([target].[Date] = [source].[Date])
                                                                                                                                                                                                                                          AND ([target].[SiteNameId] = [source].[SiteNameId])
                                                                                                                                                                                                                                          AND ([target].[ItemId] = [source].[ItemId])
                                                                                                                                                                                                                                          AND ([target].[LanguageId] = [source].[LanguageId])
                                                                                                                                                                                                                                          AND ([target].[DeviceNameId] = [source].[DeviceNameId])
        WHEN MATCHED THEN UPDATE 
        SET [target].[Views]    = ([target].[Views] + [source].[Views]),
            [target].[Visits]   = ([target].[Visits] + [source].[Visits]),
            [target].[Duration] = ([target].[Duration] + [source].[Duration]),
            [target].[Value]    = ([target].[Value] + [source].[Value])
        WHEN NOT MATCHED THEN INSERT ([Date], [SiteNameId], [ItemId], [LanguageId], [DeviceNameId], [Views], [Visits], [Duration], [Value]) VALUES ([source].[Date], [source].[SiteNameId], [source].[ItemId], [source].[LanguageId], [source].[DeviceNameId], [source].[Views], [source].[Visits], [source].[Duration], [source].[Value]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_PageViewsByLanguage]
                SET    [Views]    = ([Views] + @Views),
                       [Visits]   = ([Visits] + @Visits),
                       [Duration] = ([Duration] + @Duration),
                       [Value]    = ([Value] + @Value)
                WHERE  ([Date] = @Date)
                       AND ([SiteNameId] = @SiteNameId)
                       AND ([ItemId] = @ItemId)
                       AND ([LanguageId] = @LanguageId)
                       AND ([DeviceNameId] = @DeviceNameId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_PageViewsByLanguage] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_PageViewsMetrics_Tvp]
@table [dbo].[PageViewsMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_PageViewsMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]             = (Target.[Visits] + Source.[Visits]),
            Target.[Value]              = (Target.[Value] + Source.[Value]),
            Target.[Bounces]            = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions]        = (Target.[Conversions] + Source.[Conversions]),
            Target.[TimeOnSite]         = (Target.[TimeOnSite] + Source.[TimeOnSite]),
            Target.[MonetaryValue]      = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[OutcomeOccurrences] = (Target.[OutcomeOccurrences] + Source.[OutcomeOccurrences])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [MonetaryValue], [OutcomeOccurrences]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Bounces], Source.[Conversions], Source.[TimeOnSite], Source.[MonetaryValue], Source.[OutcomeOccurrences]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_PatternMetrics_Tvp]
@table [dbo].[PatternMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_PatternMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]             = (Target.[Visits] + Source.[Visits]),
            Target.[Value]              = (Target.[Value] + Source.[Value]),
            Target.[Bounces]            = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions]        = (Target.[Conversions] + Source.[Conversions]),
            Target.[TimeOnSite]         = (Target.[TimeOnSite] + Source.[TimeOnSite]),
            Target.[Pageviews]          = (Target.[Pageviews] + Source.[Pageviews]),
            Target.[MonetaryValue]      = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[OutcomeOccurrences] = (Target.[OutcomeOccurrences] + Source.[OutcomeOccurrences])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [MonetaryValue], [OutcomeOccurrences]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Bounces], Source.[Conversions], Source.[TimeOnSite], Source.[Pageviews], Source.[MonetaryValue], Source.[OutcomeOccurrences]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_Personalization]
@Date DATE NULL, @RuleSetId UNIQUEIDENTIFIER NULL, @RuleId UNIQUEIDENTIFIER NULL, @TestSetId UNIQUEIDENTIFIER NULL, @TestValues BINARY (16) NULL, @Visits BIGINT NULL, @Value BIGINT NULL, @Visitors BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_Personalization]
         AS [target]
        USING (VALUES (@Date, @RuleSetId, @RuleId, @TestSetId, @TestValues, @Visits, @Value, @Visitors)) AS [source]([Date], [RuleSetId], [RuleId], [TestSetId], [TestValues], [Visits], [Value], [Visitors]) ON ([target].[Date] = [source].[Date])
                                                                                                                                                                                                                 AND ([target].[RuleSetId] = [source].[RuleSetId])
                                                                                                                                                                                                                 AND ([target].[RuleId] = [source].[RuleId])
                                                                                                                                                                                                                 AND ([target].[TestSetId] = [source].[TestSetId])
                                                                                                                                                                                                                 AND ([target].[TestValues] = [source].[TestValues])
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits]   = ([target].[Visits] + [source].[Visits]),
            [target].[Value]    = ([target].[Value] + [source].[Value]),
            [target].[Visitors] = ([target].[Visitors] + [source].[Visitors])
        WHEN NOT MATCHED THEN INSERT ([Date], [RuleSetId], [RuleId], [TestSetId], [TestValues], [Visits], [Value], [Visitors]) VALUES ([source].[Date], [source].[RuleSetId], [source].[RuleId], [source].[TestSetId], [source].[TestValues], [source].[Visits], [source].[Value], [source].[Visitors]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_Personalization]
                SET    [Visits]   = ([Visits] + @Visits),
                       [Value]    = ([Value] + @Value),
                       [Visitors] = ([Visitors] + @Visitors)
                WHERE  ([Date] = @Date)
                       AND ([RuleSetId] = @RuleSetId)
                       AND ([RuleId] = @RuleId)
                       AND ([TestSetId] = @TestSetId)
                       AND ([TestValues] = @TestValues);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_Personalization] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_ReferringSiteMetrics_Tvp]
@table [dbo].[ReferringSiteMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_ReferringSiteMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]             = (Target.[Visits] + Source.[Visits]),
            Target.[Value]              = (Target.[Value] + Source.[Value]),
            Target.[Bounces]            = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions]        = (Target.[Conversions] + Source.[Conversions]),
            Target.[TimeOnSite]         = (Target.[TimeOnSite] + Source.[TimeOnSite]),
            Target.[Pageviews]          = (Target.[Pageviews] + Source.[Pageviews]),
            Target.[MonetaryValue]      = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[OutcomeOccurrences] = (Target.[OutcomeOccurrences] + Source.[OutcomeOccurrences])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [MonetaryValue], [OutcomeOccurrences]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Bounces], Source.[Conversions], Source.[TimeOnSite], Source.[Pageviews], Source.[MonetaryValue], Source.[OutcomeOccurrences]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_RulesExposure]
@Date DATE NULL, @ItemId UNIQUEIDENTIFIER NULL, @RuleSetId UNIQUEIDENTIFIER NULL, @RuleId UNIQUEIDENTIFIER NULL, @Visits BIGINT NULL, @Visitors BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_RulesExposure]
         AS [target]
        USING (VALUES (@Date, @ItemId, @RuleSetId, @RuleId, @Visits, @Visitors)) AS [source]([Date], [ItemId], [RuleSetId], [RuleId], [Visits], [Visitors]) ON ([target].[Date] = [source].[Date])
                                                                                                                                                               AND ([target].[ItemId] = [source].[ItemId])
                                                                                                                                                               AND ([target].[RuleSetId] = [source].[RuleSetId])
                                                                                                                                                               AND ([target].[RuleId] = [source].[RuleId])
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits]   = ([target].[Visits] + [source].[Visits]),
            [target].[Visitors] = ([target].[Visitors] + [source].[Visitors])
        WHEN NOT MATCHED THEN INSERT ([Date], [ItemId], [RuleSetId], [RuleId], [Visits], [Visitors]) VALUES ([source].[Date], [source].[ItemId], [source].[RuleSetId], [source].[RuleId], [source].[Visits], [source].[Visitors]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_RulesExposure]
                SET    [Visits]   = ([Visits] + @Visits),
                       [Visitors] = ([Visitors] + @Visitors)
                WHERE  ([Date] = @Date)
                       AND ([ItemId] = @ItemId)
                       AND ([RuleSetId] = @RuleSetId)
                       AND ([RuleId] = @RuleId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_RulesExposure] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_SearchMetrics_Tvp]
@table [dbo].[SearchMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_SearchMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]             = (Target.[Visits] + Source.[Visits]),
            Target.[Value]              = (Target.[Value] + Source.[Value]),
            Target.[Bounces]            = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions]        = (Target.[Conversions] + Source.[Conversions]),
            Target.[TimeOnSite]         = (Target.[TimeOnSite] + Source.[TimeOnSite]),
            Target.[Count]              = (Target.[Count] + Source.[Count]),
            Target.[MonetaryValue]      = (Target.[MonetaryValue] + Source.[MonetaryValue]),
            Target.[OutcomeOccurrences] = (Target.[OutcomeOccurrences] + Source.[OutcomeOccurrences])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Count], [MonetaryValue], [OutcomeOccurrences]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId], Source.[Visits], Source.[Value], Source.[Bounces], Source.[Conversions], Source.[TimeOnSite], Source.[Count], Source.[MonetaryValue], Source.[OutcomeOccurrences]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_SegmentMetrics]
@SegmentRecordId BIGINT NULL, @ContactTransitionType TINYINT NULL, @Visits INT NULL, @Value INT NULL, @Bounces INT NULL, @Conversions INT NULL, @TimeOnSite INT NULL, @Pageviews INT NULL, @Count INT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_SegmentMetrics]
         AS Target
        USING (VALUES (@SegmentRecordId, @ContactTransitionType, @Visits, @Value, @Bounces, @Conversions, @TimeOnSite, @Pageviews, @Count)) AS Source(SegmentRecordId, ContactTransitionType, Visits, Value, Bounces, Conversions, TimeOnSite, Pageviews, Count) ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
                                                                                                                                                                                                                                                                    AND Target.[ContactTransitionType] = Source.[ContactTransitionType]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]      = (Target.[Visits] + Source.[Visits]),
            Target.[Value]       = (Target.[Value] + Source.[Value]),
            Target.[Bounces]     = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions] = (Target.[Conversions] + Source.[Conversions]),
            Target.[TimeOnSite]  = (Target.[TimeOnSite] + Source.[TimeOnSite]),
            Target.[Pageviews]   = (Target.[Pageviews] + Source.[Pageviews]),
            Target.[Count]       = (Target.[Count] + Source.[Count])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [ContactTransitionType], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [Count]) VALUES (Source.[SegmentRecordId], Source.[ContactTransitionType], Source.[Visits], Source.[Value], Source.[Bounces], Source.[Conversions], Source.[TimeOnSite], Source.[Pageviews], Source.[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_SegmentMetrics]
                SET    [Visits]      = ([Visits] + @Visits),
                       [Value]       = ([Value] + @Value),
                       [Bounces]     = ([Bounces] + @Bounces),
                       [Conversions] = ([Conversions] + @Conversions),
                       [TimeOnSite]  = ([TimeOnSite] + @TimeOnSite),
                       [Pageviews]   = ([Pageviews] + @Pageviews),
                       [Count]       = ([Count] + @Count)
                WHERE  [SegmentRecordId] = ([SegmentRecordId] + @SegmentRecordId)
                       AND [ContactTransitionType] = ([ContactTransitionType] + @ContactTransitionType);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_SegmentMetrics] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_SegmentMetrics_Tvp]
@table [dbo].[SegmentMetrics_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_SegmentMetrics]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
                                  AND Target.[ContactTransitionType] = Source.[ContactTransitionType]
        WHEN MATCHED THEN UPDATE 
        SET Target.[Visits]      = (Target.[Visits] + Source.[Visits]),
            Target.[Value]       = (Target.[Value] + Source.[Value]),
            Target.[Bounces]     = (Target.[Bounces] + Source.[Bounces]),
            Target.[Conversions] = (Target.[Conversions] + Source.[Conversions]),
            Target.[TimeOnSite]  = (Target.[TimeOnSite] + Source.[TimeOnSite]),
            Target.[Pageviews]   = (Target.[Pageviews] + Source.[Pageviews]),
            Target.[Count]       = (Target.[Count] + Source.[Count])
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [ContactTransitionType], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [Count]) VALUES (Source.[SegmentRecordId], Source.[ContactTransitionType], Source.[Visits], Source.[Value], Source.[Bounces], Source.[Conversions], Source.[TimeOnSite], Source.[Pageviews], Source.[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_SiteSearches]
@Date SMALLDATETIME NULL, @TrafficType INT NULL, @CampaignId UNIQUEIDENTIFIER NULL, @ItemId UNIQUEIDENTIFIER NULL, @SiteNameId INT NULL, @DeviceNameId INT NULL, @LanguageId INT NULL, @AccountId UNIQUEIDENTIFIER NULL, @KeywordsId UNIQUEIDENTIFIER NULL, @Visits BIGINT NULL, @Value BIGINT NULL, @Count BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_SiteSearches]
         AS [target]
        USING (VALUES (@Date, @TrafficType, @CampaignId, @ItemId, @SiteNameId, @DeviceNameId, @LanguageId, @AccountId, @KeywordsId, @Visits, @Value, @Count)) AS [source]([Date], [TrafficType], [CampaignId], [ItemId], [SiteNameId], [DeviceNameId], [LanguageId], [AccountId], [KeywordsId], [Visits], [Value], [Count]) ON (([target].[Date] = [source].[Date])
                                                                                                                                                                                                                                                                                                                                AND ([target].[TrafficType] = [source].[TrafficType])
                                                                                                                                                                                                                                                                                                                                AND ([target].[CampaignId] = [source].[CampaignId])
                                                                                                                                                                                                                                                                                                                                AND ([target].[ItemId] = [source].[ItemId])
                                                                                                                                                                                                                                                                                                                                AND ([target].[SiteNameId] = [source].[SiteNameId])
                                                                                                                                                                                                                                                                                                                                AND ([target].[DeviceNameId] = [source].[DeviceNameId])
                                                                                                                                                                                                                                                                                                                                AND ([target].[LanguageId] = [source].[LanguageId])
                                                                                                                                                                                                                                                                                                                                AND ([target].[AccountId] = [source].[AccountId])
                                                                                                                                                                                                                                                                                                                                AND ([target].[KeywordsId] = [source].[KeywordsId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits]),
            [target].[Value]  = ([target].[Value] + [source].[Value]),
            [target].[Count]  = ([target].[Count] + [source].[Count])
        WHEN NOT MATCHED THEN INSERT ([Date], [TrafficType], [CampaignId], [ItemId], [SiteNameId], [DeviceNameId], [LanguageId], [AccountId], [KeywordsId], [Visits], [Value], [Count]) VALUES ([source].[Date], [source].[TrafficType], [source].[CampaignId], [source].[ItemId], [source].[SiteNameId], [source].[DeviceNameId], [source].[LanguageId], [source].[AccountId], [source].[KeywordsId], [source].[Visits], [source].[Value], [source].[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_SiteSearches]
                SET    [Visits] = ([Visits] + @Visits),
                       [Value]  = ([Value] + @Value),
                       [Count]  = ([Count] + @Count)
                WHERE  ([Date] = @Date)
                       AND ([TrafficType] = @TrafficType)
                       AND ([CampaignId] = @CampaignId)
                       AND ([ItemId] = @ItemId)
                       AND ([SiteNameId] = @SiteNameId)
                       AND ([DeviceNameId] = @DeviceNameId)
                       AND ([LanguageId] = @LanguageId)
                       AND ([AccountId] = @AccountId)
                       AND ([KeywordsId] = @KeywordsId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_SiteSearches] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_SiteSearches_Tvp]
@table [dbo].[SiteSearches_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_SiteSearches] WITH (HOLDLOCK)
         AS [target]
        USING @table AS [source] ON (([target].[Date] = [source].[Date])
                                     AND ([target].[TrafficType] = [source].[TrafficType])
                                     AND ([target].[CampaignId] = [source].[CampaignId])
                                     AND ([target].[ItemId] = [source].[ItemId])
                                     AND ([target].[SiteNameId] = [source].[SiteNameId])
                                     AND ([target].[DeviceNameId] = [source].[DeviceNameId])
                                     AND ([target].[LanguageId] = [source].[LanguageId])
                                     AND ([target].[AccountId] = [source].[AccountId])
                                     AND ([target].[KeywordsId] = [source].[KeywordsId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits]),
            [target].[Value]  = ([target].[Value] + [source].[Value]),
            [target].[Count]  = ([target].[Count] + [source].[Count])
        WHEN NOT MATCHED THEN INSERT ([Date], [TrafficType], [CampaignId], [ItemId], [SiteNameId], [DeviceNameId], [LanguageId], [AccountId], [KeywordsId], [Visits], [Value], [Count]) VALUES ([source].[Date], [source].[TrafficType], [source].[CampaignId], [source].[ItemId], [source].[SiteNameId], [source].[DeviceNameId], [source].[LanguageId], [source].[AccountId], [source].[KeywordsId], [source].[Visits], [source].[Value], [source].[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_SlowPages]
@Date SMALLDATETIME NULL, @ItemId UNIQUEIDENTIFIER NULL, @Duration INT NULL, @VisitId UNIQUEIDENTIFIER NULL, @AccountId UNIQUEIDENTIFIER NULL, @ContactId UNIQUEIDENTIFIER NULL, @ContactVisitIndex INT NULL, @Value INT NULL, @Views BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_SlowPages]
         AS [target]
        USING (VALUES (@Date, @ItemId, @Duration, @VisitId, @AccountId, @ContactId, @ContactVisitIndex, @Value, @Views)) AS [source]([Date], [ItemId], [Duration], [VisitId], [AccountId], [ContactId], [ContactVisitIndex], [Value], [Views]) ON (([target].[Date] = [source].[Date])
                                                                                                                                                                                                                                                   AND ([target].[ItemId] = [source].[ItemId])
                                                                                                                                                                                                                                                   AND ([target].[Duration] = [source].[Duration])
                                                                                                                                                                                                                                                   AND ([target].[VisitId] = [source].[VisitId])
                                                                                                                                                                                                                                                   AND ([target].[AccountId] = [source].[AccountId])
                                                                                                                                                                                                                                                   AND ([target].[ContactId] = [source].[ContactId])
                                                                                                                                                                                                                                                   AND ([target].[ContactVisitIndex] = [source].[ContactVisitIndex])
                                                                                                                                                                                                                                                   AND ([target].[Value] = [source].[Value]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Views] = ([target].[Views] + [source].[Views])
        WHEN NOT MATCHED THEN INSERT ([Date], [ItemId], [Duration], [VisitId], [AccountId], [ContactId], [ContactVisitIndex], [Value], [Views]) VALUES ([source].[Date], [source].[ItemId], [source].[Duration], [source].[VisitId], [source].[AccountId], [source].[ContactId], [source].[ContactVisitIndex], [source].[Value], [source].[Views]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_SlowPages]
                SET    [Views] = ([Views] + @Views)
                WHERE  ([Date] = @Date)
                       AND ([ItemId] = @ItemId)
                       AND ([Duration] = @Duration)
                       AND ([VisitId] = @VisitId)
                       AND ([AccountId] = @AccountId)
                       AND ([ContactId] = @ContactId)
                       AND ([ContactVisitIndex] = @ContactVisitIndex)
                       AND ([Value] = @Value);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_SlowPages] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_SlowPages_Tvp]
@table [dbo].[SlowPages_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_SlowPages] WITH (HOLDLOCK)
         AS [target]
        USING @table AS [source] ON (([target].[Date] = [source].[Date])
                                     AND ([target].[ItemId] = [source].[ItemId])
                                     AND ([target].[Duration] = [source].[Duration])
                                     AND ([target].[VisitId] = [source].[VisitId])
                                     AND ([target].[AccountId] = [source].[AccountId])
                                     AND ([target].[ContactId] = [source].[ContactId])
                                     AND ([target].[ContactVisitIndex] = [source].[ContactVisitIndex])
                                     AND ([target].[Value] = [source].[Value]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Views] = ([target].[Views] + [source].[Views])
        WHEN NOT MATCHED THEN INSERT ([Date], [ItemId], [Duration], [VisitId], [AccountId], [ContactId], [ContactVisitIndex], [Value], [Views]) VALUES ([source].[Date], [source].[ItemId], [source].[Duration], [source].[VisitId], [source].[AccountId], [source].[ContactId], [source].[ContactVisitIndex], [source].[Value], [source].[Views]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_TestConversions]
@GoalId UNIQUEIDENTIFIER NULL, @TestSetId UNIQUEIDENTIFIER NULL, @TestValues BINARY (16) NULL, @Visits BIGINT NULL, @Value BIGINT NULL, @Count BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_TestConversions]
         AS [target]
        USING (VALUES (@GoalId, @TestSetId, @TestValues, @Visits, @Value, @Count)) AS [source]([GoalId], [TestSetId], [TestValues], [Visits], [Value], [Count]) ON (([target].[GoalId] = [source].[GoalId])
                                                                                                                                                                    AND ([target].[TestSetId] = [source].[TestSetId])
                                                                                                                                                                    AND ([target].[TestValues] = [source].[TestValues]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits]),
            [target].[Value]  = ([target].[Value] + [source].[Value]),
            [target].[Count]  = ([target].[Count] + [source].[Count])
        WHEN NOT MATCHED THEN INSERT ([GoalId], [TestSetId], [TestValues], [Visits], [Value], [Count]) VALUES ([source].[GoalId], [source].[TestSetId], [source].[TestValues], [source].[Visits], [source].[Value], [source].[Count]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_TestConversions]
                SET    [Visits] = ([Visits] + @Visits),
                       [Value]  = ([Value] + @Value),
                       [Count]  = ([Count] + @Count)
                WHERE  ([GoalId] = @GoalId)
                       AND ([TestSetId] = @TestSetId)
                       AND ([TestValues] = @TestValues);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_TestConversions] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_TestingCluster]
@Date SMALLDATETIME NULL, @TestId UNIQUEIDENTIFIER NULL, @ClusterId UNIQUEIDENTIFIER NULL, @FeatureName NVARCHAR (100) NULL, @FeatureValue NVARCHAR (100) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Testing_Clusters]
         AS [target]
        USING (VALUES (@Date, @TestId, @ClusterId, @FeatureName, @FeatureValue)) AS [source]([Date], [TestId], [ClusterId], [FeatureName], [FeatureValue]) ON (([target].[ClusterId] = [source].[ClusterId]
                                                                                                                                                                AND [target].[FeatureName] = [source].[FeatureName]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Date]         = [source].[Date],
            [target].[TestId]       = [source].[TestId],
            [target].[FeatureValue] = [source].[FeatureValue]
        WHEN NOT MATCHED THEN INSERT ([Date], [TestId], [ClusterId], [FeatureName], [FeatureValue]) VALUES ([source].[Date], [source].[TestId], [source].[ClusterId], [source].[FeatureName], [source].[FeatureValue]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Testing_Clusters]
                SET    [Date]         = @Date,
                       [TestId]       = @TestId,
                       [FeatureValue] = @FeatureValue
                WHERE  [ClusterId] = @ClusterId
                       AND [FeatureName] = @FeatureName;
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Testing_Clusters] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_TestingClusterMembers]
@Date SMALLDATETIME NULL, @TestId UNIQUEIDENTIFIER NULL, @ContactId UNIQUEIDENTIFIER NULL, @ClusterId UNIQUEIDENTIFIER NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Testing_ClusterMembers]
         AS [target]
        USING (VALUES (@Date, @TestId, @ContactId, @ClusterId)) AS [source]([Date], [TestId], [ContactId], [ClusterId]) ON (([target].[ContactId] = [source].[ContactId]
                                                                                                                             AND [target].[ClusterId] = [source].[ClusterId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Date]   = [source].[Date],
            [target].[TestId] = [source].[TestId]
        WHEN NOT MATCHED THEN INSERT ([Date], [TestId], [ContactId], [ClusterId]) VALUES ([source].[Date], [source].[TestId], [source].[ContactId], [source].[ClusterId]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Testing_ClusterMembers]
                SET    [Date]   = @Date,
                       [TestId] = @TestId
                WHERE  ([ContactId] = @ContactId
                        AND [ClusterId] = @ClusterId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Testing_ClusterMembers] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_TestOutcomes]
@TestSetId UNIQUEIDENTIFIER NULL, @TestOwner NVARCHAR (256) NULL, @CompletionDate DATETIME NULL, @TestScore FLOAT (53) NULL, @Effect FLOAT (53) NULL, @Guess INT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_TestOutcomes]
         AS [target]
        USING (VALUES (@TestSetId, @TestOwner, @CompletionDate, @TestScore, @Effect, @Guess)) AS [source]([TestSetId], [TestOwner], [CompletionDate], [TestScore], [Effect], [Guess]) ON (([target].[TestSetId] = [source].[TestSetId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[TestOwner]      = [source].[TestOwner],
            [target].[CompletionDate] = [source].[CompletionDate],
            [target].[TestScore]      = [source].[TestScore],
            [target].[Effect]         = [source].[Effect],
            [target].[Guess]          = [source].[Guess]
        WHEN NOT MATCHED THEN INSERT ([TestSetId], [TestOwner], [CompletionDate], [TestScore], [Effect], [Guess]) VALUES ([source].[TestSetId], [source].[TestOwner], [source].[CompletionDate], [source].[TestScore], [source].[Effect], [source].[Guess]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_TestOutcomes]
                SET    [TestOwner]      = @TestOwner,
                       [CompletionDate] = @CompletionDate,
                       [TestScore]      = @TestScore,
                       [Effect]         = @Effect,
                       [Guess]          = @Guess
                WHERE  ([TestSetId] = @TestSetId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_TestOutcomes] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_TestPageClicks]
@TestSetId UNIQUEIDENTIFIER NULL, @TestValues BINARY (16) NULL, @ItemId UNIQUEIDENTIFIER NULL, @Views BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_TestPageClicks]
         AS [target]
        USING (VALUES (@TestSetId, @TestValues, @ItemId, @Views)) AS [source]([TestSetId], [TestValues], [ItemId], [Views]) ON ([target].[TestSetId] = [source].[TestSetId])
                                                                                                                               AND ([target].[TestValues] = [source].[TestValues])
                                                                                                                               AND ([target].[ItemId] = [source].[ItemId])
        WHEN MATCHED THEN UPDATE 
        SET [target].[Views] = ([target].[Views] + [source].[Views])
        WHEN NOT MATCHED THEN INSERT ([TestSetId], [TestValues], [ItemId], [Views]) VALUES ([source].[TestSetId], [source].[TestValues], [source].[ItemId], [source].[Views]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_TestPageClicks]
                SET    [Views] = ([Views] + @Views)
                WHERE  ([TestSetId] = @TestSetId)
                       AND ([TestValues] = @TestValues)
                       AND ([ItemId] = @ItemId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_TestPageClicks] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_TestStatistics]
@TestSetId UNIQUEIDENTIFIER NULL, @Power FLOAT (53) NULL, @P FLOAT (53) NULL, @IsStatisticalRelevant BIT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_TestStatistics]
         AS [target]
        USING (VALUES (@TestSetId, @Power, @P, @IsStatisticalRelevant)) AS [source]([TestSetId], [Power], [P], [IsStatisticalRelevant]) ON (([target].[TestSetId] = [source].[TestSetId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Power]                 = [source].[Power],
            [target].[P]                     = [source].[P],
            [target].[IsStatisticalRelevant] = [source].[IsStatisticalRelevant]
        WHEN NOT MATCHED THEN INSERT ([TestSetId], [Power], [P], [IsStatisticalRelevant]) VALUES ([source].[TestSetId], [source].[Power], [source].[P], [source].[IsStatisticalRelevant]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_TestStatistics]
                SET    [Power]                 = @Power,
                       [P]                     = @P,
                       [IsStatisticalRelevant] = @IsStatisticalRelevant
                WHERE  ([TestSetId] = @TestSetId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_TestStatistics] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_Traffic]
@Date SMALLDATETIME NULL, @Checksum INT NULL, @TrafficType INT NULL, @CampaignId UNIQUEIDENTIFIER NULL, @ItemId UNIQUEIDENTIFIER NULL, @KeywordsId UNIQUEIDENTIFIER NULL, @ReferringSiteId UNIQUEIDENTIFIER NULL, @SiteNameId INT NULL, @DeviceNameId INT NULL, @LanguageId INT NULL, @FirstVisit BIT NULL, @Visits INT NULL, @Value INT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE TOP (1)
     [dbo].[Fact_Traffic]
    SET    [Visits] = ([Visits] + @Visits),
           [Value]  = ([Value] + @Value)
    WHERE  ([Date] = @Date)
           AND ([Checksum] = @Checksum)
           AND ([TrafficType] = @TrafficType)
           AND ([CampaignId] = @CampaignId)
           AND ([ItemId] = @ItemId)
           AND ([KeywordsId] = @KeywordsId)
           AND ([ReferringSiteId] = @ReferringSiteId)
           AND ([SiteNameId] = @SiteNameId)
           AND ([DeviceNameId] = @DeviceNameId)
           AND ([LanguageId] = @LanguageId)
           AND ([FirstVisit] = @FirstVisit);
    IF (@@ROWCOUNT = 0)
        BEGIN
            INSERT  INTO [dbo].[Fact_Traffic] ([Date], [Checksum], [TrafficType], [CampaignId], [ItemId], [KeywordsId], [ReferringSiteId], [SiteNameId], [DeviceNameId], [LanguageId], [FirstVisit], [Visits], [Value])
            VALUES                           (@Date, @Checksum, @TrafficType, @CampaignId, @ItemId, @KeywordsId, @ReferringSiteId, @SiteNameId, @DeviceNameId, @LanguageId, @FirstVisit, @Visits, @Value);
        END
END

GO
CREATE PROCEDURE [dbo].[Add_Traffic_Tvp]
@table [dbo].[Traffic_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE scan_table CURSOR
        FOR SELECT [Date],
                   [Checksum],
                   [TrafficType],
                   [CampaignId],
                   [ItemId],
                   [KeywordsId],
                   [ReferringSiteId],
                   [SiteNameId],
                   [DeviceNameId],
                   [LanguageId],
                   [FirstVisit],
                   [Visits],
                   [Value]
            FROM   @table;
    DECLARE @Date AS SMALLDATETIME, @Checksum AS INT, @TrafficType AS INT, @CampaignId AS UNIQUEIDENTIFIER, @ItemId AS UNIQUEIDENTIFIER, @KeywordsId AS UNIQUEIDENTIFIER, @ReferringSiteId AS UNIQUEIDENTIFIER, @SiteNameId AS INT, @DeviceNameId AS INT, @LanguageId AS INT, @FirstVisit AS BIT, @Visits AS BIGINT, @Value AS BIGINT;
    OPEN scan_table;
    FETCH NEXT FROM scan_table INTO @Date, @Checksum, @TrafficType, @CampaignId, @ItemId, @KeywordsId, @ReferringSiteId, @SiteNameId, @DeviceNameId, @LanguageId, @FirstVisit, @Visits, @Value;
    WHILE @@FETCH_STATUS = 0
        BEGIN
            EXECUTE Add_Traffic @Date = @Date, @Checksum = @Checksum, @TrafficType = @TrafficType, @CampaignId = @CampaignId, @ItemId = @ItemId, @KeywordsId = @KeywordsId, @ReferringSiteId = @ReferringSiteId, @SiteNameId = @SiteNameId, @DeviceNameId = @DeviceNameId, @LanguageId = @LanguageId, @FirstVisit = @FirstVisit, @Visits = @Visits, @Value = @Value;
            FETCH NEXT FROM scan_table INTO @Date, @Checksum, @TrafficType, @CampaignId, @ItemId, @KeywordsId, @ReferringSiteId, @SiteNameId, @DeviceNameId, @LanguageId, @FirstVisit, @Visits, @Value;
        END
    CLOSE scan_table;
    DEALLOCATE scan_table;
END

GO
CREATE PROCEDURE [dbo].[Add_ValueBySource]
@Date SMALLDATETIME NULL, @TrafficType INT NULL, @SiteNameId INT NULL, @DeviceNameId INT NULL, @LanguageId INT NULL, @FirstVisitValue BIGINT NULL, @Contacts BIGINT NULL, @Visits BIGINT NULL, @Value BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_ValueBySource]
         AS [target]
        USING (VALUES (@Date, @TrafficType, @SiteNameId, @DeviceNameId, @LanguageId, @FirstVisitValue, @Contacts, @Visits, @Value)) AS [source]([Date], [TrafficType], [SiteNameId], [DeviceNameId], [LanguageId], [FirstVisitValue], [Contacts], [Visits], [Value]) ON (([target].[Date] = [source].[Date])
                                                                                                                                                                                                                                                                         AND ([target].[TrafficType] = [source].[TrafficType])
                                                                                                                                                                                                                                                                         AND ([target].[SiteNameId] = [source].[SiteNameId])
                                                                                                                                                                                                                                                                         AND ([target].[DeviceNameId] = [source].[DeviceNameId])
                                                                                                                                                                                                                                                                         AND ([target].[LanguageId] = [source].[LanguageId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[FirstVisitValue] = ([target].[FirstVisitValue] + [source].[FirstVisitValue]),
            [target].[Contacts]        = ([target].[Contacts] + [source].[Contacts]),
            [target].[Visits]          = ([target].[Visits] + [source].[Visits]),
            [target].[Value]           = ([target].[Value] + [source].[Value])
        WHEN NOT MATCHED THEN INSERT ([Date], [TrafficType], [SiteNameId], [DeviceNameId], [LanguageId], [FirstVisitValue], [Contacts], [Visits], [Value]) VALUES ([source].[Date], [source].[TrafficType], [source].[SiteNameId], [source].[DeviceNameId], [source].[LanguageId], [source].[FirstVisitValue], [source].[Contacts], [source].[Visits], [source].[Value]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_ValueBySource]
                SET    [FirstVisitValue] = ([FirstVisitValue] + @FirstVisitValue),
                       [Contacts]        = ([Contacts] + @Contacts),
                       [Visits]          = ([Visits] + @Visits),
                       [Value]           = ([Value] + @Value)
                WHERE  ([Date] = @Date)
                       AND ([TrafficType] = @TrafficType)
                       AND ([SiteNameId] = @SiteNameId)
                       AND ([DeviceNameId] = @DeviceNameId)
                       AND ([LanguageId] = @LanguageId);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_ValueBySource] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_ValueBySource_Tvp]
@table [dbo].[ValueBySource_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_ValueBySource] WITH (HOLDLOCK)
         AS [target]
        USING @table AS [source] ON (([target].[Date] = [source].[Date])
                                     AND ([target].[TrafficType] = [source].[TrafficType])
                                     AND ([target].[SiteNameId] = [source].[SiteNameId])
                                     AND ([target].[DeviceNameId] = [source].[DeviceNameId])
                                     AND ([target].[LanguageId] = [source].[LanguageId]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[FirstVisitValue] = ([target].[FirstVisitValue] + [source].[FirstVisitValue]),
            [target].[Contacts]        = ([target].[Contacts] + [source].[Contacts]),
            [target].[Visits]          = ([target].[Visits] + [source].[Visits]),
            [target].[Value]           = ([target].[Value] + [source].[Value])
        WHEN NOT MATCHED THEN INSERT ([Date], [TrafficType], [SiteNameId], [DeviceNameId], [LanguageId], [FirstVisitValue], [Contacts], [Visits], [Value]) VALUES ([source].[Date], [source].[TrafficType], [source].[SiteNameId], [source].[DeviceNameId], [source].[LanguageId], [source].[FirstVisitValue], [source].[Contacts], [source].[Visits], [source].[Value]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_Visits]
@Date SMALLDATETIME NULL, @ItemId UNIQUEIDENTIFIER NULL, @ContactId UNIQUEIDENTIFIER NULL, @LanguageId INT NULL, @FirstVisit BIT NULL, @PagesCount BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_Visits]
         AS [target]
        USING (VALUES (@Date, @ItemId, @ContactId, @LanguageId, @FirstVisit, @PagesCount)) AS [source]([Date], [ItemId], [ContactId], [LanguageId], [FirstVisit], [PagesCount]) ON (([target].[Date] = [source].[Date])
                                                                                                                                                                                    AND ([target].[ItemId] = [source].[ItemId])
                                                                                                                                                                                    AND ([target].[ContactId] = [source].[ContactId])
                                                                                                                                                                                    AND ([target].[LanguageId] = [source].[LanguageId])
                                                                                                                                                                                    AND ([target].[FirstVisit] = [source].[FirstVisit]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[PagesCount] = ([target].[PagesCount] + [source].[PagesCount])
        WHEN NOT MATCHED THEN INSERT ([Date], [ItemId], [ContactId], [LanguageId], [FirstVisit], [PagesCount]) VALUES ([source].[Date], [source].[ItemId], [source].[ContactId], [source].[LanguageId], [source].[FirstVisit], [source].[PagesCount]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_Visits]
                SET    [PagesCount] = ([PagesCount] + @PagesCount)
                WHERE  ([Date] = @Date)
                       AND ([ItemId] = @ItemId)
                       AND ([ContactId] = @ContactId)
                       AND ([LanguageId] = @LanguageId)
                       AND ([FirstVisit] = @FirstVisit);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_Visits] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_Visits_Tvp]
@table [dbo].[Visits_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_Visits] WITH (HOLDLOCK)
         AS [target]
        USING @table AS [source] ON (([target].[Date] = [source].[Date])
                                     AND ([target].[ItemId] = [source].[ItemId])
                                     AND ([target].[ContactId] = [source].[ContactId])
                                     AND ([target].[LanguageId] = [source].[LanguageId])
                                     AND ([target].[FirstVisit] = [source].[FirstVisit]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[PagesCount] = ([target].[PagesCount] + [source].[PagesCount])
        WHEN NOT MATCHED THEN INSERT ([Date], [ItemId], [ContactId], [LanguageId], [FirstVisit], [PagesCount]) VALUES ([source].[Date], [source].[ItemId], [source].[ContactId], [source].[LanguageId], [source].[FirstVisit], [source].[PagesCount]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_VisitsByBusinessContactLocation]
@AccountId UNIQUEIDENTIFIER NULL, @BusinessUnitId UNIQUEIDENTIFIER NULL, @Date SMALLDATETIME NULL, @TrafficType INT NULL, @SiteNameId INT NULL, @DeviceNameId INT NULL, @ContactId UNIQUEIDENTIFIER NULL, @LanguageId INT NULL, @Latitude FLOAT (53) NULL, @Longitude FLOAT (53) NULL, @Visits BIGINT NULL, @Value BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_VisitsByBusinessContactLocation]
         AS [target]
        USING (VALUES (@AccountId, @BusinessUnitId, @Date, @TrafficType, @SiteNameId, @DeviceNameId, @ContactId, @LanguageId, @Latitude, @Longitude, @Visits, @Value)) AS [source]([AccountId], [BusinessUnitId], [Date], [TrafficType], [SiteNameId], [DeviceNameId], [ContactId], [LanguageId], [Latitude], [Longitude], [Visits], [Value]) ON (([target].[AccountId] = [source].[AccountId])
                                                                                                                                                                                                                                                                                                                                                  AND ([target].[BusinessUnitId] = [source].[BusinessUnitId])
                                                                                                                                                                                                                                                                                                                                                  AND ([target].[ContactId] = [source].[ContactId])
                                                                                                                                                                                                                                                                                                                                                  AND ([target].[Date] = [source].[Date])
                                                                                                                                                                                                                                                                                                                                                  AND ([target].[DeviceNameId] = [source].[DeviceNameId])
                                                                                                                                                                                                                                                                                                                                                  AND ([target].[LanguageId] = [source].[LanguageId])
                                                                                                                                                                                                                                                                                                                                                  AND ([target].[Latitude] = [source].[Latitude])
                                                                                                                                                                                                                                                                                                                                                  AND ([target].[Longitude] = [source].[Longitude])
                                                                                                                                                                                                                                                                                                                                                  AND ([target].[SiteNameId] = [source].[SiteNameId])
                                                                                                                                                                                                                                                                                                                                                  AND ([target].[TrafficType] = [source].[TrafficType]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits]),
            [target].[Value]  = ([target].[Value] + [source].[Value])
        WHEN NOT MATCHED THEN INSERT ([AccountId], [BusinessUnitId], [Date], [TrafficType], [SiteNameId], [DeviceNameId], [ContactId], [LanguageId], [Latitude], [Longitude], [Visits], [Value]) VALUES ([source].[AccountId], [source].[BusinessUnitId], [source].[Date], [source].[TrafficType], [source].[SiteNameId], [source].[DeviceNameId], [source].[ContactId], [source].[LanguageId], [source].[Latitude], [source].[Longitude], [source].[Visits], [source].[Value]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [dbo].[Fact_VisitsByBusinessContactLocation]
                SET    [Visits] = ([Visits] + @Visits),
                       [Value]  = ([Value] + @Value)
                WHERE  ([AccountId] = @AccountId)
                       AND ([BusinessUnitId] = @BusinessUnitId)
                       AND ([ContactId] = @ContactId)
                       AND ([Date] = @Date)
                       AND ([DeviceNameId] = @DeviceNameId)
                       AND ([LanguageId] = @LanguageId)
                       AND ([Latitude] = @Latitude)
                       AND ([Longitude] = @Longitude)
                       AND ([SiteNameId] = @SiteNameId)
                       AND ([TrafficType] = @TrafficType);
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to insert or update rows in the [Fact_VisitsByBusinessContactLocation] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Add_VisitsByBusinessContactLocation_Tvp]
@table [dbo].[VisitsByBusinessContactLocation_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Fact_VisitsByBusinessContactLocation]
         AS [target]
        USING @table AS [source] ON (([target].[AccountId] = [source].[AccountId])
                                     AND ([target].[BusinessUnitId] = [source].[BusinessUnitId])
                                     AND ([target].[ContactId] = [source].[ContactId])
                                     AND ([target].[Date] = [source].[Date])
                                     AND ([target].[DeviceNameId] = [source].[DeviceNameId])
                                     AND ([target].[LanguageId] = [source].[LanguageId])
                                     AND ([target].[Latitude] = [source].[Latitude])
                                     AND ([target].[Longitude] = [source].[Longitude])
                                     AND ([target].[SiteNameId] = [source].[SiteNameId])
                                     AND ([target].[TrafficType] = [source].[TrafficType]))
        WHEN MATCHED THEN UPDATE 
        SET [target].[Visits] = ([target].[Visits] + [source].[Visits]),
            [target].[Value]  = ([target].[Value] + [source].[Value])
        WHEN NOT MATCHED THEN INSERT ([AccountId], [BusinessUnitId], [Date], [TrafficType], [SiteNameId], [DeviceNameId], [ContactId], [LanguageId], [Latitude], [Longitude], [Visits], [Value]) VALUES ([source].[AccountId], [source].[BusinessUnitId], [source].[Date], [source].[TrafficType], [source].[SiteNameId], [source].[DeviceNameId], [source].[ContactId], [source].[LanguageId], [source].[Latitude], [source].[Longitude], [source].[Visits], [source].[Value]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_Asset]
@AssetId UNIQUEIDENTIFIER NULL, @Url VARCHAR (800) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT  INTO [Assets] ([AssetId], [Url])
        VALUES               (@AssetId, @Url);
    END TRY
    BEGIN CATCH
        IF (@@ERROR != 2627)
            BEGIN
                DECLARE @error_number AS INT = ERROR_NUMBER();
                DECLARE @error_severity AS INT = ERROR_SEVERITY();
                DECLARE @error_state AS INT = ERROR_STATE();
                DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
                DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
                DECLARE @error_line AS INT = ERROR_LINE();
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_Assets_Tvp]
@table [dbo].[Assets_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    MERGE INTO [Assets]
     AS [target]
    USING @table AS [source] ON ([target].[AssetId] = [source].[AssetId])
    WHEN NOT MATCHED THEN INSERT ([AssetId], [Url]) VALUES ([source].[AssetId], [source].[Url]);
END

GO
CREATE PROCEDURE [dbo].[Ensure_BusinessUnit]
@BusinessUnitId UNIQUEIDENTIFIER NULL, @AccountId UNIQUEIDENTIFIER NULL, @BusinessName NVARCHAR (100) NULL, @Country NVARCHAR (100) NULL, @Region NVARCHAR (100) NULL, @City NVARCHAR (100) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT  INTO [BusinessUnits] ([BusinessUnitId], [AccountId], [BusinessName], [Country], [Region], [City])
        VALUES                      (@BusinessUnitId, @AccountId, @BusinessName, @Country, @Region, @City);
    END TRY
    BEGIN CATCH
        IF (@@ERROR != 2627)
            BEGIN
                DECLARE @error_number AS INT = ERROR_NUMBER();
                DECLARE @error_severity AS INT = ERROR_SEVERITY();
                DECLARE @error_state AS INT = ERROR_STATE();
                DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
                DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
                DECLARE @error_line AS INT = ERROR_LINE();
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_BusinessUnits_Tvp]
@table [dbo].[BusinessUnits_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    MERGE INTO [BusinessUnits]
     AS [target]
    USING @table AS [source] ON ([target].[BusinessUnitId] = [source].[BusinessUnitId])
    WHEN NOT MATCHED THEN INSERT ([BusinessUnitId], [AccountId], [BusinessName], [Country], [Region], [City]) VALUES ([source].[BusinessUnitId], [source].[AccountId], [source].[BusinessName], [source].[Country], [source].[Region], [source].[City]);
END

GO
CREATE PROCEDURE [dbo].[Ensure_DeviceName]
@DeviceNameId INT NULL, @DeviceName NVARCHAR (450) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT  INTO [DeviceNames] ([DeviceNameId], [DeviceName])
        VALUES                    (@DeviceNameId, @DeviceName);
    END TRY
    BEGIN CATCH
        IF (@@ERROR != 2627)
            BEGIN
                DECLARE @error_number AS INT = ERROR_NUMBER();
                DECLARE @error_severity AS INT = ERROR_SEVERITY();
                DECLARE @error_state AS INT = ERROR_STATE();
                DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
                DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
                DECLARE @error_line AS INT = ERROR_LINE();
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_DeviceNames_Tvp]
@table [dbo].[DeviceNames_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    MERGE INTO [DeviceNames]
     AS [target]
    USING @table AS [source] ON ([target].[DeviceNameId] = [source].[DeviceNameId])
    WHEN NOT MATCHED THEN INSERT ([DeviceNameId], [DeviceName]) VALUES ([source].[DeviceNameId], [source].[DeviceName]);
END

GO
CREATE PROCEDURE [dbo].[Ensure_DimensionKeys]
@DimensionKeyId BIGINT NULL, @DimensionKey NVARCHAR (MAX) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [DimensionKeys]
         AS Target
        USING (VALUES (@DimensionKeyId, @DimensionKey)) AS Source(DimensionKeyId, DimensionKey) ON Target.[DimensionKeyId] = Source.[DimensionKeyId]
        WHEN NOT MATCHED THEN INSERT ([DimensionKeyId], [DimensionKey]) VALUES (Source.[DimensionKeyId], Source.[DimensionKey]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@@ERROR != 2627)
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_DimensionKeys_Tvp]
@table [dbo].[DimensionKeys_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [DimensionKeys]
         AS Target
        USING @table AS Source ON Target.[DimensionKeyId] = Source.[DimensionKeyId]
        WHEN NOT MATCHED THEN INSERT ([DimensionKeyId], [DimensionKey]) VALUES (Source.[DimensionKeyId], Source.[DimensionKey]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_FailureDetails]
@FailureDetailsId UNIQUEIDENTIFIER NULL, @Url NVARCHAR (450) NULL, @ErrorText NVARCHAR (1000) NULL, @PreviousUrl NVARCHAR (450) NULL, @DataKey NVARCHAR (450) NULL, @Data NVARCHAR (450) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT  INTO [FailureDetails] ([FailureDetailsId], [Url], [ErrorText], [PreviousUrl], [DataKey], [Data])
        VALUES                       (@FailureDetailsId, @Url, @ErrorText, @PreviousUrl, @DataKey, @Data);
    END TRY
    BEGIN CATCH
        IF (@@ERROR != 2627)
            BEGIN
                DECLARE @error_number AS INT = ERROR_NUMBER();
                DECLARE @error_severity AS INT = ERROR_SEVERITY();
                DECLARE @error_state AS INT = ERROR_STATE();
                DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
                DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
                DECLARE @error_line AS INT = ERROR_LINE();
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_FailureDetails_Tvp]
@table [dbo].[FailureDetails_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    MERGE INTO [FailureDetails]
     AS [target]
    USING @table AS [source] ON ([target].[FailureDetailsId] = [source].[FailureDetailsId])
    WHEN NOT MATCHED THEN INSERT ([FailureDetailsId], [Url], [ErrorText], [PreviousUrl], [DataKey], [Data]) VALUES ([source].[FailureDetailsId], [source].[Url], [source].[ErrorText], [source].[PreviousUrl], [source].[DataKey], [source].[Data]);
END

GO
CREATE PROCEDURE [dbo].[Ensure_Item]
@ItemId UNIQUEIDENTIFIER NULL, @Url VARCHAR (800) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT  INTO [Items] ([ItemId], [Url])
        VALUES              (@ItemId, @Url);
    END TRY
    BEGIN CATCH
        IF (@@ERROR != 2627)
            BEGIN
                DECLARE @error_number AS INT = ERROR_NUMBER();
                DECLARE @error_severity AS INT = ERROR_SEVERITY();
                DECLARE @error_state AS INT = ERROR_STATE();
                DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
                DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
                DECLARE @error_line AS INT = ERROR_LINE();
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_Items_Tvp]
@table [dbo].[Items_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    MERGE INTO [Items]
     AS [target]
    USING @table AS [source] ON ([target].[ItemId] = [source].[ItemId])
    WHEN NOT MATCHED THEN INSERT ([ItemId], [Url]) VALUES ([source].[ItemId], [source].[Url]);
END

GO
CREATE PROCEDURE [dbo].[Ensure_Keywords]
@KeywordsId UNIQUEIDENTIFIER NULL, @Keywords NVARCHAR (400) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT  INTO [Keywords] ([KeywordsId], [Keywords])
        VALUES                 (@KeywordsId, @Keywords);
    END TRY
    BEGIN CATCH
        IF (@@ERROR != 2627)
            BEGIN
                DECLARE @error_number AS INT = ERROR_NUMBER();
                DECLARE @error_severity AS INT = ERROR_SEVERITY();
                DECLARE @error_state AS INT = ERROR_STATE();
                DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
                DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
                DECLARE @error_line AS INT = ERROR_LINE();
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_Keywords_Tvp]
@table [dbo].[Keywords_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    MERGE INTO [Keywords]
     AS [target]
    USING @table AS [source] ON ([target].[KeywordsId] = [source].[KeywordsId])
    WHEN NOT MATCHED THEN INSERT ([KeywordsId], [Keywords]) VALUES ([source].[KeywordsId], [source].[Keywords]);
END

GO
CREATE PROCEDURE [dbo].[Ensure_Language]
@LanguageId INT NULL, @Name NVARCHAR (11) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT  INTO [Languages] ([LanguageId], [Name])
        VALUES                  (@LanguageId, @Name);
    END TRY
    BEGIN CATCH
        IF (@@ERROR != 2627)
            BEGIN
                DECLARE @error_number AS INT = ERROR_NUMBER();
                DECLARE @error_severity AS INT = ERROR_SEVERITY();
                DECLARE @error_state AS INT = ERROR_STATE();
                DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
                DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
                DECLARE @error_line AS INT = ERROR_LINE();
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_Languages_Tvp]
@table [dbo].[Languages_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    MERGE INTO [Languages]
     AS [target]
    USING @table AS [source] ON ([target].[LanguageId] = [source].[LanguageId])
    WHEN NOT MATCHED THEN INSERT ([LanguageId], [Name]) VALUES ([source].[LanguageId], [source].[Name]);
END

GO
CREATE PROCEDURE [dbo].[Ensure_ReferringSite]
@ReferringSiteId UNIQUEIDENTIFIER NULL, @ReferringSite NVARCHAR (400) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT  INTO [ReferringSites] ([ReferringSiteId], [ReferringSite])
        VALUES                       (@ReferringSiteId, @ReferringSite);
    END TRY
    BEGIN CATCH
        IF (@@ERROR != 2627)
            BEGIN
                DECLARE @error_number AS INT = ERROR_NUMBER();
                DECLARE @error_severity AS INT = ERROR_SEVERITY();
                DECLARE @error_state AS INT = ERROR_STATE();
                DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
                DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
                DECLARE @error_line AS INT = ERROR_LINE();
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_ReferringSites_Tvp]
@table [dbo].[ReferringSites_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    MERGE INTO [ReferringSites]
     AS [target]
    USING @table AS [source] ON ([target].[ReferringSiteId] = [source].[ReferringSiteId])
    WHEN NOT MATCHED THEN INSERT ([ReferringSiteId], [ReferringSite]) VALUES ([source].[ReferringSiteId], [source].[ReferringSite]);
END

GO
CREATE PROCEDURE [dbo].[Ensure_SegmentRecords]
@SegmentRecordId BIGINT NULL, @SegmentId UNIQUEIDENTIFIER NULL, @Date SMALLDATETIME NULL, @SiteNameId INT NULL, @DimensionKeyId BIGINT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [SegmentRecords]
         AS Target
        USING (VALUES (@SegmentRecordId, @SegmentId, @Date, @SiteNameId, @DimensionKeyId)) AS Source(SegmentRecordId, SegmentId, Date, SiteNameId, DimensionKeyId) ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@@ERROR != 2627)
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_SegmentRecords_Tvp]
@table [dbo].[SegmentRecords_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [SegmentRecords]
         AS Target
        USING @table AS Source ON Target.[SegmentRecordId] = Source.[SegmentRecordId]
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId]) VALUES (Source.[SegmentRecordId], Source.[SegmentId], Source.[Date], Source.[SiteNameId], Source.[DimensionKeyId]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@@ERROR != 2627)
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_SiteName]
@SiteNameId INT NULL, @SiteName NVARCHAR (450) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT  INTO [SiteNames] ([SiteNameId], [SiteName])
        VALUES                  (@SiteNameId, @SiteName);
    END TRY
    BEGIN CATCH
        IF (@@ERROR != 2627)
            BEGIN
                DECLARE @error_number AS INT = ERROR_NUMBER();
                DECLARE @error_severity AS INT = ERROR_SEVERITY();
                DECLARE @error_state AS INT = ERROR_STATE();
                DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
                DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
                DECLARE @error_line AS INT = ERROR_LINE();
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Ensure_SiteNames_Tvp]
@table [dbo].[SiteNames_Type] NULL READONLY
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    MERGE INTO [SiteNames]
     AS [target]
    USING @table AS [source] ON ([target].[SiteNameId] = [source].[SiteNameId])
    WHEN NOT MATCHED THEN INSERT ([SiteNameId], [SiteName]) VALUES ([source].[SiteNameId], [source].[SiteName]);
END

GO
CREATE PROCEDURE [dbo].[Get_AllTaxonEntities]
@TaxonomyId UNIQUEIDENTIFIER NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT t.Id,
               t.ParentId,
               t.TaxonomyId,
               t.Uri,
               t.Type,
               [dbo].[GetTaxonEntityChildIds](t.Id) AS ChildIds,
               t.IsDeleted
        FROM   [Taxonomy_TaxonEntity] AS t
        WHERE  t.Uri LIKE '/{' + CONVERT (NVARCHAR (50), @TaxonomyId) + '}%';
        SELECT v.TaxonId AS TaxonId,
               d.Id AS FieldId,
               d.Name AS FieldName,
               d.IsLanguageInvariant AS LanguageInvariant,
               v.LanguageCode,
               v.FieldValue
        FROM   [Taxonomy_TaxonEntityFieldDefinition] AS d
               LEFT OUTER JOIN
               [Taxonomy_TaxonEntityFieldValue] AS v
               ON d.Id = v.FieldId
        WHERE  v.TaxonId IN (SELECT Id
                             FROM   [Taxonomy_TaxonEntity]
                             WHERE  Uri LIKE '/{' + CONVERT (NVARCHAR (50), @TaxonomyId) + '}%');
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Get_MissingDailyTrees]
@StartDate DATE NULL, @EndDate DATE NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @AllDates TABLE (
        StartDate DATE);
    DECLARE @CurrentDate AS DATE;
    SET @CurrentDate = @StartDate;
    WHILE @CurrentDate < @EndDate
        BEGIN
            INSERT  INTO @AllDates
            VALUES (@CurrentDate);
            SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
        END
    SELECT   DefinitionId,
             dates.StartDate
    FROM     TreeDefinitions, @AllDates AS dates
    EXCEPT
    SELECT   DefinitionId,
             StartDate
    FROM     Trees
    WHERE    DATEDIFF(day, trees.StartDate, Trees.EndDate) = 1
    ORDER BY StartDate;
END

GO
CREATE PROCEDURE [dbo].[Get_TaxonEntity]
@Id UNIQUEIDENTIFIER NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT t.Id,
               t.ParentId,
               t.TaxonomyId,
               t.Type,
               t.Uri,
               [dbo].[GetTaxonEntityChildIds](t.Id) AS ChildIds,
               t.IsDeleted
        FROM   [Taxonomy_TaxonEntity] AS t
        WHERE  t.Id = @Id;
        SELECT v.TaxonId AS Id,
               d.Id AS FieldId,
               d.Name AS FieldName,
               d.IsLanguageInvariant AS LanguageInvariant,
               v.LanguageCode,
               v.FieldValue
        FROM   [Taxonomy_TaxonEntityFieldDefinition] AS d
               LEFT OUTER JOIN
               [Taxonomy_TaxonEntityFieldValue] AS v
               ON d.Id = v.FieldId
        WHERE  v.TaxonId = @Id;
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Get_TaxonEntityChildren]
@Id UNIQUEIDENTIFIER NULL, @TaxonomyId UNIQUEIDENTIFIER NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT t.Id,
               t.ParentId,
               t.Uri,
               [dbo].[GetTaxonEntityChildIds](t.Id) AS ChildIds,
               t.IsDeleted
        FROM   [Taxonomy_TaxonEntity] AS t
        WHERE  t.ParentId = @Id
               AND t.TaxonomyId = @TaxonomyId;
        SELECT v.TaxonId AS TaxonId,
               d.Id AS FieldId,
               d.Name AS FieldName,
               d.IsLanguageInvariant AS LanguageInvariant,
               v.LanguageCode,
               v.FieldValue
        FROM   [Taxonomy_TaxonEntityFieldDefinition] AS d
               LEFT OUTER JOIN
               [Taxonomy_TaxonEntityFieldValue] AS v
               ON d.Id = v.FieldId
        WHERE  v.TaxonId IN (SELECT Id
                             FROM   [dbo].[Taxonomy_TaxonEntity]
                             WHERE  ParentId = @Id);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Get_TaxonEntityList]
@IdList NVARCHAR (MAX) NULL, @LanguageCode NVARCHAR (10) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @position AS INT, @nextPosition AS INT, @valuelength AS INT;
        DECLARE @IdTable TABLE (
            Id UNIQUEIDENTIFIER);
        SELECT @position = 0,
               @nextPosition = 1;
        WHILE @nextPosition > 0
            BEGIN
                SELECT @nextPosition = CHARINDEX(',', @IdList, @position + 1);
                SELECT @valuelength = CASE WHEN @nextPosition > 0 THEN @nextPosition ELSE LEN(@IdList) + 1 END - @position - 1;
                INSERT  @IdTable (Id)
                VALUES          (CONVERT (UNIQUEIDENTIFIER, SUBSTRING(@IdList, @position + 1, @valuelength)));
                SELECT @position = @nextPosition;
            END
        SELECT t.Id,
               t.ParentId,
               t.TaxonomyId,
               t.Type,
               t.Uri,
               [dbo].[GetTaxonEntityChildIds](t.Id) AS ChildIds,
               t.IsDeleted
        FROM   [Taxonomy_TaxonEntity] AS t
               INNER JOIN
               @IdTable AS i
               ON t.Id = i.Id;
        SELECT v.TaxonId AS Id,
               d.Id AS FieldId,
               d.Name AS FieldName,
               d.IsLanguageInvariant AS LanguageInvariant,
               v.LanguageCode,
               v.FieldValue
        FROM   [Taxonomy_TaxonEntityFieldDefinition] AS d
               LEFT OUTER JOIN
               [Taxonomy_TaxonEntityFieldValue] AS v
               ON d.Id = v.FieldId
                  AND (v.LanguageCode = ''
                       OR v.LanguageCode = @LanguageCode)
               INNER JOIN
               @IdTable AS i
               ON v.TaxonId = i.Id;
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[ReduceMetricsTable]
@SiteNameId INT NULL, @Date SMALLDATETIME NULL, @RolledUpKeyId BIGINT NULL, @RolledUpKey NVARCHAR (MAX) NULL, @RowsToKeep INT NULL, @ExceptDimensionKey NVARCHAR (MAX) NULL, @TableName [sysname] NULL, @OrderBy NVARCHAR (MAX) NULL, @debug BIT NULL=0
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT TABLE_NAME
                   FROM   INFORMATION_SCHEMA.TABLES
                   WHERE  TABLE_NAME = @TableName)
        BEGIN
            DECLARE @errorMsg AS VARCHAR (MAX);
            SET @errorMsg = 'Invalid table name ''' + @TableName + '''';
            RAISERROR (@errorMsg, 16, 1);
            RETURN;
        END
    DECLARE @EndDate AS SMALLDATETIME;
    DECLARE @sql AS NVARCHAR (MAX);
    SET @EndDate = DATEADD(day, 1, @Date);
    IF NOT EXISTS (SELECT DimensionKeyId
                   FROM   DimensionKeys
                   WHERE  DimensionKey = @RolledUpKey)
        BEGIN
            INSERT  INTO DimensionKeys
            VALUES (@RolledUpKeyId, @RolledUpKey);
        END
    CREATE TABLE #segmentIdsTable (
        RowId     INT              IDENTITY,
        SegmentId UNIQUEIDENTIFIER
    );
    SET @sql = 'Insert into #segmentIdsTable Select distinct SegmentId from ' + QUOTENAME(@TableName);
    IF @debug = 1
        PRINT @sql;
    EXECUTE (@sql);
    DECLARE @tempTblCount AS INT = (SELECT COUNT(*)
                                    FROM   #segmentIdsTable);
    DECLARE @index AS INT = 1;
    DECLARE @SegmentId AS UNIQUEIDENTIFIER;
    DECLARE @RolledUpRecordId AS BIGINT;
    DECLARE @ColumnList AS VARCHAR (MAX);
    DECLARE @SumColumnList AS VARCHAR (MAX);
    DECLARE @mergeUpdateColumnList AS VARCHAR (MAX);
    DECLARE @sourceColumnList AS VARCHAR (MAX);
    SET @sql = 'SELECT @ColumnList = COALESCE(@ColumnList+'','' ,'''') + COLUMN_NAME,
		  @SumColumnList = COALESCE(@SumColumnList+'','' ,'''') + ''SUM(''+COLUMN_NAME+'') AS ''+COLUMN_NAME,
		  @mergeUpdateColumnList = COALESCE(@mergeUpdateColumnList+'','' ,'''') + ''[target].''+COLUMN_NAME+'' = [source].''+COLUMN_NAME+'' + [target].''+COLUMN_NAME,
		  @sourceColumnList = COALESCE(@sourceColumnList+'','' ,'''') + ''[source].''+COLUMN_NAME
		  FROM INFORMATION_SCHEMA.COLUMNS
		  where TABLE_NAME = ''' + @TableName + ''' 
		  and COLUMN_NAME not in (''SegmentRecordId'', ''SegmentId'', ''Date'', ''SiteNameId'', ''DimensionKeyId'');';
    IF @debug = 1
        PRINT @sql;
    EXECUTE sp_executesql @sql, N'@ColumnList AS Varchar(MAX) OUT,@SumColumnList AS Varchar(MAX) OUT,@mergeUpdateColumnList AS Varchar(MAX) OUT,@sourceColumnList AS Varchar(MAX) OUT', @ColumnList = @ColumnList OUTPUT, @SumColumnList = @SumColumnList OUTPUT, @mergeUpdateColumnList = @mergeUpdateColumnList OUTPUT, @sourceColumnList = @sourceColumnList OUTPUT;
    WHILE (@tempTblCount >= @index)
        BEGIN
            SET @SegmentId = (SELECT SegmentId
                              FROM   #segmentIdsTable
                              WHERE  RowId = @index);
            SELECT @RolledUpRecordId = CHECKSUM(@SegmentId, @Date, @SiteNameId);
            DECLARE @count AS INT;
            SET @sql = 'SELECT @count = COUNT(*)
		  FROM ' + QUOTENAME(@TableName) + ' WHERE SegmentId = @SegmentId
		  AND [Date] >= @Date
		  AND [Date] < @EndDate
		  AND [SiteNameId] = @SiteNameId
		  AND [SegmentRecordId] <> @RolledUpRecordId
		  AND DimensionKeyId NOT IN
		  (
			 SELECT DimensionKeyId
			 FROM DimensionKeys
			 WHERE DimensionKey LIKE @ExceptDimensionKey+''%''
		  );';
            IF @debug = 1
                PRINT @sql;
            EXECUTE sp_executesql @sql, N'@SegmentId UNIQUEIDENTIFIER,@Date SMALLDATETIME,@SiteNameId INT,@ExceptDimensionKey NVARCHAR(MAX),@EndDate SMALLDATETIME,@RolledUpRecordId BIGINT,@count INT OUT', @SegmentId = @SegmentId, @Date = @Date, @EndDate = @EndDate, @SiteNameId = @SiteNameId, @ExceptDimensionKey = @ExceptDimensionKey, @RolledUpRecordId = @RolledUpRecordId, @count = @count OUTPUT;
            IF @count <= @RowsToKeep
                BEGIN
                    SET @index = @index + 1;
                    CONTINUE;
                END
            SET @sql = 'SELECT TOP (@count - @RowsToKeep) *
		  INTO #EligibleToReduce
		  FROM ' + QUOTENAME(@TableName) + ' WHERE SegmentId = @SegmentId
			   AND [Date] >= @Date
			   AND [Date] < @EndDate
			   AND [SiteNameId] = @SiteNameId
			   AND [SegmentRecordId] <> @RolledUpRecordId
			   AND DimensionKeyId NOT IN
				    (
					   SELECT DimensionKeyId
					   FROM DimensionKeys
					   WHERE DimensionKey LIKE @ExceptDimensionKey+''%''
				    )
		  ORDER BY ' + @OrderBy + ' SELECT @RolledUpRecordId AS SegmentRecordId,
			SegmentId,
			Date,
			SiteNameId,
			@RolledUpKeyId AS DimensionKeyId,' + @SumColumnList + ' INTO #Reduced
		  FROM #EligibleToReduce
		  GROUP BY SegmentId, Date, SiteNameId;' + 'MERGE ' + QUOTENAME(@TableName) + ' AS [target]
		  USING #Reduced AS [source]
		  ON([target].[SegmentRecordId] = [source].[SegmentRecordId] -- Assumpution: @RolledUpRecordId is a hash of (SegmentId, date, siteName)
		  )
			 WHEN MATCHED
			 THEN UPDATE SET ' + @mergeUpdateColumnList + ' WHEN NOT MATCHED
			 THEN INSERT([SegmentRecordId],
					   [SegmentId],
					   [Date],
					   [SiteNameId],
					   [DimensionKeyId],' + @ColumnList + ') VALUES
		  ([source].[SegmentRecordId],
		   [source].[SegmentId],
		   [source].[Date],
		   [source].[SiteNameId],
		   [source].[DimensionKeyId],' + @sourceColumnList + ');' + 'DELETE ' + QUOTENAME(@TableName) + ' WHERE SegmentRecordId IN
		  (
			 SELECT SegmentRecordId
			 FROM #EligibleToReduce
		  );

		  DROP TABLE #Reduced;
		  DROP TABLE #EligibleToReduce;';
            IF @debug = 1
                PRINT @sql;
            EXECUTE sp_executesql @sql, N'@SegmentId UNIQUEIDENTIFIER,@Date SMALLDATETIME,@SiteNameId INT,@RolledUpRecordId BIGINT,@RolledUpKeyId BIGINT,@RowsToKeep INT,@ExceptDimensionKey NVARCHAR(MAX),@EndDate SMALLDATETIME,@count INT,@ColumnList AS VARCHAR(MAX),@SumColumnList AS VARCHAR(MAX),@mergeUpdateColumnList AS VARCHAR(MAX),@sourceColumnList AS VARCHAR(MAX)', @SegmentId = @SegmentId, @Date = @Date, @EndDate = @EndDate, @SiteNameId = @SiteNameId, @ExceptDimensionKey = @ExceptDimensionKey, @count = @count, @RolledUpRecordId = @RolledUpRecordId, @RolledUpKeyId = @RolledUpKeyId, @RowsToKeep = @RowsToKeep, @ColumnList = @ColumnList, @SumColumnList = @SumColumnList, @mergeUpdateColumnList = @mergeUpdateColumnList, @sourceColumnList = @sourceColumnList;
            SET @index = @index + 1;
        END
    DROP TABLE #segmentIdsTable;
END

GO
CREATE PROCEDURE [dbo].[ReduceSegmentMetrics]
@SiteNameId INT NULL, @SegmentId UNIQUEIDENTIFIER NULL, @OtherSegmentRecordId BIGINT NULL, @StartDate SMALLDATETIME NULL, @OtherDimensionKeyId BIGINT NULL, @OtherDimensionKey NVARCHAR (450) NULL, @VisitThreshold INT NULL=10, @ValueThreshold INT NULL=-1, @KeepCountThreshold INT NULL=1000, @DryRun BIT NULL=1, @Debug BIT NULL=0, @UnclassifiedDeviceKey NVARCHAR (450) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @EndDate AS SMALLDATETIME;
    SET @EndDate = DATEADD(day, 1, @StartDate);
    CREATE TABLE [dbo].[#tmp] (
        [PredicateOrder]        BIGINT           NULL,
        [SegmentId]             UNIQUEIDENTIFIER NOT NULL,
        [Date]                  SMALLDATETIME    NOT NULL,
        [SiteNameId]            INT              NOT NULL,
        [DimensionKeyId]        BIGINT           NOT NULL,
        [SegmentRecordId]       BIGINT           NOT NULL,
        [ContactTransitionType] TINYINT          NOT NULL,
        [Visits]                INT              NOT NULL,
        [Value]                 INT              NOT NULL,
        [Bounces]               INT              NOT NULL,
        [Conversions]           INT              NOT NULL,
        [TimeOnSite]            INT              NOT NULL,
        [Pageviews]             INT              NOT NULL,
        [Count]                 INT              NOT NULL
    ) ON [PRIMARY];
    INSERT #tmp
    SELECT ROW_NUMBER() OVER (ORDER BY sm.Visits DESC, ABS(sm.Value) DESC) AS 'PredicateOrder',
           sr.[SegmentId],
           sr.[Date],
           sr.[SiteNameId],
           sr.[DimensionKeyId],
           sm.[SegmentRecordId],
           sm.[ContactTransitionType],
           sm.[Visits],
           sm.[Value],
           sm.[Bounces],
           sm.[Conversions],
           sm.[TimeOnSite],
           sm.[Pageviews],
           sm.[Count]
    FROM   SegmentRecords AS sr
           INNER JOIN
           Fact_SegmentMetrics AS sm
           ON sr.SegmentRecordId = sm.SegmentRecordId
           INNER JOIN
           DimensionKeys AS dk
           ON dk.DimensionKeyId = sr.DimensionKeyId
    WHERE  sr.SegmentId = @SegmentId
           AND sr.[Date] >= @StartDate
           AND sr.[Date] < @EndDate
           AND sr.[SiteNameId] = @SiteNameId
           AND dk.DimensionKey NOT LIKE @UnclassifiedDeviceKey + '%';
    DECLARE @KeepCount AS INT;
    SELECT @KeepCount = MAX(PredicateOrder)
    FROM   #tmp;
    IF (@KeepCount > @KeepCountThreshold)
        SET @KeepCount = @KeepCountThreshold;
    ELSE
        BEGIN
            SELECT @KeepCount = MAX(PredicateOrder)
            FROM   #tmp
            WHERE  Visits > @VisitThreshold
                   AND ABS(Value) > @ValueThreshold;
            IF (@KeepCount IS NULL)
                SET @KeepCount = 0;
        END
    MERGE INTO [SegmentRecordsReduced]
     AS [target]
    USING (SELECT DISTINCT [SegmentRecordId],
                           [SegmentId],
                           [Date],
                           [SiteNameId],
                           [DimensionKeyId]
           FROM   #tmp
           WHERE  PredicateOrder <= @KeepCount) AS [source]([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId]) ON ([target].[SegmentRecordId] = [source].[SegmentRecordId])
    WHEN MATCHED THEN UPDATE 
    SET [target].[SegmentId]      = [source].[SegmentId],
        [target].[Date]           = [source].[Date],
        [target].[SiteNameId]     = [source].[SiteNameId],
        [target].[DimensionKeyId] = [source].[DimensionKeyId]
    WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId]) VALUES ([source].[SegmentRecordId], [source].[SegmentId], [source].[Date], [source].[SiteNameId], [source].[DimensionKeyId]);
    MERGE INTO [Fact_SegmentMetricsReduced]
     AS [target]
    USING (SELECT [SegmentRecordId],
                  [ContactTransitionType],
                  [Visits],
                  [Value],
                  [Bounces],
                  [Conversions],
                  [TimeOnSite],
                  [Pageviews],
                  [Count]
           FROM   #tmp
           WHERE  PredicateOrder <= @KeepCount) AS [source]([SegmentRecordId], [ContactTransitionType], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [Count]) ON ([target].[SegmentRecordId] = [source].[SegmentRecordId]
                                                                                                                                                                                             AND [target].[ContactTransitionType] = [source].[ContactTransitionType])
    WHEN MATCHED THEN UPDATE 
    SET [target].[Visits]      = [source].[Visits] + [target].[Visits],
        [target].[Value]       = [source].[Value] + [target].[Value],
        [target].[Bounces]     = [source].[Bounces] + [target].[Bounces],
        [target].[Conversions] = [source].[Conversions] + [target].[Conversions],
        [target].[TimeOnSite]  = [source].[TimeOnSite] + [target].[TimeOnSite],
        [target].[Pageviews]   = [source].[Pageviews] + [target].[Pageviews],
        [target].[Count]       = [source].[Count] + [target].[Count]
    WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [ContactTransitionType], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [Count]) VALUES ([source].[SegmentRecordId], [source].[ContactTransitionType], [source].[Visits], [source].[Value], [source].[Bounces], [source].[Conversions], [source].[TimeOnSite], [source].[Pageviews], [source].[Count]);
    MERGE INTO [DimensionKeys]
     AS [target]
    USING (VALUES (@OtherDimensionKeyId, @OtherDimensionKey)) AS [source]([DimensionKeyId], [DimensionKey]) ON ([target].[DimensionKeyId] = [source].[DimensionKeyId])
    WHEN NOT MATCHED THEN INSERT ([DimensionKeyId], [DimensionKey]) VALUES ([source].[DimensionKeyId], [source].[DimensionKey]);
    IF (EXISTS (SELECT *
                FROM   #tmp
                WHERE  PredicateOrder > @KeepCount))
        MERGE INTO [SegmentRecordsReduced]
         AS [target]
        USING (VALUES (@OtherSegmentRecordId, @SegmentId, @StartDate, @SiteNameId, @OtherDimensionKeyId)) AS [source]([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId]) ON ([target].[SegmentRecordId] = [source].[SegmentRecordId])
        WHEN MATCHED THEN UPDATE 
        SET [target].[SegmentId]      = [source].[SegmentId],
            [target].[Date]           = [source].[Date],
            [target].[SiteNameId]     = [source].[SiteNameId],
            [target].[DimensionKeyId] = [source].[DimensionKeyId]
        WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [SegmentId], [Date], [SiteNameId], [DimensionKeyId]) VALUES ([source].[SegmentRecordId], [source].[SegmentId], [source].[Date], [source].[SiteNameId], [source].[DimensionKeyId]);
    MERGE INTO [Fact_SegmentMetricsReduced]
     AS [target]
    USING (SELECT   @OtherSegmentRecordId AS [SegmentRecordId],
                    [ContactTransitionType],
                    SUM([Visits]) AS [Visits],
                    SUM([Value]) AS [Value],
                    SUM([Bounces]) AS [Bounces],
                    SUM([Conversions]) AS [Conversions],
                    SUM([TimeOnSite]) AS [TimeOnSite],
                    SUM([Pageviews]) AS [Pageviews],
                    SUM([Count]) AS [Count]
           FROM     #tmp
           WHERE    PredicateOrder > @KeepCount
           GROUP BY ContactTransitionType) AS [source]([SegmentRecordId], [ContactTransitionType], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [Count]) ON ([target].[SegmentRecordId] = [source].[SegmentRecordId]
                                                                                                                                                                                        AND [target].[ContactTransitionType] = [source].[ContactTransitionType])
    WHEN MATCHED THEN UPDATE 
    SET [target].[Visits]      = [source].[Visits] + [target].[Visits],
        [target].[Value]       = [source].[Value] + [target].[Value],
        [target].[Bounces]     = [source].[Bounces] + [target].[Bounces],
        [target].[Conversions] = [source].[Conversions] + [target].[Conversions],
        [target].[TimeOnSite]  = [source].[TimeOnSite] + [target].[TimeOnSite],
        [target].[Pageviews]   = [source].[Pageviews] + [target].[Pageviews],
        [target].[Count]       = [source].[Count] + [target].[Count]
    WHEN NOT MATCHED THEN INSERT ([SegmentRecordId], [ContactTransitionType], [Visits], [Value], [Bounces], [Conversions], [TimeOnSite], [Pageviews], [Count]) VALUES ([source].[SegmentRecordId], [source].[ContactTransitionType], [source].[Visits], [source].[Value], [source].[Bounces], [source].[Conversions], [source].[TimeOnSite], [source].[Pageviews], [source].[Count]);
    IF @Debug = 1
        BEGIN
            SELECT *
            FROM   Fact_SegmentMetrics
                   INNER JOIN
                   SegmentRecords
                   ON Fact_SegmentMetrics.SegmentRecordId = SegmentRecords.SegmentRecordId
            WHERE  Fact_SegmentMetrics.SegmentRecordId IN (SELECT SegmentRecordId
                                                           FROM   #tmp);
        END
    IF @DryRun = 0
        BEGIN
            PRINT N'Deleting source records.';
            DELETE Fact_SegmentMetrics
            WHERE  SegmentRecordId IN (SELECT SegmentRecordId
                                       FROM   #tmp);
            DELETE SegmentRecords
            WHERE  SegmentRecordId IN (SELECT SegmentRecordId
                                       FROM   #tmp);
        END
    ELSE
        BEGIN
            PRINT N'Executed in dry run mode.';
        END
    DROP TABLE #tmp;
END

GO
CREATE PROCEDURE [dbo].[Register_AutomationStates]
@AutomationStateId UNIQUEIDENTIFIER NULL, @SeqNumber INT NULL, @Processed SMALLDATETIME NULL=NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    IF (@Processed IS NULL)
        BEGIN
            SET @Processed = GETUTCDATE();
        END
    INSERT  INTO [Trail_AutomationStates] ([AutomationStateId], [SeqNumber], [Processed])
    VALUES                               (@AutomationStateId, @SeqNumber, @Processed);
END

GO
CREATE PROCEDURE [dbo].[Register_Interaction]
@Id VARBINARY (128) NULL, @Processed SMALLDATETIME NULL=NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    IF (@Processed IS NULL)
        BEGIN
            SET @Processed = GETUTCDATE();
        END
    INSERT  INTO [Trail_Interactions] ([Id], [Processed])
    VALUES                           (@Id, @Processed);
END

GO
CREATE PROCEDURE [dbo].[Upsert_Account]
@AccountId UNIQUEIDENTIFIER NULL, @BusinessName NVARCHAR (100) NULL, @Country NVARCHAR (100) NULL, @Classification INT NULL, @IntegrationId UNIQUEIDENTIFIER NULL, @IntegrationLabel NVARCHAR (100) NULL, @ExternalUser NVARCHAR (256) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1
               FROM   [Accounts]
               WHERE  ([AccountId] = @AccountId))
        BEGIN
            IF NOT EXISTS (SELECT 1
                           FROM   [Accounts]
                           WHERE  ([AccountId] = @AccountId)
                                  AND ([BusinessName] = @BusinessName)
                                  AND ([Country] = @Country)
                                  AND ([Classification] = @Classification)
                                  AND ([IntegrationId] = @IntegrationId
                                       OR ([IntegrationId] IS NULL
                                           AND @IntegrationId IS NULL))
                                  AND ([IntegrationLabel] = @IntegrationLabel
                                       OR ([IntegrationLabel] IS NULL
                                           AND @IntegrationLabel IS NULL))
                                  AND ([ExternalUser] = @ExternalUser
                                       OR ([ExternalUser] IS NULL
                                           AND @ExternalUser IS NULL)))
                BEGIN
                    UPDATE [Accounts]
                    SET    [BusinessName]     = @BusinessName,
                           [Country]          = @Country,
                           [Classification]   = @Classification,
                           [IntegrationId]    = @IntegrationId,
                           [IntegrationLabel] = @IntegrationLabel,
                           [ExternalUser]     = @ExternalUser
                    WHERE  ([AccountId] = @AccountId);
                END
        END
    ELSE
        BEGIN
            BEGIN TRY
                INSERT  INTO [Accounts] ([AccountId], [BusinessName], [Country], [Classification], [IntegrationId], [IntegrationLabel], [ExternalUser])
                VALUES                 (@AccountId, @BusinessName, @Country, @Classification, @IntegrationId, @IntegrationLabel, @ExternalUser);
            END TRY
            BEGIN CATCH
                DECLARE @error_number AS INT = ERROR_NUMBER();
                DECLARE @error_severity AS INT = ERROR_SEVERITY();
                DECLARE @error_state AS INT = ERROR_STATE();
                DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
                DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
                DECLARE @error_line AS INT = ERROR_LINE();
                IF (@error_number = 2627)
                    BEGIN
                        IF NOT EXISTS (SELECT 1
                                       FROM   [Accounts]
                                       WHERE  ([AccountId] = @AccountId)
                                              AND ([BusinessName] = @BusinessName)
                                              AND ([Country] = @Country)
                                              AND ([Classification] = @Classification)
                                              AND ([IntegrationId] = @IntegrationId
                                                   OR ([IntegrationId] IS NULL
                                                       AND @IntegrationId IS NULL))
                                              AND ([IntegrationLabel] = @IntegrationLabel
                                                   OR ([IntegrationLabel] IS NULL
                                                       AND @IntegrationLabel IS NULL))
                                              AND ([ExternalUser] = @ExternalUser
                                                   OR ([ExternalUser] IS NULL
                                                       AND @ExternalUser IS NULL)))
                            BEGIN
                                UPDATE [Accounts]
                                SET    [BusinessName]     = @BusinessName,
                                       [Country]          = @Country,
                                       [Classification]   = @Classification,
                                       [IntegrationId]    = @IntegrationId,
                                       [IntegrationLabel] = @IntegrationLabel,
                                       [ExternalUser]     = @ExternalUser
                                WHERE  ([AccountId] = @AccountId);
                                IF (@@ROWCOUNT != 1)
                                    BEGIN
                                        RAISERROR ('Failed to update row in the [Accounts] table.', 18, 1)
                                            WITH NOWAIT;
                                    END
                            END
                    END
                ELSE
                    BEGIN
                        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                            WITH NOWAIT;
                    END
            END CATCH
        END
END

GO
CREATE PROCEDURE [dbo].[Upsert_Contact]
@ContactId UNIQUEIDENTIFIER NULL, @AuthenticationLevel INT NULL, @Classification INT NULL, @ContactTags XML NULL, @IntegrationLevel INT NULL, @ExternalUser NVARCHAR (100) NULL, @OverrideClassification INT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        MERGE INTO [Contacts]
         AS [target]
        USING (VALUES (@ContactId, @AuthenticationLevel, @Classification, @ContactTags, @IntegrationLevel, @ExternalUser, @OverrideClassification)) AS [source]([ContactId], [AuthenticationLevel], [Classification], [ContactTags], [IntegrationLevel], [ExternalUser], [OverrideClassification]) ON ([target].[ContactId] = [source].[ContactId])
        WHEN MATCHED THEN UPDATE 
        SET [target].[AuthenticationLevel]    = [source].[AuthenticationLevel],
            [target].[Classification]         = [source].[Classification],
            [target].[ContactTags]            = [source].[ContactTags],
            [target].[IntegrationLevel]       = [source].[IntegrationLevel],
            [target].[ExternalUser]           = [source].[ExternalUser],
            [target].[OverrideClassification] = [source].[OverrideClassification]
        WHEN NOT MATCHED THEN INSERT ([ContactId], [AuthenticationLevel], [Classification], [ContactTags], [IntegrationLevel], [ExternalUser], [OverrideClassification]) VALUES ([source].[ContactId], [source].[AuthenticationLevel], [source].[Classification], [source].[ContactTags], [source].[IntegrationLevel], [source].[ExternalUser], [source].[OverrideClassification]);
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        IF (@error_number = 2627)
            BEGIN
                UPDATE [Contacts]
                SET    [AuthenticationLevel]    = @AuthenticationLevel,
                       [Classification]         = @Classification,
                       [ContactTags]            = @ContactTags,
                       [IntegrationLevel]       = @IntegrationLevel,
                       [ExternalUser]           = @ExternalUser,
                       [OverrideClassification] = @OverrideClassification
                WHERE  (([ContactId] = @ContactId));
                IF (@@ROWCOUNT != 1)
                    BEGIN
                        RAISERROR ('Failed to update row in the [Contacts] table.', 18, 1)
                            WITH NOWAIT;
                    END
            END
        ELSE
            BEGIN
                RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
                    WITH NOWAIT;
            END
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Upsert_TaxonEntities]
@EntitiesXml XML NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @entities TABLE (
            Id         UNIQUEIDENTIFIER NOT NULL,
            ParentId   UNIQUEIDENTIFIER,
            TaxonomyId UNIQUEIDENTIFIER NOT NULL,
            [Type]     NVARCHAR (255)   NOT NULL,
            Uri        NVARCHAR (MAX)   NOT NULL PRIMARY KEY (Id));
        INSERT INTO @entities (Id, ParentId, TaxonomyId, [Type], Uri)
        SELECT CONVERT (UNIQUEIDENTIFIER, e.value('@id', 'NVARCHAR(50)')),
               CASE WHEN e.exist('@parentId') = 1 THEN CONVERT (UNIQUEIDENTIFIER, e.value('@parentId', 'NVARCHAR(50)')) ELSE NULL END,
               CONVERT (UNIQUEIDENTIFIER, e.value('@taxonomyId', 'NVARCHAR(50)')),
               e.value('@type', 'NVARCHAR(255)'),
               e.value('@uri', 'NVARCHAR(MAX)')
        FROM   @EntitiesXml.nodes('/entities/entity') AS T(e);
        INSERT INTO [Taxonomy_TaxonEntity] (Id, ParentId, TaxonomyId, [Type], Uri, IsDeleted)
        SELECT e.Id,
               e.ParentId,
               e.TaxonomyId,
               e.[Type],
               e.Uri,
               0
        FROM   @entities AS e
               LEFT OUTER JOIN
               [Taxonomy_TaxonEntity] AS te
               ON te.Id = e.Id
        WHERE  te.Id IS NULL;
        UPDATE [Taxonomy_TaxonEntity]
        SET    ParentId   = e.ParentId,
               TaxonomyId = e.TaxonomyId,
               [Type]     = e.[Type],
               Uri        = e.Uri,
               IsDeleted  = 0
        FROM   [Taxonomy_TaxonEntity] AS te
               INNER JOIN
               @entities AS e
               ON te.Id = e.Id;
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Upsert_TaxonEntity]
@Id UNIQUEIDENTIFIER NULL, @ParentId UNIQUEIDENTIFIER NULL, @TaxonomyId UNIQUEIDENTIFIER NULL, @Type NVARCHAR (255) NULL, @Uri NVARCHAR (MAX) NULL, @IsDeleted BIT NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1
                   FROM   [Taxonomy_TaxonEntity]
                   WHERE  [Id] = @Id)
            BEGIN
                UPDATE [Taxonomy_TaxonEntity]
                SET    [ParentId]   = @ParentId,
                       [TaxonomyId] = @TaxonomyId,
                       [Type]       = @Type,
                       [Uri]        = @Uri,
                       [IsDeleted]  = @IsDeleted
                WHERE  [Id] = @Id;
            END
        ELSE
            BEGIN
                INSERT  INTO [Taxonomy_TaxonEntity] ([Id], [ParentId], [TaxonomyId], [Type], [Uri], [IsDeleted])
                VALUES                             (@Id, @ParentId, @TaxonomyId, @Type, @Uri, @IsDeleted);
            END
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Upsert_TaxonEntityField]
@TaxonId UNIQUEIDENTIFIER NULL, @Id UNIQUEIDENTIFIER NULL, @FieldName NVARCHAR (255) NULL, @LanguageCode NVARCHAR (10) NULL, @IsLanguageInvariant BIT NULL, @Value NVARCHAR (MAX) NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1
                   FROM   [Taxonomy_TaxonEntityFieldDefinition]
                   WHERE  Id = @Id)
            BEGIN
                UPDATE [Taxonomy_TaxonEntityFieldDefinition]
                SET    Name                = @FieldName,
                       IsLanguageInvariant = @IsLanguageInvariant
                WHERE  Id = @Id;
            END
        ELSE
            BEGIN
                INSERT  INTO [Taxonomy_TaxonEntityFieldDefinition] (Id, Name, IsLanguageInvariant)
                VALUES                                            (@Id, @FieldName, @IsLanguageInvariant);
            END
        IF EXISTS (SELECT 1
                   FROM   [Taxonomy_TaxonEntityFieldValue]
                   WHERE  [TaxonId] = @TaxonId
                          AND [FieldId] = @Id
                          AND [LanguageCode] = @LanguageCode)
            BEGIN
                UPDATE [Taxonomy_TaxonEntityFieldValue]
                SET    [FieldValue] = @Value
                WHERE  [TaxonId] = @TaxonId
                       AND [FieldId] = @Id
                       AND [LanguageCode] = @LanguageCode;
            END
        ELSE
            BEGIN
                INSERT  INTO [Taxonomy_TaxonEntityFieldValue] ([TaxonId], [FieldId], [LanguageCode], [FieldValue])
                VALUES                                       (@TaxonId, @Id, @LanguageCode, @Value);
            END
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE PROCEDURE [dbo].[Upsert_TaxonEntityFields]
@EntityFieldsXml XML NULL
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @entityFieldDefs TABLE (
            Id                  UNIQUEIDENTIFIER NOT NULL,
            Name                NVARCHAR (255)   NOT NULL,
            IsLanguageInvariant BIT              NOT NULL,
            PRIMARY KEY (Id));
        DECLARE @entityFieldValues TABLE (
            TaxonId      UNIQUEIDENTIFIER NOT NULL,
            FieldId      UNIQUEIDENTIFIER,
            LanguageCode NVARCHAR (10)    NOT NULL,
            FieldValue   NVARCHAR (MAX)   NOT NULL,
            PRIMARY KEY (TaxonId, FieldId, LanguageCode));
        INSERT INTO @entityFieldDefs (Id, Name, IsLanguageInvariant)
        SELECT fieldDefs.Id,
               fieldDefs.Name,
               fieldDefs.IsLanguageInvariant
        FROM   (SELECT allFieldInstances.*,
                       ROW_NUMBER() OVER (PARTITION BY Id ORDER BY Id ASC) AS Position
                FROM   (SELECT CONVERT (UNIQUEIDENTIFIER, f.value('@id', 'NVARCHAR(50)')) AS Id,
                               f.value('@name', 'NVARCHAR(255)') AS Name,
                               f.value('@isLanguageInvariant', 'bit') AS IsLanguageInvariant
                        FROM   @EntityFieldsXml.nodes('/entityFields/entityField') AS T(f)) AS [allFieldInstances]) AS [fieldDefs]
        WHERE  Position = 1;
        INSERT INTO @entityFieldValues (TaxonId, FieldId, LanguageCode, FieldValue)
        SELECT fieldValues.TaxonId,
               fieldValues.FieldId,
               fieldValues.LanguageCode,
               fieldValues.FieldValue
        FROM   (SELECT allFieldValues.*,
                       ROW_NUMBER() OVER (PARTITION BY TaxonId, FieldId, LanguageCode ORDER BY TaxonId) AS Position
                FROM   (SELECT CONVERT (UNIQUEIDENTIFIER, f.value('@taxonId', 'NVARCHAR(50)')) AS TaxonId,
                               CONVERT (UNIQUEIDENTIFIER, f.value('@id', 'NVARCHAR(50)')) AS FieldId,
                               f.value('@languageCode', 'NVARCHAR(255)') AS LanguageCode,
                               f.value('@value', 'NVARCHAR(255)') AS FieldValue
                        FROM   @EntityFieldsXml.nodes('/entityFields/entityField') AS T(f)) AS [allFieldValues]) AS [fieldValues]
        WHERE  Position = 1;
        INSERT INTO [Taxonomy_TaxonEntityFieldDefinition] (Id, Name, IsLanguageInvariant)
        SELECT efd.Id,
               efd.Name,
               efd.IsLanguageInvariant
        FROM   @entityFieldDefs AS efd
               LEFT OUTER JOIN
               [Taxonomy_TaxonEntityFieldDefinition] AS fd
               ON fd.Id = efd.Id
        WHERE  fd.Id IS NULL;
        UPDATE [Taxonomy_TaxonEntityFieldDefinition]
        SET    Id                  = efd.Id,
               Name                = efd.Name,
               IsLanguageInvariant = efd.IsLanguageInvariant
        FROM   [Taxonomy_TaxonEntityFieldDefinition] AS fd
               INNER JOIN
               @entityFieldDefs AS efd
               ON fd.Id = efd.Id;
        INSERT INTO [Taxonomy_TaxonEntityFieldValue] (TaxonId, FieldId, LanguageCode, FieldValue)
        SELECT efv.TaxonId,
               efv.FieldId,
               efv.LanguageCode,
               efv.FieldValue
        FROM   @entityFieldValues AS efv
               LEFT OUTER JOIN
               [Taxonomy_TaxonEntityFieldValue] AS fv
               ON fv.TaxonId = efv.TaxonId
                  AND fv.FieldId = efv.FieldId
                  AND fv.LanguageCode = efv.LanguageCode
        WHERE  fv.TaxonId IS NULL;
        UPDATE [Taxonomy_TaxonEntityFieldValue]
        SET    FieldValue = efv.FieldValue
        FROM   @entityFieldValues AS efv
               INNER JOIN
               [Taxonomy_TaxonEntityFieldValue] AS fv
               ON fv.TaxonId = efv.TaxonId
                  AND fv.FieldId = efv.FieldId
                  AND fv.LanguageCode = efv.LanguageCode;
    END TRY
    BEGIN CATCH
        DECLARE @error_number AS INT = ERROR_NUMBER();
        DECLARE @error_severity AS INT = ERROR_SEVERITY();
        DECLARE @error_state AS INT = ERROR_STATE();
        DECLARE @error_message AS NVARCHAR (4000) = ERROR_MESSAGE();
        DECLARE @error_procedure AS SYSNAME = ERROR_PROCEDURE();
        DECLARE @error_line AS INT = ERROR_LINE();
        RAISERROR (N'T-SQL ERROR %d, SEVERITY %d, STATE %d, PROCEDURE %s, LINE %d, MESSAGE: %s', @error_severity, 1, @error_number, @error_severity, @error_state, @error_procedure, @error_line, @error_message)
            WITH NOWAIT;
    END CATCH
END

GO
CREATE TYPE [dbo].[ArrayOfGuids] AS TABLE (
    [Id] UNIQUEIDENTIFIER NULL);

GO
CREATE TYPE [dbo].[ArrayOfRanges] AS TABLE (
    [StartDate] DATE NULL,
    [EndDate]   DATE NULL);

GO
CREATE TYPE [dbo].[Assets_Type] AS TABLE (
    [AssetId] UNIQUEIDENTIFIER NOT NULL,
    [Url]     VARCHAR (800)    NOT NULL,
    PRIMARY KEY CLUSTERED ([AssetId] ASC));

GO
CREATE TYPE [dbo].[BusinessUnits_Type] AS TABLE (
    [BusinessUnitId] UNIQUEIDENTIFIER NOT NULL,
    [AccountId]      UNIQUEIDENTIFIER NOT NULL,
    [BusinessName]   NVARCHAR (100)   NULL,
    [Country]        NVARCHAR (100)   NULL,
    [Region]         NVARCHAR (100)   NULL,
    [City]           NVARCHAR (100)   NULL,
    PRIMARY KEY CLUSTERED ([BusinessUnitId] ASC));

GO
CREATE TYPE [dbo].[CampaignMetrics_Type] AS TABLE (
    [SegmentRecordId] BIGINT           NOT NULL,
    [SegmentId]       UNIQUEIDENTIFIER NOT NULL,
    [Date]            SMALLDATETIME    NOT NULL,
    [SiteNameId]      INT              NOT NULL,
    [DimensionKeyId]  BIGINT           NOT NULL,
    [Visits]          INT              NOT NULL,
    [Value]           INT              NOT NULL,
    [MonetaryValue]   MONEY            NOT NULL,
    [Bounces]         INT              NOT NULL,
    [Conversions]     INT              NOT NULL,
    [Pageviews]       INT              NOT NULL,
    [TimeOnSite]      INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[ChannelMetrics_Type] AS TABLE (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[Conversions_Type] AS TABLE (
    [Date]         SMALLDATETIME    NOT NULL,
    [TrafficType]  INT              NOT NULL,
    [ContactId]    UNIQUEIDENTIFIER NOT NULL,
    [CampaignId]   UNIQUEIDENTIFIER NOT NULL,
    [GoalId]       UNIQUEIDENTIFIER NOT NULL,
    [SiteNameId]   INT              NOT NULL,
    [DeviceNameId] INT              NOT NULL,
    [LanguageId]   INT              NOT NULL,
    [AccountId]    UNIQUEIDENTIFIER NOT NULL,
    [ItemId]       UNIQUEIDENTIFIER NOT NULL,
    [GoalPoints]   BIGINT           NOT NULL,
    [Visits]       BIGINT           NOT NULL,
    [Value]        BIGINT           NOT NULL,
    [Count]        BIGINT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Date] ASC, [TrafficType] ASC, [ContactId] ASC, [CampaignId] ASC, [GoalId] ASC, [SiteNameId] ASC, [DeviceNameId] ASC, [LanguageId] ASC, [AccountId] ASC, [ItemId] ASC, [GoalPoints] ASC));

GO
CREATE TYPE [dbo].[ConversionsMetrics_Type] AS TABLE (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[DeviceMetrics_Type] AS TABLE (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[DeviceNames_Type] AS TABLE (
    [DeviceNameId] INT            NOT NULL,
    [DeviceName]   NVARCHAR (100) NOT NULL,
    PRIMARY KEY CLUSTERED ([DeviceNameId] ASC));

GO
CREATE TYPE [dbo].[DimensionKeys_Type] AS TABLE (
    [DimensionKeyId] BIGINT         NOT NULL,
    [DimensionKey]   NVARCHAR (MAX) NOT NULL,
    PRIMARY KEY CLUSTERED ([DimensionKeyId] ASC));

GO
CREATE TYPE [dbo].[DownloadEventMetrics_Type] AS TABLE (
    [SegmentRecordId] BIGINT           NOT NULL,
    [SegmentId]       UNIQUEIDENTIFIER NOT NULL,
    [Date]            SMALLDATETIME    NOT NULL,
    [SiteNameId]      INT              NOT NULL,
    [DimensionKeyId]  BIGINT           NOT NULL,
    [Visits]          INT              NOT NULL,
    [Value]           INT              NOT NULL,
    [Count]           INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[Downloads_Type] AS TABLE (
    [Date]         SMALLDATETIME    NOT NULL,
    [TrafficType]  INT              NOT NULL,
    [CampaignId]   UNIQUEIDENTIFIER NOT NULL,
    [SiteNameId]   INT              NOT NULL,
    [DeviceNameId] INT              NOT NULL,
    [LanguageId]   INT              NOT NULL,
    [AccountId]    UNIQUEIDENTIFIER NOT NULL,
    [ItemId]       UNIQUEIDENTIFIER NOT NULL,
    [AssetId]      UNIQUEIDENTIFIER NOT NULL,
    [Visits]       BIGINT           NOT NULL,
    [Value]        BIGINT           NOT NULL,
    [Count]        BIGINT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Date] ASC, [TrafficType] ASC, [CampaignId] ASC, [SiteNameId] ASC, [DeviceNameId] ASC, [LanguageId] ASC, [AccountId] ASC, [ItemId] ASC, [AssetId] ASC));

GO
CREATE TYPE [dbo].[FailureDetails_Type] AS TABLE (
    [FailureDetailsId] UNIQUEIDENTIFIER NOT NULL,
    [Url]              NVARCHAR (450)   NOT NULL,
    [ErrorText]        NVARCHAR (1000)  NULL,
    [PreviousUrl]      NVARCHAR (450)   NULL,
    [DataKey]          NVARCHAR (4000)  NULL,
    [Data]             NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([FailureDetailsId] ASC));

GO
CREATE TYPE [dbo].[Failures_Type] AS TABLE (
    [VisitId]               UNIQUEIDENTIFIER NOT NULL,
    [AccountId]             UNIQUEIDENTIFIER NOT NULL,
    [Date]                  SMALLDATETIME    NOT NULL,
    [ContactId]             UNIQUEIDENTIFIER NOT NULL,
    [PageEventDefinitionId] UNIQUEIDENTIFIER NOT NULL,
    [KeywordsId]            UNIQUEIDENTIFIER NOT NULL,
    [ReferringSiteId]       UNIQUEIDENTIFIER NOT NULL,
    [ContactVisitIndex]     INT              NOT NULL,
    [VisitPageIndex]        INT              NOT NULL,
    [FailureDetailsId]      UNIQUEIDENTIFIER NOT NULL,
    [Value]                 BIGINT           NOT NULL,
    [Count]                 BIGINT           NOT NULL,
    PRIMARY KEY CLUSTERED ([VisitId] ASC, [AccountId] ASC, [Date] ASC, [ContactId] ASC, [PageEventDefinitionId] ASC, [KeywordsId] ASC, [ReferringSiteId] ASC, [ContactVisitIndex] ASC, [VisitPageIndex] ASC, [FailureDetailsId] ASC));

GO
CREATE TYPE [dbo].[FollowHits_Type] AS TABLE (
    [Date]       SMALLDATETIME    NOT NULL,
    [ItemId]     UNIQUEIDENTIFIER NOT NULL,
    [KeywordsId] UNIQUEIDENTIFIER NOT NULL,
    [Visits]     BIGINT           NOT NULL,
    [Value]      BIGINT           NOT NULL,
    [Count]      BIGINT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Date] ASC, [ItemId] ASC, [KeywordsId] ASC));

GO
CREATE TYPE [dbo].[GeoMetrics_Type] AS TABLE (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[GoalMetrics_Type] AS TABLE (
    [SegmentRecordId] BIGINT           NOT NULL,
    [SegmentId]       UNIQUEIDENTIFIER NOT NULL,
    [Date]            SMALLDATETIME    NOT NULL,
    [SiteNameId]      INT              NOT NULL,
    [DimensionKeyId]  BIGINT           NOT NULL,
    [Visits]          INT              NOT NULL,
    [Value]           INT              NOT NULL,
    [Count]           INT              NOT NULL,
    [Conversions]     INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[InteractionTrailEntry] AS TABLE (
    [Id]        VARBINARY (128) NOT NULL,
    [Processed] SMALLDATETIME   NOT NULL,
    PRIMARY KEY NONCLUSTERED ([Id] ASC));

GO
CREATE TYPE [dbo].[Items_Type] AS TABLE (
    [ItemId] UNIQUEIDENTIFIER NOT NULL,
    [Url]    VARCHAR (800)    NOT NULL,
    PRIMARY KEY CLUSTERED ([ItemId] ASC));

GO
CREATE TYPE [dbo].[Keywords_Type] AS TABLE (
    [KeywordsId] UNIQUEIDENTIFIER NOT NULL,
    [Keywords]   NVARCHAR (400)   NOT NULL,
    PRIMARY KEY CLUSTERED ([KeywordsId] ASC));

GO
CREATE TYPE [dbo].[LanguageMetrics_Type] AS TABLE (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[Languages_Type] AS TABLE (
    [LanguageId] INT          NOT NULL,
    [Name]       VARCHAR (11) NOT NULL,
    PRIMARY KEY CLUSTERED ([LanguageId] ASC));

GO
CREATE TYPE [dbo].[OutcomeMetrics_Type] AS TABLE (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[PageMetrics_Type] AS TABLE (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [TimeOnPage]         INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[PageViewsMetrics_Type] AS TABLE (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[PatternMetrics_Type] AS TABLE (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[ReferringSiteMetrics_Type] AS TABLE (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Pageviews]          INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[ReferringSites_Type] AS TABLE (
    [ReferringSiteId] UNIQUEIDENTIFIER NOT NULL,
    [ReferringSite]   NVARCHAR (450)   NOT NULL,
    PRIMARY KEY CLUSTERED ([ReferringSiteId] ASC));

GO
CREATE TYPE [dbo].[SearchMetrics_Type] AS TABLE (
    [SegmentRecordId]    BIGINT           NOT NULL,
    [SegmentId]          UNIQUEIDENTIFIER NOT NULL,
    [Date]               SMALLDATETIME    NOT NULL,
    [SiteNameId]         INT              NOT NULL,
    [DimensionKeyId]     BIGINT           NOT NULL,
    [Visits]             INT              NOT NULL,
    [Value]              INT              NOT NULL,
    [Bounces]            INT              NOT NULL,
    [Conversions]        INT              NOT NULL,
    [TimeOnSite]         INT              NOT NULL,
    [Count]              INT              NOT NULL,
    [MonetaryValue]      MONEY            NOT NULL,
    [OutcomeOccurrences] INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[SegmentMetrics_Type] AS TABLE (
    [SegmentRecordId]       BIGINT  NOT NULL,
    [ContactTransitionType] TINYINT NOT NULL,
    [Visits]                INT     NOT NULL,
    [Value]                 INT     NOT NULL,
    [Bounces]               INT     NOT NULL,
    [Conversions]           INT     NOT NULL,
    [TimeOnSite]            INT     NOT NULL,
    [Pageviews]             INT     NOT NULL,
    [Count]                 INT     NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC, [ContactTransitionType] ASC));

GO
CREATE TYPE [dbo].[SegmentRecords_Type] AS TABLE (
    [SegmentRecordId] BIGINT           NOT NULL,
    [SegmentId]       UNIQUEIDENTIFIER NOT NULL,
    [Date]            SMALLDATETIME    NOT NULL,
    [SiteNameId]      INT              NOT NULL,
    [DimensionKeyId]  BIGINT           NOT NULL,
    PRIMARY KEY CLUSTERED ([SegmentRecordId] ASC));

GO
CREATE TYPE [dbo].[SiteNames_Type] AS TABLE (
    [SiteNameId] INT            NOT NULL,
    [SiteName]   NVARCHAR (450) NOT NULL,
    PRIMARY KEY CLUSTERED ([SiteNameId] ASC));

GO
CREATE TYPE [dbo].[SiteSearches_Type] AS TABLE (
    [Date]         SMALLDATETIME    NOT NULL,
    [TrafficType]  INT              NOT NULL,
    [CampaignId]   UNIQUEIDENTIFIER NOT NULL,
    [ItemId]       UNIQUEIDENTIFIER NOT NULL,
    [SiteNameId]   INT              NOT NULL,
    [DeviceNameId] INT              NOT NULL,
    [LanguageId]   INT              NOT NULL,
    [AccountId]    UNIQUEIDENTIFIER NOT NULL,
    [KeywordsId]   UNIQUEIDENTIFIER NOT NULL,
    [Visits]       BIGINT           NOT NULL,
    [Value]        BIGINT           NOT NULL,
    [Count]        BIGINT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Date] ASC, [TrafficType] ASC, [CampaignId] ASC, [ItemId] ASC, [SiteNameId] ASC, [DeviceNameId] ASC, [LanguageId] ASC, [AccountId] ASC, [KeywordsId] ASC));

GO
CREATE TYPE [dbo].[SlowPages_Type] AS TABLE (
    [Date]              SMALLDATETIME    NOT NULL,
    [ItemId]            UNIQUEIDENTIFIER NOT NULL,
    [Duration]          INT              NOT NULL,
    [VisitId]           UNIQUEIDENTIFIER NOT NULL,
    [AccountId]         UNIQUEIDENTIFIER NOT NULL,
    [ContactId]         UNIQUEIDENTIFIER NOT NULL,
    [ContactVisitIndex] INT              NOT NULL,
    [Value]             INT              NOT NULL,
    [Views]             BIGINT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Date] ASC, [ItemId] ASC, [Duration] ASC, [VisitId] ASC, [AccountId] ASC, [ContactId] ASC, [ContactVisitIndex] ASC, [Value] ASC));

GO
CREATE TYPE [dbo].[Traffic_Type] AS TABLE (
    [Date]            SMALLDATETIME    NOT NULL,
    [Checksum]        INT              NOT NULL,
    [TrafficType]     INT              NOT NULL,
    [CampaignId]      UNIQUEIDENTIFIER NULL,
    [ItemId]          UNIQUEIDENTIFIER NOT NULL,
    [KeywordsId]      UNIQUEIDENTIFIER NULL,
    [ReferringSiteId] UNIQUEIDENTIFIER NULL,
    [SiteNameId]      INT              NOT NULL,
    [DeviceNameId]    INT              NOT NULL,
    [LanguageId]      INT              NOT NULL,
    [FirstVisit]      BIT              NOT NULL,
    [Visits]          BIGINT           NOT NULL,
    [Value]           BIGINT           NOT NULL);

GO
CREATE TYPE [dbo].[TreeData] AS TABLE (
    [DefinitionId] UNIQUEIDENTIFIER NOT NULL,
    [StartDate]    DATE             NOT NULL,
    [EndDate]      DATE             NOT NULL,
    [TreeBlob]     VARBINARY (MAX)  NOT NULL,
    [Nodes]        INT              NOT NULL,
    [Value]        INT              NOT NULL,
    [Visits]       INT              NOT NULL,
    [Version]      VARBINARY (8)    NULL);

GO
CREATE TYPE [dbo].[TreeKeys] AS TABLE (
    [DefinitionId] UNIQUEIDENTIFIER NOT NULL,
    [StartDate]    DATE             NOT NULL,
    [EndDate]      DATE             NOT NULL);

GO
CREATE TYPE [dbo].[ValueBySource_Type] AS TABLE (
    [Date]            SMALLDATETIME NOT NULL,
    [TrafficType]     INT           NOT NULL,
    [SiteNameId]      INT           NOT NULL,
    [DeviceNameId]    INT           NOT NULL,
    [LanguageId]      INT           NOT NULL,
    [FirstVisitValue] BIGINT        NOT NULL,
    [Contacts]        BIGINT        NOT NULL,
    [Visits]          BIGINT        NOT NULL,
    [Value]           BIGINT        NOT NULL,
    PRIMARY KEY CLUSTERED ([Date] ASC, [TrafficType] ASC, [SiteNameId] ASC, [DeviceNameId] ASC, [LanguageId] ASC));

GO
CREATE TYPE [dbo].[Visits_Type] AS TABLE (
    [Date]       SMALLDATETIME    NOT NULL,
    [ItemId]     UNIQUEIDENTIFIER NOT NULL,
    [ContactId]  UNIQUEIDENTIFIER NOT NULL,
    [LanguageId] INT              NOT NULL,
    [FirstVisit] BIT              NOT NULL,
    [PagesCount] BIGINT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Date] ASC, [ItemId] ASC, [ContactId] ASC, [LanguageId] ASC, [FirstVisit] ASC));

GO
CREATE TYPE [dbo].[VisitsByBusinessContactLocation_Type] AS TABLE (
    [AccountId]      UNIQUEIDENTIFIER NOT NULL,
    [BusinessUnitId] UNIQUEIDENTIFIER NOT NULL,
    [Date]           SMALLDATETIME    NOT NULL,
    [TrafficType]    INT              NOT NULL,
    [SiteNameId]     INT              NOT NULL,
    [DeviceNameId]   INT              NOT NULL,
    [ContactId]      UNIQUEIDENTIFIER NOT NULL,
    [LanguageId]     INT              NOT NULL,
    [Latitude]       FLOAT (53)       NOT NULL,
    [Longitude]      FLOAT (53)       NOT NULL,
    [Visits]         BIGINT           NOT NULL,
    [Value]          BIGINT           NOT NULL,
    PRIMARY KEY CLUSTERED ([AccountId] ASC, [BusinessUnitId] ASC, [Date] ASC, [TrafficType] ASC, [SiteNameId] ASC, [DeviceNameId] ASC, [ContactId] ASC, [LanguageId] ASC, [Latitude] ASC, [Longitude] ASC));

GO
