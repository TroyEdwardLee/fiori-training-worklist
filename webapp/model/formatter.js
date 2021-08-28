sap.ui.define([
	"fiori/training/worklist/model/DateFormatter"	
], function (DateFormatter) {
	"use strict";
	return {
		jonitDetailTitle: function(title1, title2) {
			if (title1 && title2) {
				return title1 + "-" + title2;
			} else if (title2) {
				return title2;
			} else if (title1) {
				return title2;
			}
			return "";
		},

		/**
		 * Creates a human readable date
		 *
		 * @public
		 * @param {Date} oDate the date of the property.
		 * @returns {string} sValue the formatted date
		 */
		date: function(oDate) {
			return new DateFormatter({ now: Date.now }).format(oDate);
		},
		
		convertPrdStateText: function(val) {
			if (val === true) {
				return this.oI18n.getText("prdStateContinuedTxt");
			} else if (val === false) {
				return this.oI18n.getText("prdStateDiscontinuedTxt");
			} else {
				return "";
			}
		}
	};
});