// © 2017 Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Xml.Linq;
using Sitecore.Data;
using Sitecore.DependencyInjection;
using Sitecore.Diagnostics;
using Sitecore.Exceptions;
using Sitecore.Extensions.XElementExtensions;
using Sitecore.Globalization;
using Sitecore.ListManagement.XConnect.Segmentation;
using Sitecore.ListManagement.XConnect.Sources;
using Sitecore.Marketing.Rules;
using Sitecore.Resources;
using Sitecore.Shell.Applications.Dialogs.RulesEditor;
using Sitecore.Shell.Applications.Rules;
using Sitecore.Shell.Controls;
using Sitecore.StringExtensions;
using Sitecore.Web;
using Sitecore.Web.UI.HtmlControls;
using Sitecore.Web.UI.Pages;
using Sitecore.Web.UI.Sheer;
using Sitecore.XConnect.Segmentation.ExpressionBuilder;
using Sitecore.Marketing.Segmentation.RuleXmlConverter;

namespace Sitecore.Shell.Applications.Analytics.SegmentBuilder
{
    /// <summary>
    /// The visitor filter.
    /// </summary>
    public class SegmentBuilderForm : DialogForm
    {
        #region Constants and Fields

        private const string RulesIdentifier = "ruleset";

        private ISegmentationService _segmentationService;

        private IContactSearchExpressionBuilder _contactSearchExpressionBuilder;

        private IRuleXmlConverter _ruleXmlConverter;

        /// <summary>The rules container.</summary>
        protected Scrollbox RulesContainer;

        protected Edit RulesXml;

        /// <summary>
        /// Control that shows total visitors count.
        /// </summary>
        protected Literal TotalVisitorsNumber;

        #endregion

        #region Properties

        /// <summary>
        /// Gets or sets RulesSet.
        /// </summary>
        /// <value>The rules set.</value>
        [NotNull]
        public XElement FilterSet
        {
            get
            {
                var value = ServerProperties[RulesIdentifier] as string;
                if (!string.IsNullOrEmpty(value))
                {
                    return XElement.Parse(value);
                }

                return new XElement(RootNodeName);
            }

            set
            {
                Assert.ArgumentNotNull(value, "value");
                RulesXml.Value = value.ToString();
                ServerProperties[RulesIdentifier] = value.ToString();
            }
        }

        /// <summary>
        /// Gets the name of the root node.
        /// </summary>
        /// <value>The name of the root node.</value>
        [NotNull]
        protected virtual string RootNodeName
        {
            get { return RulesIdentifier; }
        }

        #endregion

        #region Methods

        /// <summary>
        /// Edits the filter condition.
        /// </summary>
        /// <param name="args">
        /// The arguments.
        /// </param>
        protected void EditFilterCondition([NotNull] ClientPipelineArgs args)
        {
            Assert.ArgumentNotNull(args, "args");

            string conditionId;
            if (!string.IsNullOrEmpty(args.Parameters["id"]))
            {
                conditionId = ID.Decode(args.Parameters["id"]).ToString();
            }
            else
            {
                conditionId = ID.NewID.ToString();
            }

            if (!args.IsPostBack)
            {
                var options = new RulesEditorOptions
                {
                    IncludeCommon = false,
                    RulesPath = "/sitecore/system/Settings/Rules/XConnect - Search Queries",
                    AllowMultiple = false,
                    HideActions = true,
                    PreviewRulesExecutionResults = false
                };

                if (options.PreviewRulesExecutionResults)
                {
                    options.RulesExecutionPreviewerType = null;
                }

                var condition =
                    FilterSet.Elements("rule").Where(node => node.GetAttributeValue("uid") == conditionId).FirstOrDefault();
                if (condition != null)
                {
                    options.Value = "<ruleset>" + condition + "</ruleset>";
                }

                SheerResponse.ShowModalDialog(options.ToUrlString().ToString(), true);
                args.WaitForPostBack();
            }
            else if (args.HasResult && string.Compare(args.Result.Trim(), "-", true, CultureInfo.InvariantCulture) != 0)
            {
                var result = args.Result;
                var ruleNode = XElement.Parse(result).Element("rule");
                var filterSet = FilterSet;
                if (ruleNode != null)
                {
                    var originalRule =
                        filterSet.Elements("rule").Where(node => node.GetAttributeValue("uid") == conditionId).
                            FirstOrDefault();
                    if (originalRule != null)
                    {
                        originalRule.ReplaceWith(ruleNode);
                        FilterSet = filterSet;
                        SheerResponse.SetInnerHtml(args.Parameters["id"] + "_rule", GetRuleConditionsHtml(ruleNode));
                        SheerResponse.SetInnerHtml(conditionId + "_count", Translate.Text("Calculating..."));
                        int position;
                        var ruleElements = filterSet.Elements("rule");
                        for (position = 0; position < ruleElements.Count(); position++)
                        {
                            if (string.Compare(ruleElements.ElementAt(position).GetAttributeValue("uid"), conditionId, true, CultureInfo.InvariantCulture) == 0)
                            {
                                break;
                            }
                        }

                        RecalculateVisitorCount(position);
                    }
                    else
                    {
                        var newRule = new XElement("rule");
                        newRule.SetAttributeValue("uid", conditionId);
                        newRule.Add(from el in ruleNode.Elements()
                            select el);
                        filterSet.Add(newRule);
                        FilterSet = filterSet;
                        var html = GetFilterSectionHtml(newRule, false);
                        SheerResponse.Insert("non-default-container", "append", html);
                        SheerResponse.Remove("no-rules-added");
                        RecalculateVisitorCount(filterSet.Elements("rule").Count() - 1);
                    }

                    UpdateTotalVisitorsInSegment();
                }
            }
        }

