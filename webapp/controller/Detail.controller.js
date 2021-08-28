sap.ui.define([
	"fiori/training/worklist/common/BaseController",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("fiori.training.worklist.controller.Detail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.training.worklist.view.Detail
		 */
		onInit: function() {
			this.oDataModel = this.getOwnerComponent().getModel();
			this.oView.setModel(new JSONModel({
				"bEditState": false
			}), "viewModel");
			this.oViewModel = this.oView.getModel("viewModel");
			this.oDataModel.detachRequestSent(this._setPageBusyTrue, this);
			this.oDataModel.detachRequestCompleted(this._setPageBusyFalse, this);
			this.oDataModel.attachRequestSent(this._setPageBusyTrue, this);
			this.oDataModel.attachRequestCompleted(this._setPageBusyFalse, this);
			this.getRouter().getRoute("Detail").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched : function (oEvent) {
			var oArgs, iProductID;
			oArgs = oEvent.getParameter("arguments");
			iProductID = Number(oArgs.ProductID);
			this.sPath = "/Products(" + iProductID + ")";
			this.oView.byId("dynamicPageId").bindElement({
				path: this.sPath,
				parameters: {
					"expand": "Supplier"
				}
			});
		},
		
		_setPageBusyTrue: function() {
			this.oView.byId("dynamicPageId").setBusy(true);
		},
		
		_setPageBusyFalse: function() {
			this.oView.byId("dynamicPageId").setBusy(false);
		},

		/**
		* Uncalled methods begin
		**/
		handleEditPress: function() {
			this.oViewModel.setProperty("/bEditState", true);
		},
		
		handleSavePress: function() {
			var oObject = this.oView.byId("dynamicPageId").getBindingContext().getProperty();
			this.oView.byId("dynamicPageId").setBusy(true);
			this.oDataModel.update(this.sPath, oObject, {
				/*headers: {
					"Content-ID": 1
				},*/
				groupId: "updateEmployee",
				success: function(oRes) {
					this.oView.byId("dynamicPageId").setBusy(false);
					this.oViewModel.setProperty("/bEditState", false);
					sap.m.MessageToast.show("Update Employee info successfully.");
				}.bind(this),
				error: function(error) {
					this.oView.byId("dynamicPageId").setBusy(false);
					sap.m.MessageBox.error("Update Employee info failed.");
				}.bind(this)
			});
		},
		
		handleCancelPress: function() {
			this.oViewModel.setProperty("/bEditState", false);
			this.oDataModel.resetChanges([this.sPath]);
		}
		/**
		* Uncalled methods end
		**/

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fiori.training.worklist.view.Detail
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fiori.training.worklist.view.Detail
		 */
		// onExit: function() {
		//
		// }

	});

});