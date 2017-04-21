function TransactionSocket() {

}

function Transaction(bitcoins, inputs, outputs, hash) {
	var oAddrArray = [];
	var iAddrArray = [];
	var oAddrArray_f = [];
	var iAddrArray_f = [];

	var toAppend = '<tr';
	var labelstring = 'label-default';

	if(bitcoins > 10) {
		toAppend+=' class="danger"';
		labelstring = 'label-danger';
	} else if(bitcoins > 5) {
		toAppend+= ' class="warning"';
		labelstring = 'label-warning';
	} else if(bitcoins > 1) {
		toAppend+=' class="info"';
		labelstring = 'label-info';
	} else if(bitcoins > 0.5) {
		toAppend+=' class="success"';
		labelstring = 'label-success';
	} 


	toAppend+='><td><a href="http://blockchain.info/tx/' + hash + '">' + hash + '</td>';

	for(var i = 0; i < inputs.length; i++) {
		iAddrArray.push(inputs[i].prev_out.addr);
	}

	$.each(iAddrArray, function(i, el){
    	if($.inArray(el, iAddrArray_f) === -1) iAddrArray_f.push(el);
	});

	toAppend += '<td>';

	for(var i = 0; i < iAddrArray_f.length; i++) {
		toAppend += iAddrArray_f[i] + " <br />";
	}

	toAppend += '</td>';

	for(var j = 0; j < outputs.length; j++) {
		oAddrArray.push(outputs[j].addr)
	}

	$.each(oAddrArray, function(i, el){
    	if($.inArray(el, oAddrArray_f) === -1) oAddrArray_f.push(el);
	});

	toAppend += '<td>';
	for(var i = 0; i < oAddrArray_f.length; i++) {
		toAppend+=oAddrArray_f[i] + " <br />";
	}

	toAppend += '</td>';
	toAppend += '<td><span style="font-size: 16px;" class="label ' + labelstring + '">' + bitcoins + '</td>';
	console.log(oAddrArray_f.length);

	toAppend += '</tr>';

	$('#txTable tr:first').after(toAppend);
}

TransactionSocket.init = function() {
	if (TransactionSocket.connection)
		TransactionSocket.connection.close();

	if ('WebSocket' in window) {
		var connection = new ReconnectingWebSocket('wss://ws.blockchain.info/inv');
		TransactionSocket.connection = connection;

		connection.onopen = function() {
			var newTransactions = {
				"op" : "unconfirmed_sub"
			};

			connection.send(JSON.stringify(newTransactions));
			connection.send(JSON.stringify({
				"op" : "ping_tx"
			}));
		};

		connection.onclose = function() {
			console.log('Blockchain.info: Connection closed');
		};

		connection.onerror = function(error) {
			console.log('Blockchain.info: Connection Error: ' + error);
		};

		connection.onmessage = function(e) {
			var data = JSON.parse(e.data);
			if (data.op == "utx") {
				var transacted = 0;

				for (var i = 0; i < data.x.out.length; i++) {
					transacted += data.x.out[i].value;
				}

				var bitcoins = transacted / 100000000;
				new Transaction(bitcoins, data.x.inputs, data.x.out, data.x.hash);
			} 

		};
	} else {
		console.log("No websocket support.");
	}
};

TransactionSocket.close = function() {
	if (TransactionSocket.connection)
		TransactionSocket.connection.disconnect();
};