        /// <summary>
        /// Moves the condition after the specified one.
        /// </summary>
        /// <param name="id">
        /// The id.
        /// </param>
        /// <param name="targetId">
        /// The target id.
        /// </param>
        protected void MoveConditionAfter([NotNull] string id, [NotNull] string targetId)
        {
            Assert.ArgumentNotNull(id, "id");
            Assert.ArgumentNotNull(targetId, "targetId");

            var ruleSet = FilterSet;
            var rule = GetFilterById(ruleSet, id);
            var targetRule = GetFilterById(ruleSet, targetId);
            if (rule != null && targetRule != null)
            {
                rule.Remove();
                targetRule.AddAfterSelf(rule);
                FilterSet = ruleSet;
                RecalculateVisitorCount(GetFilterPosition(targetRule));
            }
        }

        /// <summary>
        /// Moves the condition before the specified one.
        /// </summary>
        /// <param name="id">
        /// The id.
        /// </param>
        /// <param name="targetId">
        /// The target id.
        /// </param>
        protected void MoveConditionBefore([NotNull] string id, [NotNull] string targetId)
        {
            Assert.ArgumentNotNull(id, "id");
            Assert.ArgumentNotNull(targetId, "targetId");

            var ruleSet = FilterSet;
            var rule = GetFilterById(ruleSet, id);
            var targetRule = GetFilterById(ruleSet, targetId);
            if (rule != null && targetRule != null)
            {
                rule.Remove();
                targetRule.AddBeforeSelf(rule);
                FilterSet = ruleSet;
                RecalculateVisitorCount(GetFilterPosition(rule));
            }
        }

        /// <summary>
        /// Gets the rule by id.
        /// </summary>
        /// <param name="ruleSet">
        /// The rule set.
        /// </param>
        /// <param name="id">
        /// The id.
        /// </param>
        /// <returns>
        /// The rule by id.
        /// </returns>
        [CanBeNull]
        private static XElement GetFilterById([NotNull] XElement ruleSet, [NotNull] string id)
        {
            Assert.ArgumentNotNull(ruleSet, "ruleSet");
            Assert.ArgumentNotNull(id, "id");
            var uid = ID.Parse(id).ToString();

            return ruleSet.Elements("rule").FirstOrDefault(rule => rule.GetAttributeValue("uid") == uid);
        }

        /// <summary>
        /// Edits the rule.
        /// </summary>
        /// <param name="id">
        /// The rule.
        /// </param>
        protected void EditFilterConditionClick([NotNull] string id)
        {
            Assert.ArgumentNotNull(id, "id");

            var parameters = new NameValueCollection();
            parameters["id"] = id;
            Context.ClientPage.Start(this, "EditFilterCondition", parameters);
        }

