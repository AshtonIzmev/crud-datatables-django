$( document ).ready(function() {
	function restoreRow(oTable, nRow) {
		var aData = oTable.fnGetData(nRow);
		var jqTds = $('>td', nRow);

		for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
			oTable.fnUpdate(aData[i], nRow, i, false);
		}

		oTable.fnDraw();
	}

	function editRow(oTable, nRow) {
		var aData = oTable.fnGetData(nRow);
		var jqTds = $('>td', nRow);

		for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
			if (i==jqTds.length-2) {
				jqTds[i].innerHTML = '<a class="edit" href="">Save</a>';
			}
			else if (i==jqTds.length-1) {
				jqTds[i].innerHTML = '<a class="cancel" href="">Cancel</a>';
			} else {
				jqTds[i].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[i] + '">';
			}
		}		
	}

	function saveRow(oTable, nRow) {
		var jqInputs = $('input', nRow);
		for (var i = 0, iLen = jqInputs.length; i < iLen; i++) {
			oTable.fnUpdate(jqInputs[i].value, nRow, i, false);
		}
		oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, jqInputs.length, false);
		oTable.fnUpdate('<a class="delete" href="">Delete</a>', nRow, jqInputs.length+1, false);
		oTable.fnDraw();
	}

	function cancelEditRow(oTable, nRow) {
		var jqInputs = $('input', nRow);
		for (var i = 0, iLen = jqInputs.length; i < iLen; i++) {
			oTable.fnUpdate(jqInputs[i].value, nRow, i, false);
		}	
		oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, jqInputs.length, false);
		oTable.fnDraw();
	}

	var table = $('#datatable');

	var oTable = table.dataTable({
		"dom": 'lBfrtip',
        "buttons": [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],
		"lengthMenu": [
			[5, 15, 20, -1],
			[5, 15, 20, "All"] // change per page values here
		],
		// set the initial value
		"pageLength": 15,

		"language": {
			"lengthMenu": " _MENU_ records"
		},
		"columnDefs": [{ // set default column settings
			'orderable': true,
			'targets': [0]
		}, {
			"searchable": true,
			"targets": [0]
		}],
		"order": [
			[0, "asc"]
		] // set first column as a default sort by asc
	});

	var tableWrapper = $("#datatable_wrapper");

	tableWrapper.find(".dataTables_length select").select2({
		showSearchInput: false //hide search box with special css class
	}); // initialize select2 dropdown

	var nEditing = null;
	var nNew = false;

	$('#datatable_new').click(function (e) {
		e.preventDefault();

		if (nNew && nEditing) {
			if (confirm("Previous row not saved. Do you want to save it ?")) {
				saveRow(oTable, nEditing); // save
				$(nEditing).find("td:first").html("Untitled");
				nEditing = null;
				nNew = false;

			} else {
				oTable.fnDeleteRow(nEditing); // cancel
				nEditing = null;
				nNew = false;
				
				return;
			}
		}

		var aiNew = oTable.fnAddData(['', '', '', '', '', '']);
		var nRow = oTable.fnGetNodes(aiNew[0]);
		editRow(oTable, nRow);
		nEditing = nRow;
		nNew = true;
	});

	// DELETE ACTION
	table.on('click', '.delete', function (e) {
		e.preventDefault();

		if (confirm("Are you sure to delete this row ?") == false) {
			return;
		}
		var nRow = $(this).parents('tr')[0];
		var csrfToken = nRow.children[1].children[0].defaultValue;
		var objectId = nRow.children[0].innerText;

		oTable.fnDeleteRow(nRow);

		$.ajax({
		  method: "DELETE",
          url: "/delete/"+objectId,
          beforeSend: function( xhr ) {
            xhr.setRequestHeader("X-CSRFToken", csrfToken);
          }
        })
	});

	// CANCEL ACTION
	table.on('click', '.cancel', function (e) {
		e.preventDefault();
		if (nNew) {
			oTable.fnDeleteRow(nEditing);
			nNew = false;
		} else {
			restoreRow(oTable, nEditing);
			nEditing = null;
		}
	});

	// EDIT ACTION
	table.on('click', '.edit', function (e) {
		e.preventDefault();

		/* Get the row as a parent of the link that was clicked on */
		var nRow = $(this).parents('tr')[0];

		if (nEditing !== null && nEditing != nRow) {
			/* Currently editing - but not this row - restore the old before continuing to edit mode */
			restoreRow(oTable, nEditing);
			editRow(oTable, nRow);
			nEditing = nRow;
		} else if (nEditing == nRow && this.innerHTML == "Save") {
			/* Editing this row and want to save it */
			saveRow(oTable, nEditing);
			nEditing = null;
			alert("Updated! Do not forget to do some ajax to sync with backend :)");
		} else {
			/* No edit in progress - let's start one */
			editRow(oTable, nRow);
			nEditing = nRow;
		}
	});
});