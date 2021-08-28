sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createPrdNameValueHelpCols: function() {
			var oModel = new JSONModel({
				"cols": [{
					"label": "Product ID",
					"template": "businessModel>ProductID",
					"width": "10rem"
				}, {
					"label": "Product Name",
					"template": "businessModel>ProductName"
				}]
			});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};
});