        /// <summary>
        /// Gets the filter position.
        /// </summary>
        /// <param name="filterElement">The filter.</param>
        /// <returns>The filter position in list.</returns>
        protected int GetFilterPosition([NotNull] XElement filterElement)
        {
            Assert.ArgumentNotNull(filterElement, "filterElement");

            var id = ShortID.Parse(filterElement.GetAttributeValue("uid")).ToString();
            return GetFilterPosition(id);
        }

        /// <summary>
        /// Gets the filter position.
        /// </summary>
        /// <param name="id">The filter id.</param>
        /// <returns>The filter position in the list.</returns>
        protected int GetFilterPosition([NotNull] string id)
        {
            Assert.ArgumentNotNull(id, "id");

            var ruleElements = FilterSet.Elements("rule");
            int position;
            for (position = 0; position < ruleElements.Count(); position++)
            {
                if (string.Compare(ShortID.Parse(ruleElements.ElementAt(position).GetAttributeValue("uid")).ToString(), id, true, CultureInfo.InvariantCulture) == 0)
                {
                    break;
                }
            }

            return position;
        }

        /// <summary>
        /// Gets the rule section HTML.
        /// </summary>
        /// <param name="filter">The filter rule element.</param>
        /// <param name="fillVisitorCount">if set to <c>true</c> visitor count should be calculated.</param>
        /// <returns>The section HTML.</returns>
        [NotNull]
        protected string GetFilterSectionHtml([NotNull] XElement filter, bool fillVisitorCount)
        {
            Assert.ArgumentNotNull(filter, "filter");

            var writer = new HtmlTextWriter(new StringWriter(CultureInfo.CurrentCulture));
            var id = ShortID.Parse(filter.GetAttributeValue("uid")).ToString();
            writer.Write("<table id='{ID}_body' cellspacing='0' cellpadding='0' class='rule-body'>");
            writer.Write("<tbody>");
            writer.Write("<tr>");

            writer.Write("<td class='left-column'>");
            RenderRuleConditions(filter, writer);
            writer.Write("</td>");

            writer.Write("<td class='right-column'>");
            writer.Write(string.Format(CultureInfo.InvariantCulture, "<span>{0}</span>", HttpUtility.HtmlEncode(Translate.Text(SB.Texts.ContactsThatMatchThisRule))));
            if (fillVisitorCount)
            {
                XElement rule;
                var number = GetVisitorsCount(GetFilterPosition(id), out rule);
                writer.Write(string.Format(CultureInfo.InvariantCulture, "<span class='value' id='{1}ID{2}_count'>{0}</span>", number, "{", "}"));
            }
            else
            {
                writer.Write(string.Format(CultureInfo.InvariantCulture, "<span class='value'>{0}</span>", HttpUtility.HtmlEncode(Translate.Text(SB.Texts.Calculating))));
            }
            writer.Write("</td>");

            writer.Write("</tr>");
            writer.Write("</tbody>");
            writer.Write("</table>");

            var panelHtml = writer.InnerWriter.ToString().Replace("{ID}", id);
            var actionsContext = new CollapsiblePanelRenderer.ActionsContext
            {
                IsVisible = true,
                OnActionClick = "javascript:return Sitecore.CollapsiblePanel.showActionsMenu(this,event)",
                Menu = GetActionsMenu(id)
            };

            var name = Translate.Text(SB.Texts.SpecifyName);
            if (!string.IsNullOrEmpty(filter.GetAttributeValue("name")))
            {
                name = filter.GetAttributeValue("name");
            }

            var nameContext = new CollapsiblePanelRenderer.NameContext(name)
            {
                Editable = true,
                OnNameChanged = "javascript:return Sitecore.CollapsiblePanel.renameComplete(this,event)"
            };

            var panelRenderer = new CollapsiblePanelRenderer();
            panelRenderer.CssClass = "rule-container";
            return Assert.ResultNotNull(panelRenderer.Render(id, panelHtml, nameContext, actionsContext));
        }

