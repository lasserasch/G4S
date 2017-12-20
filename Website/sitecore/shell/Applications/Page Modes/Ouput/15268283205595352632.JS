define("sc_ee_bundle_0",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js", "/-/speak/v1/ExperienceEditor/ExperienceEditorProxy.js"], function (Sitecore, ExperienceEditor, ExperienceEditorProxy) {
  Sitecore.Commands.Save =
  {
    canExecute: function (context, parent) {
      if (!ExperienceEditor.isInMode("edit")) {
        parent.initiator.set({ isVisible: false });
        return false;
      }

      var saveButtonState = ExperienceEditor.getPageEditingWindow().document.getElementById("__SAVEBUTTONSTATE");
      var modifiedState = ExperienceEditor.Web.getUrlQueryStringValue("sc_smf");
      if (modifiedState == "1") {
        saveButtonState.value = modifiedState;
        ExperienceEditor.getContext().isModified = true;
      }

      saveButtonState.onchange = function () {
        ExperienceEditor.getContext().isModified = saveButtonState.value == 1;
        ExperienceEditor.setSaveButtonState(ExperienceEditor.getContext().isModified);
        if (parent
          && parent.initiator) {
          parent.initiator.set({ isEnabled: ExperienceEditor.getContext().isModified });
        }
      };

      return parseInt(saveButtonState.value) == 1;
    },

    execute: function (context) {
      context = ExperienceEditor.generatePageContext(context, ExperienceEditor.getPageEditingWindow().document);
      context.currentContext.scLayout = ExperienceEditor.getPageEditingWindow().document.getElementById("scLayout").value;
      ExperienceEditorProxy.onSaving();

      if (context.app && context.app.disableButtonClickEvents) {
        context.app.disableButtonClickEvents();
      }

      ExperienceEditor.PipelinesUtil.initAndExecutePipeline(context.app.SavePipeline, context, function (context) {
        ExperienceEditor.setSaveButtonState(context.aborted);
      });
      if (context.app && context.app.enableButtonClickEvents) {
        context.app.enableButtonClickEvents();
      }
    }
  };
});define("sc_ee_bundle_1",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.SetEditMode =
  {
    canExecute: function (context) {
      context.button.set({ isPressed: ExperienceEditor.isInMode("edit") });

      return context.currentContext.canEdit;
    },
    execute: function (context) {
      context.currentContext.value = encodeURIComponent(ExperienceEditor.getPageEditingWindow().location);
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.EditMode.SelectEdit", function (response) {
        ExperienceEditor.getPageEditingWindow().location = response.responseValue.value;
      }).execute(context);
    }
  };
});define("sc_ee_bundle_2",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.SelectMode =
  {
    canExecute: function (context, parent) {
      if (!context.button) {
        return context.app.canExecute("ExperienceEditor.Mode.CanSelectMode", context.currentContext);
      }

      if (!ExperienceEditor.isInMode("edit")) {
        context.button.set({ isPressed : true });
      }

      return true;
    },

    execute: function (context) {
      context.currentContext.value = encodeURIComponent(context.currentContext.argument + "|" + ExperienceEditor.getPageEditingWindow().location);
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.Mode.SelectModeRequest", function (response) {
        ExperienceEditor.getPageEditingWindow().location = response.responseValue.value;
      }).execute(context);
    }
  };
});define("sc_ee_bundle_3",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.ExplorerMode =
  {
    canExecute: function (context) {
      return context.app.canExecute("ExperienceExplorer.ExplorerMode.CanExplore", context.currentContext);
    },

    execute: function (context) {
      context.currentContext.value = encodeURIComponent(window.parent.location);
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceExplorer.ExplorerMode.Explore", function (response) {
        window.parent.location = response.responseValue.value;
      }).execute(context);
    }
  };
});define("sc_ee_bundle_4",[
    "sitecore",
    "/-/speak/v1/ExperienceEditor/ExperienceEditor.js",
    "/-/speak/v1/ExperienceEditor/ExperienceEditor.Context.js",
    "/-/speak/v1/ExperienceEditor/TranslationUtil.js"
  ],
  function (Sitecore, ExperienceEditor, ExperienceEditorContext, TranslationUtil) {
    Sitecore.Commands.Lock =
    {
      button: null,
      canExecute: function (context) {
        if (!ExperienceEditor.isInMode("edit") || !context.currentContext.canReadLanguage || !context.currentContext.canWriteLanguage) {
          return false;
        }

        this.setButtonTitle(context, context.currentContext.isLocked);

        return context.currentContext.isLocked ? context.currentContext.canUnlock : context.currentContext.canLock;
      },

      allowLock: function (context) {
        return context.app.canExecute("ExperienceEditor.LockItem.CanToggleLock", context.currentContext);
      },

      execute: function (context) {
        if (!context.currentContext.requireLockBeforeEdit) {
          this.lockItem(context);
          return;
        }

        var that = this;
        ExperienceEditor.modifiedHandling(true, function (isOk) {
          that.lockItem(context);
        });
      },

      lockItem: function (context) {
        context.app.disableButtonClickEvents();

        ExperienceEditor.PipelinesUtil.initAndExecutePipeline(context.app.LockItemPipeline, context, function() {
            ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.Datasources.GetDatasourceUsagesWithLockedStatus", function (response) {

              if (context.currentContext.isLocked) {
                var associatedContentItems = response.responseValue.value;
                var errorMessage = "";

                jQuery.each(associatedContentItems, function () {

                  var clonedContext = ExperienceEditor.Common.cloneObject(context);

                  if (this.WarningMessage) {
                    errorMessage += "<br> - " + this.WarningMessage;
                    return;
                  }

                  //do not call LockItem processor on itself again
                  if (decodeURI(context.currentContext.itemId).replace(/{|}/gi, "").toUpperCase() === this.ItemId.toUpperCase()) {
                    return;
                  }

                  clonedContext.currentContext.itemId = this.ItemId;
                  clonedContext.currentContext.version = this.VersionNumber;
                  ExperienceEditor.PipelinesUtil.executeProcessors(Sitecore.Pipelines.LockItem, clonedContext);
                });

                if (errorMessage !== "") {
                  errorMessage = TranslationUtil.translateTextByServer(TranslationUtil.keys.Unfortunately_some_items_cannot_be_unlocked_because_they_are_locked_by_another_user, ExperienceEditor) + errorMessage;
                  ExperienceEditor.Dialogs.alert(encodeURI(errorMessage));
                }
              }

            if (Sitecore.Commands.MyItems && Sitecore.Commands.MyItems.reEvaluate) {
              Sitecore.Commands.MyItems.reEvaluate(context);
            }

            }).execute(context);
        });

        context.app.enableButtonClickEvents();

        if (!context.currentContext.requireLockBeforeEdit) {
          return;
        }

        if (ExperienceEditorContext.isModified && !context.app.isLocked) {
          ExperienceEditorContext.isModified = false;
          ExperienceEditor.refreshOnItem(context.currentContext);
        }
      },

      setButtonTitle: function (context, isLocked) {
        if (!Sitecore.Commands.Lock.button) {
          Sitecore.Commands.Lock.button = context.button;
        }

        var lockButton = Sitecore.Commands.Lock.button;
        if (!lockButton) {
          return;
        }

        lockButton.viewModel.setTitle(TranslationUtil.translateText(isLocked ? TranslationUtil.keys.Unlock : TranslationUtil.keys.Lock));
      }
    };
  });define("sc_ee_bundle_5",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.MyItems =
  {
    reEvaluate: function (context) {
      context.currentContext.lockedItemsCount = context.app.canExecute("ExperienceEditor.MyItems.Count", context.currentContext);
      this.canExecute(context);
    },

    canExecute: function (context) {
      if (ExperienceEditor.getPageEditingWindow().Sitecore.WebEditSettings.showNumberOfLockedItemsOnButton) {
        var amountOfLockedItems = context.currentContext.lockedItemsCount;
        var myItemsButton = $("a[data-sc-id='MyItemsRibbonButton'] span");
        var counterSpan = "<span> (" + amountOfLockedItems + ")</span>";

        if (amountOfLockedItems == 0) {
          myItemsButton.children().remove();
        } else {
          if (myItemsButton.children().length == 0)
            myItemsButton.append(counterSpan);
          else
            myItemsButton.children().html(counterSpan);
        }
      }
  
      return true;
    },

    execute: function (context) {
      var dialogPath = "/sitecore/shell/~/xaml/Sitecore.Shell.Applications.WebEdit.Dialogs.LockedItems.aspx";
      var dialogFeatures = "dialogHeight: 600px;dialogWidth: 800px;";
      ExperienceEditor.Dialogs.showModalDialog(dialogPath, '', dialogFeatures, null, function () {
        Sitecore.Commands.MyItems.canExecute(context);
        context.currentContext.isLocked = context.app.canExecute("ExperienceEditor.LockItem.IsLocked", context.currentContext);
        if (Sitecore.Commands.Lock) {
          Sitecore.Commands.Lock.canExecute(context);
        }
      });
    }
  };
});define("sc_ee_bundle_6",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.SelectLayout =
  {
    isNotificationRendered: false,
    canExecute: function (context) {
      if (ExperienceEditor.Web.getUrlQueryStringValue("sc_disable_edit") == "yes") {
        return false;
      }

      if (context.currentContext.isFallback) {
        return false;
      }

      if (!ExperienceEditor.isInMode("edit")) {
        return false;
      }

      if (!context.currentContext.isEditAllVersionsAllowed) {
        return false;
      }

      if (!this.isNotificationRendered && context.currentContext.isEditAllVersionsTicked) {
        this.defineNotification(context);
      }

      this.isNotificationRendered = true;

      return true;
    },
    execute: function (context) {
      var postContext = context || this.currentContext;
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.Versions.SelectLayout", function (response) {
        ExperienceEditor.getPageEditingWindow().location.reload();
      }, { value: encodeURIComponent(context.currentContext.argument) }).execute(postContext);
    },

    defineNotification: function (context) {
      var that = this;
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.Versions.NotificationMessage", function (response) {
        var id = "EditAllVersionsID";
        var notification = ExperienceEditor.RibbonApp.getApp().showNotification("notification", response.responseValue.value, true);
        if (notification) {
          notification.innerHTML = notification.innerHTML.replace("{", "<b><a href='#' id='" + id + "'>").replace("}", "</a></b>");
        }

        jQuery("#" + id).click(function () {
          that.execute(context);
        });

      }).execute(context);
    }
  };
});define("sc_ee_bundle_7",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.SelectDevice =
  {
    canExecute: function (context) {
      if (!context.button) {
        return context.app.canExecute("ExperienceEditor.Device.HasDeviceLayout", context.currentContext);
      }

      return true;
    },
    execute: function (context) {
      context.currentContext.value = encodeURIComponent(context.currentContext.argument + "|" + ExperienceEditor.getPageEditingWindow().location);
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.Device.SelectSevice", function (response) {
        ExperienceEditor.getPageEditingWindow().location = response.responseValue.value;
      }).execute(context);
    }
  };
});define("sc_ee_bundle_8",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.OpenSelectVersionGallery =
  {
    notificationAdded: false,

    canExecute: function (context) {
      var queryString = "?itemId=" + context.currentContext.itemId +
        "&database=" + context.currentContext.database +
        "&la=" + context.currentContext.language +
        "&vs=" + context.currentContext.version;

      context.button.set("galleryUrlQueryString", queryString);

      if (!ExperienceEditor.isInMode("edit")) {
        return false;
      }

      if (!this.notificationAdded) {
        this.notificationAdded = true;
        var notificationMessage = !context.currentContext.isFallback ? context.currentContext.latestVersionResponse : "";
        if (notificationMessage != '') {
          var id = "GoToLatestVersionID";
          var responseResult = notificationMessage.split('|');
          var notification = ExperienceEditor.RibbonApp.getApp().showNotification("notification", responseResult[1], true);
          if (notification) {
            notification.innerHTML = notification.innerHTML.replace("{", "<b><a href='#' id='" + id + "'>").replace("}", "</a></b>");
          }

          jQuery("#" + id).click(function () {
            var url = ExperienceEditor.Web.removeQueryStringParameter(ExperienceEditor.getPageEditingWindow().location.href, "sc_version");
            ExperienceEditor.getPageEditingWindow().Sitecore.PageModes.Utility.removeCookie(responseResult[0]);
            ExperienceEditor.navigateToUrl(url);
          });
        }
      }

      return context.currentContext.canSelectVersion;
    },

    execute: function (context) {
    }
  };
});
define("sc_ee_bundle_9",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.RemoveVersions =
  {
    canExecute: function (context) {
      if (!ExperienceEditor.isInMode("edit") || context.currentContext.isFallback) {
        return false;
      }

      if (!context.button) {
        return context.app.canExecute("ExperienceEditor.RemoveVersions.CanRemoveVersion", context.currentContext);
      }

      return true;
    },
    execute: function (context) {
      context.currentContext.value = context.currentContext.argument;
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.RemoveVersions.GetCommand", function (response) {
        if (response.responseValue.value == "item:deleteversion") {
          ExperienceEditor.PipelinesUtil.initAndExecutePipeline(context.app.RemoveItemVersionsPipeline, context);
        }
        else if (response.responseValue.value == "item:removelanguage") {
          ExperienceEditor.PipelinesUtil.initAndExecutePipeline(context.app.RemoveLanguagePipeline, context);
        }
        
      }).execute(context);
    }
  };
});define("sc_ee_bundle_10",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.OpenSelectLanguageGallery =
  {
    canExecute: function (context) {
      var queryString = "?itemId=" + context.currentContext.itemId +
        "&database=" + context.currentContext.database +
        "&la=" + context.currentContext.language +
        "&vs=" + context.currentContext.version;

      context.button.set("galleryUrlQueryString", queryString);

      return true;
    },

    execute: function (context) {
    }
  };
});
define("sc_ee_bundle_11",[ "sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js" ], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.EnableFieldsValidation =
  {
    contextButton: null,

    isEnabled: false,

    reEvaluate: function(context) {
      var clonedContext = ExperienceEditor.Common.cloneObject(context);
      clonedContext.button = this.contextButton ? this.contextButton : null;

      var canValidate = this.canExecute(clonedContext);

      if (!this.contextButton) {
        return;
      }

      this.contextButton.set("isEnabled", canValidate);

      if (!Sitecore.Commands.EnableEditing.isEnabled) {
        require(["/-/speak/v1/ExperienceEditor/ValidateFieldsUtil.js"], function (ValidationUtil) {
          ValidationUtil.deactivateValidation(ValidationUtil.validationErrors);
        });
        if (!canValidate) {
          this.contextButton.set("isChecked", "0");
        }
      }
    },

    canExecute: function (context) {
      this.contextButton = context.button;

      if (!ExperienceEditor.isInMode("edit") || context.currentContext.isFallback || !context.currentContext.canReadLanguage || !context.currentContext.canWriteLanguage) {
        return false;
      }

      if (context.currentContext.isReadOnly) {
        return false;
      }

      var isEditingEnabled = Sitecore.Commands.EnableEditing && Sitecore.Commands.EnableEditing.isEnabled;
      if (isEditingEnabled) {
        return true;
      }

      var editingCheckControl = ExperienceEditor.CommandsUtil.getControlsByCommand(context.app.Controls, "EnableEditing")[0];
      if (!editingCheckControl) {
        return false;
      }

      return editingCheckControl.model.get("isChecked") == "1";
    },

    execute: function (context) {
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.ToggleRegistryKey.Toggle", function (response) {
        var result = response.responseValue.value;
        response.context.button.set("isChecked", response.responseValue.value ? "1" : "0");
        Sitecore.Commands.EnableFieldsValidation.isEnabled = result;
        require(["/-/speak/v1/ExperienceEditor/ValidateFieldsUtil.js"], function (ValidationUtil) {
          if (result) {
            ValidationUtil.validateFields(context);
          } else {
            ValidationUtil.deactivateValidation(ValidationUtil.validationErrors);
          }
        });
      }, { value: context.button.get("registryKey") }).execute(context);
    }
  };
});define("sc_ee_bundle_12",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js", "/-/speak/v1/ExperienceEditor/ExperienceEditorProxy.js"], function (Sitecore, ExperienceEditor, ExperienceEditorProxy) {
  Sitecore.Commands.ShowControls =
  {
    commandContext: null,
    isEnabled: false,
    reEvaluate: function () {
      this.canExecute(Sitecore.Commands.ShowControls.commandContext);
      if (Sitecore.Commands.ShowControls.commandContext) {
        Sitecore.Commands.ShowControls.commandContext.button.set("isEnabled", this.isEnabled);
      }
    },
    canExecute: function (context) {
      if (!ExperienceEditor.isInMode("edit")
        || !context
        || !context.button
        || context.currentContext.isFallback) {
        return false;
      }

      var isAllowed = ExperienceEditor.isEditingAndDesigningAllowed();

      ExperienceEditorProxy.changeShowControls(context.button.get("isChecked") == "1" && isAllowed);
      if (!Sitecore.Commands.ShowControls.commandContext) {
        Sitecore.Commands.ShowControls.commandContext = ExperienceEditor.Common.cloneObject(context);
      }

      this.isEnabled = isAllowed;
      return this.isEnabled;
    },
    execute: function (context) {
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.ToggleRegistryKey.Toggle", function (response) {
        response.context.button.set("isChecked", response.responseValue.value ? "1" : "0");
        ExperienceEditorProxy.changeShowControls(response.context.button.get("isChecked") == "1");
      }, { value: context.button.get("registryKey") }).execute(context);
    }
  };
});define("sc_ee_bundle_13",["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.ShowNavigationBar =
  {
    canExecute: function (context) {
      context.app.RibbonBreadcrumb.set("isVisible", context.button.get("isChecked") == "1");
      context.app.setHeight();
      return true;
    },
    execute: function (context) {
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.ToggleRegistryKey.Toggle", function (response) {
        response.context.button.set("isChecked", response.responseValue.value ? "1" : "0");
        response.context.app.RibbonBreadcrumb.set("isVisible", response.responseValue.value);
        response.context.app.setHeight();
      }, { value: context.button.get("registryKey") }).execute(context);
    }
  };
});define("sc_ee_bundle_14",[
        "sitecore",
        "/-/speak/v1/ExperienceEditor/ExperienceEditor.js",
        "/-/speak/v1/ExperienceEditor/ExperienceEditorProxy.js",
        "/-/speak/v1/ExperienceEditor/TranslationUtil.js"
    ],
 function (Sitecore, ExperienceEditor, ExperienceEditorProxy, TranslationUtil) {
  Sitecore.Commands.ShowDataSources =
  {
    commandContext: null,

    reEvaluate: function () {
      return this.canExecute(this.commandContext);
    },

    canExecute: function (context) {
      var that = this;

      if (!ExperienceEditor.isInMode("edit")
        || !context
        || !context.button
        || context.currentContext.isFallback) {
        return false;
      }

      var isAllowed = ExperienceEditor.isEditingAndDesigningAllowed();
      ExperienceEditor.on("onChromeUpdated", function () {
        that.setHighlightState(context);
      });

      context.button.set("isEnabled", isAllowed);
      this.setHighlightState(context);
      if (!this.commandContext) {
        this.commandContext = ExperienceEditor.Common.cloneObject(context);
      }

      if (context.app
        && isAllowed
        && context.button.get("isChecked") === "1") {
        this.publishAffectedPagesNotification(context);
      }

      return isAllowed;
    },

    publishAffectedPagesNotification: function (context) {
        if (!context.currentContext.isInFinalWorkFlow) {
            return;
        }

        var that = this;
        ExperienceEditor.getPageDatasourcesItemIDs(context, function (itemIDs) {
            if (itemIDs.length > 0) {
                ExperienceEditor.areItemsInFinalWorkflowState(context, itemIDs, function (result) {
                    if (result.inFinalStateCountAndNotPublished > 0) {
                        that.showPublishAffectedPagesNotification();
                        return;
                    }
                });
            }

            ExperienceEditor.getDatasourceUsagesWithFinalWorkflowStep(context, function (context, isInFinalStep) {
                if (isInFinalStep == true) {
                    that.showPublishAffectedPagesNotification();
                    return;
                }
            });
        });
    },

    showPublishAffectedPagesNotification: function () {
      var notificationTitle = TranslationUtil.translateTextByServer(TranslationUtil.keys.This_component_contains_associated_content_If_you_publish_this_component_the_associated_content_is_also_published_to_a_number_of_other_pages_that_use_the_same_associated_content, ExperienceEditor);
        // notificationTitle = notificationTitle.replace("{0}", result.inFinalStateCountAndNotPublished);
      this.command.context.app.showNotification("notification", notificationTitle, true);
    },

    execute: function (context) {
      var that = this;
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.ToggleRegistryKey.Toggle", function (response) {
        response.context.button.set("isChecked", response.responseValue.value ? "1" : "0");
        that.setHighlightState(response.context);
      }, { value: context.button.get("registryKey") }).execute(context);
    },

    setHighlightState: function (context) {
      var className = "chromeWithDatasource";
      ExperienceEditor.ShowDataSources = ExperienceEditor.ShowDataSources || {};
      var isChecked = context.button.get("isChecked") !== "0" && context.button.get("isChecked") && context.button.get("isEnabled");
      isChecked = isChecked == null ? ExperienceEditor.ShowDataSources.isChecked : isChecked;
      ExperienceEditor.ShowDataSources.isChecked = isChecked || ExperienceEditor.ShowDataSources.isChecked;
      if (isChecked === "1" || isChecked === true) {
        var renderingsWithDatasources = ExperienceEditor.getPageEditingWindow().Sitecore.LayoutDefinition.getRenderingsWithDatasources();
        ExperienceEditor.getPageEditingWindow().Sitecore.PageModes.ChromeManager.setClass(renderingsWithDatasources, className);
      } else {
        ExperienceEditor.getPageEditingWindow().Sitecore.PageModes.ChromeManager.removeClass(className);
      }
    }
  };
});
