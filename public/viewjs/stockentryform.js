﻿$('#save-stockentry-button').on('click', function(e)
{
	e.preventDefault();

	if (!Grocy.FrontendHelpers.ValidateForm("stockentry-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonForm = $('#stockentry-form').serializeJSON();
	Grocy.FrontendHelpers.BeginUiBusy("stockentry-form");

	if (!jsonForm.price.toString().isEmpty())
	{
		price = parseFloat(jsonForm.price).toFixed(Grocy.UserSettings.stock_decimal_places_prices_input);
	}

	var jsonData = {};
	jsonData.amount = jsonForm.amount;
	jsonData.best_before_date = Grocy.Components.DateTimePicker.GetValue();
	jsonData.purchased_date = Grocy.Components.DateTimePicker2.GetValue();
	jsonData.note = jsonForm.note;
	if (Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING)
	{
		jsonData.shopping_location_id = Grocy.Components.ShoppingLocationPicker.GetValue();
	}
	if (Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING)
	{
		jsonData.location_id = Grocy.Components.LocationPicker.GetValue();
	}
	else
	{
		jsonData.location_id = 1;
	}
	jsonData.price = price;

	jsonData.open = $("#open").is(":checked");

	Grocy.Api.Put("stock/entry/" + Grocy.EditObjectRowId, jsonData,
		function(result)
		{
			Grocy.Components.UserfieldsForm.Save(function()
			{
				var successMessage = __t('Stock entry successfully updated') + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoStockBookingEntry(\'' + result.id + '\',\'' + Grocy.EditObjectRowId + '\')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>';

				window.parent.postMessage(WindowMessageBag("StockEntryChanged", Grocy.EditObjectRowId), Grocy.BaseUrl);
				window.parent.postMessage(WindowMessageBag("ShowSuccessMessage", successMessage), Grocy.BaseUrl);
				window.parent.postMessage(WindowMessageBag("Ready"), Grocy.BaseUrl);
				window.parent.postMessage(WindowMessageBag("CloseAllModals"), Grocy.BaseUrl);
			});
		},
		function(xhr)
		{
			Grocy.FrontendHelpers.EndUiBusy("stockentry-form");
			console.error(xhr);
		}
	);
});

Grocy.FrontendHelpers.ValidateForm('stockentry-form');

$('#stockentry-form input').keyup(function(event)
{
	Grocy.FrontendHelpers.ValidateForm('stockentry-form');
});

$('#stockentry-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Grocy.FrontendHelpers.ValidateForm('stockentry-form'))
		{
			return false;
		}
		else
		{
			$('#save-stockentry-button').click();
		}
	}
});

Grocy.Components.DateTimePicker.GetInputElement().on('change', function(e)
{
	Grocy.FrontendHelpers.ValidateForm('stockentry-form');
});

Grocy.Components.DateTimePicker.GetInputElement().on('keypress', function(e)
{
	Grocy.FrontendHelpers.ValidateForm('stockentry-form');
});

Grocy.Components.DateTimePicker2.GetInputElement().on('change', function(e)
{
	Grocy.FrontendHelpers.ValidateForm('stockentry-form');
});

Grocy.Components.DateTimePicker2.GetInputElement().on('keypress', function(e)
{
	Grocy.FrontendHelpers.ValidateForm('stockentry-form');
});

Grocy.Api.Get('stock/products/' + Grocy.EditObjectProductId,
	function(productDetails)
	{
		$('#amount_qu_unit').text(productDetails.quantity_unit_stock.name);
	},
	function(xhr)
	{
		console.error(xhr);
	}
);

$("#amount").on("focus", function(e)
{
	$(this).select();
});

Grocy.Components.UserfieldsForm.Load();
setTimeout(function()
{
	$('#amount').focus();
}, 250);
Grocy.FrontendHelpers.ValidateForm("stockentry-form");