        /// <summary>Rename the rule.</summary>   
        /// <param name="message">The new message.</param>
        [HandleMessage("rule:rename")]
        protected void RenameRuleClick([NotNull] Message message)
        {
            Assert.ArgumentNotNull(message, "message");
            var id = message.Arguments["ruleId"];
            var newName = message.Arguments["name"];

            Assert.ArgumentNotNull(id, "id");
            if (!string.IsNullOrEmpty(newName))
            {
                var ruleSet = FilterSet;
                var rule = GetFilterById(ruleSet, id);
                if (rule != null)
                {
                    rule.SetAttributeValue("name", MainUtil.EscapePling(newName));
                    FilterSet = ruleSet;
                }
            }
        }

        /// <summary>
        /// The add actions menu.
        /// </summary>
        private Menu GetActionsMenu([NotNull] string id)
        {
            Assert.IsNotNullOrEmpty(id, "id");
            var actionsMenu = new Menu();
            actionsMenu.ID = id + "_menu";
            var icon = Images.GetThemedImageSource("Office/16x16/delete.png");
            var click = "javascript:Sitecore.CollapsiblePanel.remove(this, event, \"{0}\")".FormatWith(id);
            actionsMenu.Add(SB.Texts.DELETE, icon, click);

            var divider = actionsMenu.AddDivider();
            divider.ID = "moveDivider";

            icon = Images.GetThemedImageSource("Office/16x16/arrow_up.png");
            click = "javascript:Sitecore.CollapsiblePanel.moveUp(this, event, \"{0}\")".FormatWith(id);
            var menuItem = actionsMenu.Add(SB.Texts.MoveUp, icon, click);
            menuItem.ID = "moveUp";

            icon = Images.GetThemedImageSource("Office/16x16/arrow_down.png");
            click = "javascript:Sitecore.CollapsiblePanel.moveDown(this, event, \"{0}\")".FormatWith(id);
            menuItem = actionsMenu.Add(SB.Texts.MoveDown, icon, click);
            menuItem.ID = "moveDown";
            return actionsMenu;
        }

        /// <summary>
        /// Deletes the ruel click.
        /// </summary>
        /// <param name="id">
        /// The id.
        /// </param>
        protected void DeleteRuleClick([NotNull] string id)
        {
            Assert.ArgumentNotNull(id, "id");

            var uId = ID.Decode(id).ToString();

            var ruleSet = FilterSet;
            XElement ruleToDelete = null;
            var position = 0;
            foreach (var rule in ruleSet.Elements("rule"))
            {
                if (string.Compare(rule.GetAttributeValue("uid"), uId, true, CultureInfo.InvariantCulture) == 0)
                {
                    ruleToDelete = rule;
                    break;
                }

                position++;
            }

            if (ruleToDelete != null)
            {
                ruleToDelete.Remove();
                FilterSet = ruleSet;
                SheerResponse.Remove(id);
                UpdateTotalVisitorsInSegment();

                if (!FilterSet.Elements("rule").Any())
                {
                    SheerResponse.Insert(RulesContainer.ClientID, "append", GetNoRulesAddedHtml());
                }
            }
        }

        /// <summary>
        /// The get rule condition html.
        /// </summary>
        /// <param name="rule">
        /// The filter rule.
        /// </param>
        /// <returns>
        /// The get rules html.
        /// </returns>
        [NotNull]
        protected string GetRuleConditionsHtml([NotNull] XElement rule)
        {
            Assert.ArgumentNotNull(rule, "rule");

            var output = new HtmlTextWriter(new StringWriter(CultureInfo.CurrentCulture));
            var rules = new RulesRenderer("<ruleset>" + rule + "</ruleset>")
            {
                SkipActions = true,
                IsEditable = false
            };
            rules.Render(output);
            return output.InnerWriter.ToString();
        }

        /// <summary>
        /// Gets the no rules added HTML.
        /// </summary>
        /// <returns>The no rules added HTML.</returns>
        [NotNull]
        protected string GetNoRulesAddedHtml()
        {
            return string.Format(CultureInfo.InvariantCulture, "<div id='no-rules-added'>{0}</div>", HttpUtility.HtmlEncode(Translate.Text(SB.Texts.NoRulesAdded)));
        }

        /// <summary>
        /// Initializes the controls.
        /// </summary>
        protected void InitializeControls()
        {
            var number = GetTotalVisitorsInSegment();
            TotalVisitorsNumber.Text = number.ToString(CultureInfo.CurrentCulture);
        }

