sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"fiori/training/worklist/model/formatter"
], function(Controller, History, UIComponent, formatter) {
	"use strict";
	return Controller.extend("fiori.training.worklist.common.BaseController", {
		formatter: formatter,
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("List", {}, true /*no history*/);
			}
		},
		
		generateGuid: function() {
			var d = new Date().getTime();
			if (window.performance && typeof window.performance.now === "function") {
				d += window.performance.now(); //use high-precision timer if available
			}
			var guid = "UCxxxxxxxx".replace(/[xy]/g, function(c) {
				var r = (d + Math.random() * 16) % 16 | 0;
				d = Math.floor(d / 16);
				return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
			});
			return guid;
		},
		
		removeDeferredGroupId: function(aId, oModel) {
			var oDataModel = oModel ? oModel : this.getOwnerComponent().getModel();
			var aDeferredGroups = oDataModel.getDeferredGroups();
			aId.map(function(sId) {
				if (aDeferredGroups.indexOf(sId) !== -1) {
					aDeferredGroups.splice(aDeferredGroups.indexOf(sId), 1);
				}
			});
			return aDeferredGroups;
		},
		
		setMultiProperties: function(oModel, aProperties) {
			aProperties.forEach(function(oProperty) {
				oModel.setProperty(oProperty.path, oProperty.targetValue);
			});
		}

	});

});