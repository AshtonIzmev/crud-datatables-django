$( document ).ready(function() {

    function datePick() {
        $('input[name="date_written"]').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            locale: {
              format: 'YYYY-MM-DD'
            },
        })
    }

    var fieldsToEdit = [0, 1, 2, 3];
    var fieldNamesToEdit = ['name', 'pages', 'date_written', 'type' ];
    var fieldEditSave = 4;
    var fieldDeleteCancel = 5;
    var typesSelect = ['A', 'B', 'C'];

    var fieldObjectId = 6;
    var fieldCSRFToken = 7;

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

        jqTds[fieldEditSave].innerHTML = '<a class="edit" href="">Save</a>';
        jqTds[fieldDeleteCancel].innerHTML = '<a class="cancel" href="">Cancel</a>';

        for (var i = 0, iLen = fieldsToEdit.length; i < iLen; i++) {
            var f = fieldsToEdit[i];
            if (fieldNamesToEdit[i] == 'type') {
                var result = '';
                 result += '<select class="editable">';
                 for (var j=0, jLen = typesSelect.length; j < jLen; j++) {
                    var sel = (aData[f] == typesSelect[j] ? 'selected' : '');
                    result += '<option ' + sel +' >'+typesSelect[j]+'</option>';
                 }
                 result += '</select>';
                 jqTds[f].innerHTML = result;
            }
            else {
                 jqTds[f].innerHTML = '<input type="text" '+
                    ' class="form-control input-small editable" '+
                    ' name="' + fieldNamesToEdit[i] + '"' +
                    ' value="' + aData[f] + '">';
            }
        }
        datePick();
	}

	function saveRow(oTable, nRow) {
		var jqInputs = $('input.editable, select.editable', nRow);
		for (var i = 0, iLen = fieldsToEdit.length; i < iLen; i++) {
		    var f = fieldsToEdit[i];
		    oTable.fnUpdate(jqInputs[i].value, nRow, f, false);
		}

		oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, fieldEditSave, false);
		oTable.fnUpdate('<a class="delete" href="">Delete</a>', nRow, fieldDeleteCancel, false);
		oTable.fnDraw();
	}

	function cancelEditRow(oTable, nRow) {
		var jqInputs = $('input.editable, select.editable', nRow);
		for (var i = 0, iLen = jqInputs.length; i < iLen; i++) {
			oTable.fnUpdate(jqInputs[i].value, nRow, i, false);
		}	
		oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, fieldEditSave, false);
		oTable.fnDraw();
	}

	var table = $('#datatable');

	var oTable = table.dataTable({
		"dom": 'lBfrtpi',
        "buttons": [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],
		"lengthMenu": [
			[5, 15, 20, -1],
			[5, 15, 20, "All"]
		],
		"pageLength": 15,

		"language": {
			"lengthMenu": " _MENU_ records"
		},
		"columnDefs": [{
			"targets": [0],
			"searchable": false,
			"visible": true,
			"width": "20%"
		}, {
		    "targets": [ 1 ],
            "searchable": false,
            "visible": true,
		}],
		"order": [
			[2, "asc"]
		]
	});

	var tableWrapper = $("#datatable_wrapper");

	tableWrapper.find(".dataTables_length select").select2({
		showSearchInput: false //hide search box with special css class
	}); // initialize select2 dropdown

	var nEditing = null;
	var nNew = false;

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
		var csrfToken = nRow.children[fieldCSRFToken].children[0].defaultValue;
		var objectId = nRow.children[fieldObjectId].innerText;


		if (nEditing !== null && nEditing != nRow) {
			/* Currently editing - but not this row - restore the old before continuing to edit mode */
			restoreRow(oTable, nEditing);
			editRow(oTable, nRow);
			nEditing = nRow;
		} else if (nEditing == nRow && this.innerHTML == "Save") {
			/* Editing this row and want to save it */
			nEditing = null;
			var jqInputs = $('input.editable, select.editable', nRow);
			var dataPost = {};
			for (var i = 0, iLen = jqInputs.length; i < iLen; i++) {
                dataPost[fieldNamesToEdit[i]] = jqInputs[i].value;
            }
            saveRow(oTable, nEditing);

			$.ajax({
              method: "POST",
              url: "/edit/"+objectId,
              data: dataPost,
              beforeSend: function( xhr ) {
                xhr.setRequestHeader("X-CSRFToken", csrfToken);
              }
            })
		} else {
			/* No edit in progress - let's start one */
			editRow(oTable, nRow);
			nEditing = nRow;
		}
	});
});