        /// <summary>
        /// Updates the total visitors in segment.
        /// </summary>
        protected void UpdateTotalVisitorsInSegment()
        {
            var number = GetTotalVisitorsInSegment();
            SheerResponse.SetInnerHtml(TotalVisitorsNumber.ClientID, number.ToString(CultureInfo.CurrentCulture));
        }

        /// <summary>
        /// Gets the total visitors in segment.
        /// </summary>
        /// <returns>
        /// The total visitors in segment.
        /// </returns>
        protected long GetTotalVisitorsInSegment()
        {
            var xdoc = new XDocument(FilterSet);
            var conditions = GetConditions(xdoc.Root?.Elements()).ToList();
            return _segmentationService
                .GetCount(
                    new ConditionsSource(conditions,
                        _contactSearchExpressionBuilder));
        }

        /// <summary>
        /// Initializes the filters.
        /// </summary>
        protected void InitializeFilters()
        {
            var html = new StringBuilder();
            html.Append("<div id='non-default-container'>");
            foreach (var rule in FilterSet.Elements("rule"))
            {
                html.Append(GetFilterSectionHtml(rule, true));
            }

            html.Append("</div>");

            if (!FilterSet.Elements("rule").Any())
            {
                html.Append(GetNoRulesAddedHtml());
            }

            RulesContainer.InnerHtml = html.ToString();
        }

        /// <summary>
        /// Initializes the builder.
        /// </summary>
        protected virtual void InitializeServices()
        {
            _segmentationService = (ISegmentationService)
                ServiceLocator.ServiceProvider.GetService(
                    typeof(ISegmentationService));
            _contactSearchExpressionBuilder = (IContactSearchExpressionBuilder)
                ServiceLocator.ServiceProvider.GetService(
                    typeof(IContactSearchExpressionBuilder));
            _ruleXmlConverter = (IRuleXmlConverter)
                ServiceLocator.ServiceProvider.GetService(
                    typeof(IRuleXmlConverter));
        }

        /// <summary>
        /// Creates new visitor filter.
        /// </summary>
        protected void NewFilterClick()
        {
            var newRule = new XElement("rule");
            newRule.SetAttributeValue("name", Translate.Text(SB.Texts.SpecifyName));
            var id = ID.NewID;
            newRule.SetAttributeValue("uid", id);
            var rules = FilterSet;
            rules.Add(newRule);
            FilterSet = rules;
            var html = GetFilterSectionHtml(newRule, true);
            SheerResponse.Remove("no-rules-added");
            SheerResponse.Insert("non-default-container", "append", html);
            SheerResponse.Eval("Sitecore.CollapsiblePanel.addNew(\"" + id.ToShortID() + "\")");
        }

        /// <summary>
        /// Raises the load event.
        /// </summary>
        /// <param name="e">
        /// The <see cref="System.EventArgs"/> instance containing the event data.
        /// </param>
        /// <remarks>
        /// This method notifies the server control that it should perform actions common to each HTTP
        /// request for the page it is associated with, such as setting up a database query. At this
        /// stage in the page lifecycle, server controls in the hierarchy are created and initialized,
        /// view state is restored, and form controls reflect client-side data. Use the IsPostBack
        /// property to determine whether the page is being loaded in response to a client postback,
        /// or if it is being loaded and accessed for the first time.
        /// </remarks>
        /// <exception cref="ApplicationException">Sitecore Analytics is disabled.</exception>
        /// <exception cref="AccessDeniedException">Application access denied.</exception>
        protected override void OnLoad([NotNull] EventArgs e)
        {
            Assert.ArgumentNotNull(e, "e");

            Assert.CanRunApplication("Dialogs/Segment Builder");


            base.OnLoad(e);
            InitializeServices();
            if (Context.ClientPage.IsEvent)
            {
                return;
            }

            UrlHandle handle;
            if (!UrlHandle.TryGetHandle(out handle))
            {
                throw new AccessDeniedException("Application access denied.");
            }

            Initialize(handle["value"]);
        }

