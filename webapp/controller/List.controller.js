sap.ui.define([
	"fiori/training/worklist/common/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/ColumnListItem",
	"fiori/training/worklist/model/models",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, JSONModel, Fragment, ColumnListItem, models, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("fiori.training.worklist.controller.List", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.training.worklist.view.List
		 */
		onInit: function() {
			this.oI18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oDataModel = this.getOwnerComponent().getModel();

			this.oView.setModel(new JSONModel({
				"sTableTitle": this.oI18n.getText("tableTitle", [0]),
				"filters": {
					"ProductName": "",
					"SupplierID": []
				},
				"iTableSelectedLen": 0
				/* Uncalled structure
				* "maintainEmployee": {
					"ProductID": "",
					"Name": "",
					"Age": null,
					"Birthdate": null,
					"Address": ""
				}*/
			}), "viewModel");
			this.oViewModel = this.oView.getModel("viewModel");

			this.oView.setModel(new JSONModel({
				"ProductNameF4": [],
				"SupplierF4": [],
				"Products": []
			}), "businessModel");
			this.oBusinessModel = this.oView.getModel("businessModel");
			this._oTable = this.oView.byId("productTableId");
			this._fetchF4();
		},
		
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fiori.training.worklist.view.List
		 */
		// onAfterRendering: function() {
		//	
		// },
		
		_fetchF4: function() {
			this.oBusinessModel.setProperty("/ProductNameF4", []);
			this.oView.byId("filterBarId").setBusy(true);
			var aDeferredGroups = this.removeDeferredGroupId(["F4Data"], this.oDataModel);
			if (aDeferredGroups.indexOf("F4Data") === -1) {
				aDeferredGroups = aDeferredGroups.concat(["F4Data"]);
			}
			this.oDataModel.setDeferredGroups(aDeferredGroups);
			this.oDataModel.read("/Products", {
				groupId: "F4Data",
				success: function(oData) {
					return oData;
				}
			});
			this.oDataModel.read("/Suppliers", {
				groupId: "F4Data"
			});
			this.oDataModel.submitChanges({
				success: function(oData) {
					this.oView.byId("filterBarId").setBusy(false);
					var aBatchRes = oData.__batchResponses;
					if (aBatchRes[0].statusCode === "200" && aBatchRes[0].statusText === "OK") {
						this.oBusinessModel.setProperty("/ProductNameF4", aBatchRes[0].data.results);
					}
					if (aBatchRes[1].statusCode === "200" && aBatchRes[1].statusText === "OK") {
						this.oBusinessModel.setProperty("/SupplierF4", aBatchRes[1].data.results);
					}
				}.bind(this),
				error: function(error) {
					this.oView.byId("filterBarId").setBusy(false);
					sap.m.MessageBox.error("Filter data load failed.");
				}.bind(this)
			});
		},

		_fetchProductData: function() {
			// this._oTable.removeSelections(true);
			var sName = this.oViewModel.getProperty("/filters/ProductName"),
				aSupplierID = this.oViewModel.getProperty("/filters/SupplierID"),
				aFilter = [];
			if (sName && sName.trim().length) {
				var oFilter = new Filter({
					path: "ProductName",
					operator: FilterOperator.EQ,
					value1: sName.trim()
				});
				aFilter.push(oFilter);
			}
			if (aSupplierID.length) {
				var aSupplierIdFilter = [];
				var oSupplierIdFilter = new Filter({
					filters: [],
					and: false
				});
				aSupplierID.forEach(function(val) {
					aSupplierIdFilter.push(new Filter({
						path: "SupplierID",
						operator: FilterOperator.EQ,
						value1: val
					}));
				});
				oSupplierIdFilter.aFilters = aSupplierIdFilter;
				aFilter.push(oSupplierIdFilter);
			}
			this.oViewModel.setProperty("/sTableTitle", this.oI18n.getText("tableTitle", [0]));
			this.oBusinessModel.setProperty("/Products", []);
			this._oTable.setBusy(true);
			this.oDataModel.read("/Products", {
				groupId: "productData",
				filters: aFilter,
				urlParameters: {
					"$expand": "Supplier"
				},
				success: function(oData) {
					this._oTable.setBusy(false);
					this.oViewModel.setProperty("/sTableTitle", this.oI18n.getText("tableTitle", [oData.results.length]));
					this.oBusinessModel.setProperty("/Products", oData.results);
				}.bind(this),
				error: function(error) {
					this._oTable.setBusy(false);
					sap.m.MessageBox.error("Load data failed.");
				}.bind(this)
			});
		},
		
		handlePrdNameValueHelp: function() {
			var aCols = models.createPrdNameValueHelpCols().getProperty("/cols");
			Fragment.load({
				name: "fiori.training.worklist.fragment.PrdNameValueHelpDialog",
				controller: this
			}).then(function(oFragment) {
				this._oPrdNameValueHelpDialog = oFragment;
				this.oView.addDependent(this._oPrdNameValueHelpDialog);
				this._oPrdNameValueHelpDialog.getTableAsync().then(function(oTable) {
					oTable.setModel(new JSONModel({
						"cols": aCols
					}), "columns");
					if (oTable.bindRows) {
						oTable.bindAggregation("rows", "businessModel>/ProductNameF4");
					}
					if (oTable.bindItems) {
						oTable.bindAggregation("items", "viewModel>/ProductNameF4", function() {
							return new ColumnListItem({
								cells: aCols.map(function(column) {
									return new sap.m.Label({
										text: "{" + column.template.split(">")[1] + "}"
									});
								})
							});
						});
					}
					this._oPrdNameValueHelpDialog.update();
				}.bind(this));

				var oToken = new sap.m.Token();
				oToken.setKey(Number(this.oView.byId("productNameInputId").getSelectedKey()));
				oToken.setText(this.oView.byId("productNameInputId").getValue());
				this._oPrdNameValueHelpDialog.setTokens([oToken]);
				this._oPrdNameValueHelpDialog.open();
			}.bind(this));
		},

		onPrdNameValueHelpOkPress: function(oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this.oView.byId("productNameInputId").setSelectedKey(aTokens[0].getKey());
			oEvent.getSource().close();
		},

		onValueHelpCancelPress: function(oEvent) {
			oEvent.getSource().close();
		},

		onValueHelpAfterClose: function(oEvent) {
			oEvent.getSource().destroy();
		},
		
		onSearch: function() {
			this._fetchProductData();
		},
		
		handleFilterClearPress: function() {
			var aPropertiesInfo = [{
				path: "/filters/ProductName",
				targetValue: ""
			}, {
				path: "/filters/SupplierID",
				targetValue: []
			}];
			this.setMultiProperties(this.oViewModel, aPropertiesInfo);
			// this.oViewModel.setProperty("/filters/ProductName", "");
			// this.oViewModel.setProperty("/filters/SupplierID", []);
			this._fetchProductData();
		},
		
		handleListItemPress: function(oEvent) {
			var oRow = oEvent.getParameter("row"),
				oBindingContext = oRow.getBindingContext("businessModel");
			var oPressData = oBindingContext.getProperty();
			this.getRouter().navTo("Detail", {
				"ProductID": oPressData.ProductID
			});
		},
		/**
		* Uncalled methods begin
		**/
		handleAddPress: function() {
			var oView = this.oView;
			// create dialog lazily
			if (!this._oAddDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "fiori.training.worklist.fragment.AddDialog",
					controller: this
				}).then(function(oDialog) {
					this._oAddDialog = oDialog;
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.open();
				}.bind(this));
			} else {
				this._oAddDialog.open();
			}
		},
		
		handleConfirmAdd: function() {
			var oEmployee = this.oViewModel.getProperty("/maintainEmployee");
			this._oAddDialog.setBusy(true);
			this.oDataModel.create("/ZEMPLOYEEINFOSet", oEmployee, {
				groupId: "addEmployee",
				success: function(oRes) {
					this._oAddDialog.setBusy(false);
					this._oAddDialog.close();
					sap.m.MessageToast.show("Add Employee info successfully.");
					this._fetchProductData();
				}.bind(this),
				error: function(error) {
					this._oAddDialog.setBusy(false);
					sap.m.MessageBox.error("Add Employee info failed.");
				}.bind(this)
			});
		},
		
		handleCancelOpreation: function(oEvent) {
			var oSource = oEvent.getSource();
			oSource.getParent().close();
		},
		
		handleAddDialogAfterOpen: function() {
			this.oViewModel.setProperty("/maintainEmployee/ProductID", this.generateGuid());
		},
		
		handleAddDialogAfterClose: function() {
			this.oViewModel.setProperty("/maintainEmployee", {
				"ProductID": "",
				"Name": "",
				"Age": null,
				"Birthdate": "",
				"Address": ""
			});
		},
		
		handleTableSelectionChange: function(oEvent) {
			var aSelectedItem = oEvent.getParameter("listItems");
			this.oViewModel.setProperty("/iTableSelectedLen", aSelectedItem.length);
		},
		
		handleEditPress: function() {
			var oView = this.oView,
				aPath = this._oTable.getSelectedContextPaths();
			if  (!aPath.length) {
				return;
			}
			var oSelectedData = this.oBusinessModel.getProperty(aPath[0]);
			delete oSelectedData.__metadata;
			this.oViewModel.setProperty("/maintainEmployee", oSelectedData);
			// create dialog lazily
			if (!this._oEditDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "fiori.training.worklist.fragment.EditDialog",
					controller: this
				}).then(function(oDialog) {
					this._oEditDialog = oDialog;
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.open();
				}.bind(this));
			} else {
				this._oEditDialog.open();
			}
		},
		
		handleConfirmEdit: function() {
			var oEmployee = this.oViewModel.getProperty("/maintainEmployee");
			this._oEditDialog.setBusy(true);
			this.oDataModel.update("/ZEMPLOYEEINFOSet('" + oEmployee.ProductID + "')", oEmployee, {
				groupId: "updateEmployee",
				success: function(oRes) {
					this._oEditDialog.setBusy(false);
					this._oEditDialog.close();
					sap.m.MessageToast.show("Update Employee info successfully.");
					this._oTable.removeSelections(true);
					this.oViewModel.setProperty("/iTableSelectedLen", 0);
					this._fetchProductData();
				}.bind(this),
				error: function(error) {
					this._oEditDialog.setBusy(false);
					sap.m.MessageBox.error("Update Employee info failed.");
				}
			});
		},
		
		handleDeletePress: function() {
			sap.m.MessageBox.confirm("Confirm delete employee?", {
				onClose: function(sAction) {
					if (sAction === "OK") {
						this._removeEmployee();
					}
				}.bind(this)
			});
		},
		
		_removeEmployee: function() {
			var aPath = this._oTable.getSelectedContextPaths();
			if  (!aPath.length) {
				return;
			}
			var sSelectedId = this.oBusinessModel.getProperty(aPath[0] + "/ProductID");
			this._oTable.setBusy(true);
			this.oDataModel.remove("/ZEMPLOYEEINFOSet('" + sSelectedId + "')", {
				groupId: "removeEmployee",
				success: function(oRes) {
					this._oTable.setBusy(false);
					sap.m.MessageToast.show("Delete Employee info successfully.");
					this._oTable.removeSelections(true);
					this.oViewModel.setProperty("/iTableSelectedLen", 0);
					this._fetchProductData();
				}.bind(this),
				error: function(error) {
					this._oTable.setBusy(false);
					sap.m.MessageBox.error("Delete Employee info failed.");
				}
			});
		}
		/**
		* Uncalled methods end
		**/

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fiori.training.worklist.view.List
		 */
		//	onExit: function() {
		//
		//	}

	});

});