        protected void Initialize(string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                try
                {
                    FilterSet = XElement.Parse(value);
                }
                catch
                {
                }
            }
            InitializeFilters();
            InitializeControls();
        }

        /// <summary>
        /// Handles a click on the OK button.
        /// </summary>
        /// <param name="sender">
        /// The sender.
        /// </param>
        /// <param name="args">
        /// The arguments.
        /// </param>
        /// <remarks>
        /// When the user clicks OK, the dialog is closed by calling
        /// the <see cref="Sitecore.Web.UI.Sheer.ClientResponse.CloseWindow">CloseWindow</see> method.
        /// </remarks>
        protected override void OnOK([NotNull] object sender, [NotNull] EventArgs args)
        {
            Assert.ArgumentNotNull(sender, "sender");
            Assert.ArgumentNotNull(args, "args");

            var rules = FilterSet;
            SheerResponse.SetDialogValue(rules.ToString());
            base.OnOK(sender, args);
        }

        /// <summary>
        /// Recalculates the visitor count.
        /// </summary>
        /// <param name="rulePosition">
        /// The start position.
        /// </param>
        protected void RecalculateVisitorCount(int rulePosition)
        {
            XElement rule;
            var number = GetVisitorsCount(rulePosition, out rule);
            UpdateVisitorCount(number, rule);
        }

        /// <summary>
        /// Gets the visitors count.
        /// </summary>
        /// <param name="rulePosition">The rule position.</param>
        /// <param name="rule">The rule by position.</param>
        /// <returns>
        /// The visitors count.
        /// </returns>
        protected long GetVisitorsCount(int rulePosition, [NotNull] out XElement rule)
        {
            var rules = new XElement(RootNodeName);
            var elements = FilterSet.Elements("rule").ToList();
            Assert.IsTrue(rulePosition >= 0 && elements.Count() > rulePosition, "Invalid rule position.");
            rule = elements.ElementAt(rulePosition);
            rules.Add(rule);

            var conditions = GetConditions(rules.Elements()).ToList();
            return _segmentationService
                .GetCount(
                    new ConditionsSource(conditions,
                        _contactSearchExpressionBuilder));
        }

        /// <summary>
        /// The render rule conditions.
        /// </summary>
        /// <param name="rule">
        /// The filter rule.
        /// </param>
        /// <param name="writer">
        /// The writer.
        /// </param>
        protected void RenderRuleConditions([NotNull] XElement rule, [NotNull] HtmlTextWriter writer)
        {
            Assert.ArgumentNotNull(rule, "rule");
            Assert.ArgumentNotNull(writer, "writer");

            var editButton = new Button
            {
                Header = Translate.Text(SB.Texts.EditRule),
                ToolTip = Translate.Text(SB.Texts.EditThisRule),
                Class = "scButton edit-button",
                Click = "EditFilterConditionClick(\\\"{ID}\\\")"
            };
            writer.Write(HtmlUtil.RenderControl(editButton));

            var cssClass = "condition-container";
            writer.Write("<div id='{ID}_rule' class='" + cssClass + "'>");

            writer.Write(GetRuleConditionsHtml(rule));
            writer.Write("</div>");
        }

        /// <summary>
        /// Updates the visitor count.
        /// </summary>
        /// <param name="count">
        /// The count.
        /// </param>
        /// <param name="rule">
        /// The rule.
        /// </param>
        protected void UpdateVisitorCount(long count, [NotNull] XElement rule)
        {
            Assert.ArgumentNotNull(rule, "rule");
            var id = ShortID.Parse(rule.GetAttributeValue("uid")).ToString();
            Assert.IsNotNullOrEmpty(id, "id");
            SheerResponse.SetInnerHtml(id + "_count", count.ToString(CultureInfo.CurrentCulture));
        }

        #endregion

        private IEnumerable<IRuleConditionNode> GetConditions(IEnumerable<XElement> elements)
        {
            foreach (var element in elements)
            {
                IRuleConditionNode ruleConditionNode;
                try
                {
                    ruleConditionNode = _ruleXmlConverter.CreateRule(element)?.Condition;
                }
                catch (InvalidOperationException)
                {
                    continue;
                }
                if (ruleConditionNode != null)
                {
                    yield return ruleConditionNode;
                }
            }
        }
    }
}

