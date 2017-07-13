var data, table, linkedTable;
try{
	data = JSON.parse(localStorage.getItem("data"));
}
catch(ex){
	console.log("Cannot parse localstorage", ex);
	//Data does not exist!
}

console.log("Loading [main.js]");
if(data == undefined){
	data = {"entries": []};
}

var DATA_SAVED = true;

function SaveData(){
	console.log("Saving..." , data);
	localStorage.setItem("data", JSON.stringify(data));
}

var myTimer = setInterval(function(){
	if(!document.hasFocus() && !DATA_SAVED){
		SaveData();
		DATA_SAVED = true;
	}
	else if(document.hasFocus()){
		DATA_SAVED = false;	
	}
}, 1000);

$(document).ready(function(){
	$("#newItem").find("table").find("td").css("padding", "10px");
	table = $("#mainTable");
	linkedTable = $("#linkedTable");
	linkedTable.css("display", "none");
	BuildTable(data); //Overview
	BuildLinkedTable(); //Linked Items

	$(".menuButton").on("click", function(){
		$(".menuButton").removeClass("active");
		$(this).toggleClass("active");
	});
	$("#divLinked").on("click", function(){
		table.css("display", "none");
		linkedTable.css("display", "inline-table");//"block");
		$("#searchItem").css("display", "none");
	});

	$("#divAll").on("click", function(){
		table.css("display", "inline-table");//, "block");
		linkedTable.css("display", "none");
		$("#searchItem").css("display", "none");
	});
	$("#divSearch").on("click", function(){
		table.css("display", "none");
		linkedTable.css("display", "none");
		$("#searchItem").css("display", "block");
	});

	$("#newItem").on("submit", function(e){
		console.log(data);
		e.preventDefault();
		var form = $("#newItem");
		var amount = form.find("input[name=itemAmount]").val();
		var name = form.find("input[name=itemName]").val();
		var cost = form.find("input[name=cost]").val();
		var bors = form.find("input[name=bors]:checked").val();
		if(	
			amount == "" || 
			amount == undefined || 
			name == "" || 
			name == undefined ||
			bors == "" ||
			bors == undefined ||
			cost == "" ||
			cost == undefined
		){
			alert("An error occured..");
			return;
		}
		amount = amount.replace(/k/i, "000");
		amount = amount.replace(/m/i, "000000");
		amount = amount.replace(/\D+/, "");
		amount = parseInt(amount);
		cost = cost.replace(/k/i, "000");
		cost = cost.replace(/m/i, "000000");
		cost = cost.replace(/\D+/, "");
		cost = parseInt(cost);
		if(typeof(amount) != "number"){
			console.log("Something went wrong when trying to convert amount into a number!");
			console.log("Type: ", typeof amount);
			console.log("VALUE: " + amount);
		}
		if(typeof(cost) != "number"){
			console.log("Something went wrong when trying to convert cost into a number!");
			console.log("Type: ", typeof cost);
			console.log("VALUE: " + cost);
		}

		var d = new Date();
		var mon = d.getMonth() + 1;
		if(mon < 10){mon = "0" + mon;}
		var day = d.getDate();
		if(day < 10){day = "0" + day;}
		var hour = d.getHours();
		if(hour < 10){hour = "0" + hour;}
		var minute = d.getMinutes();
		if(minute < 10){minute = "0" + minute;}
		var second = d.getSeconds();
		if(second < 10){second = "0" + second;}
		var dateString = d.getFullYear() + "-" + mon + "-" + day + " " + hour + ":" + minute + ":" + second;

		if(!data.Index){data.Index = 0;}
		data.Index++;

		var newObj = {};
		newObj["Amount"] 	= amount;
		newObj["Name"] 		= name;
		newObj["Cost"]		= cost;
		newObj["Date"] 		= dateString;
		newObj["BORS"] 		= bors;
		newObj['ID']   		= data.Index;
		data.entries.push(newObj);

		AddRow(newObj);
	});


});
window.addEventListener("unload", function(){
	console.log("Unload trigger!");
	SaveData();
});

function AddRow(obj){
	var tr = $(document.createElement("tr")).insertAfter(table.children()[0]);
	var td = $(document.createElement("td")).css({"border": "1px solid black", "padding": "10px"});
	td.clone().html(obj.ID).appendTo(tr);
	td.clone().html(obj.Name).appendTo(tr);
	td.clone().html(m(obj.Amount,3)).appendTo(tr);
	td.clone().html(m(obj.Cost, 3)).appendTo(tr);
	td.clone().html(m(Math.floor(obj.Cost / obj.Amount), 3)).appendTo(tr);
	td.clone().html(obj.BORS).appendTo(tr);
	td.clone().html(obj.Date).appendTo(tr);
	var functionsTd  = td.clone().appendTo(tr);
	var remButton = BuildDeleteButton(obj.ID);
	remButton.appendTo(functionsTd);

	var linkButton = BuildLinkButton(obj.ID);
	if(linkButton !== undefined){
		linkButton.appendTo(functionsTd);
	}

}

function BuildLinkButton(ID){
	for(var i=0;i<data.entries.length;i++){
		if(data.entries[i].ID == ID && data.entries[i].Linked > 0){
			return undefined;
		}
	}
	var linkButton = $(document.createElement("button"))
	.attr("id", "button-link-" + ID)
	.css("margin", "5px")
	.text("Link")
	.on("click", function(){
		console.log("Linking...");
		var id = $(this).attr("id").match(/(\d+)$/);
		if(id){id=id[1];}
		else{return;}
		var item = $(this).parent().parent().children()[1].innerHTML;
		var bors = $(this).parent().parent().children()[5].innerHTML;
		var amount = $(this).parent().parent().children()[2].innerHTML;
		if($(this).text() == "Link"){
			var select = $(document.createElement("select")).attr("id", "linkSelect");
			for(var i=0;i<data.entries.length;i++){
				var d = data.entries[i];
				if(d.Name == item && d.ID != id && d.BORS != bors && !d.Linked && m(d.Amount, 3) == amount){
					console.log("MATCH: ", d);
					var opt = $(document.createElement("option")).val(d.ID)
					.html(d.ID + " | x" + d.Amount + " (" + d.Cost + ") " + d.Name)
					.appendTo(select);
				}
				else{
//console.log("d.Name: ", d.Name, " - item: ", item, " - d.ID: ", d.ID, " - id: ", id, " - d.BORS: ", d.BORS, "- bors: ", bors, " - d.Linked: ", d.Linked, " - d.Amount: ", d.Amount, " - amount: ", amount);
				}
			}
			if(select.children().length > 0){
				select.insertAfter($(this));
				$(this).text("Confirm");
			}
			else{
				alert("No items to link!");
				console.log("No other items found!");
			}
			console.log("ITEM: " + item + " | ID: " + id);
		}
		else if($(this).text() == "Confirm"){
			var linkId = $("#linkSelect").find(":selected").val();
			var counter = 0;
			console.log("LINKED ID:" , linkId);
			for(var i=0;i<data.entries.length;i++){
				if(data.entries[i].ID == linkId){
					data.entries[i].Linked = id;
					counter++;
				}
				else if(data.entries[i].ID == id){
					data.entries[i].Linked = linkId;
					counter++;
				}
			}
			if(counter == 2){
				//alert("Linked " + linkId + " to " + id);
				$(this).remove();
				$("#button-link-" + linkId).remove();
				$(this).text("Link");
				$("#linkSelect").remove();
				BuildLinkedTable();
			}
			else{
				alert("Something went wrong when linking " + linkId + " to " + id);
				$(this).text("Link");
				$("#linkSelect").remove();
			}
		}
	});
	return linkButton;
}

function BuildDeleteButton(ID){
	var removeButton = $(document.createElement("button"))
	.attr("id", "button-remove-" + ID)
	.css("margin", "5px")
	.text("Remove")
	.on("click", function(){
		var id = $(this).attr("id").match(/(\d+)$/);
		if(id){id=id[1];}
		else{return;}
		for(var i=0;i<data.entries.length;i++){
			if(data.entries[i].ID == id){
				var d_id = data.entries[i].ID;
				var l_id = data.entries[i].Linked;
				if(d_id !== undefined && l_id !== undefined){
					$("#tr-" + d_id + "-" + l_id).remove();
				}
				data.entries.splice(i, 1);
				i=data.entries.length;
			}
		}
		SaveData();
		$(this).parent().parent().remove();
	});
	return removeButton;
}

function BuildLinkedTable(){
	linkedTable.find("tr").each(function(index, obj){ //Clear table except top row
		if(index > 0){
			linkedTable.find(obj).remove();
		}
	});
	var link_mapper = {};
	for(var i=0;i<data.entries.length;i++){
		var d = data.entries[i];
		if(d.Linked > 0 && link_mapper[d.Linked] === undefined){
			link_mapper[d.Linked] = {};
			link_mapper[d.Linked].ID = d.ID;
			link_mapper[d.Linked].Data = d;
		}
	}

	//console.log(link_mapper);
	var linked = [], obj = {};
	for(var entry in link_mapper){
		var link = link_mapper[entry];
		if(link !== undefined && link_mapper[link.ID] !== undefined){
			var tr = $(document.createElement("tr")).appendTo(linkedTable);
			tr.attr("id", "tr-" + link.ID + "-" + link_mapper[link.ID].ID);
			//console.log("LINKED: ", link_mapper[link.ID].Data, " - ", link.Data);
			var buyCost = link_mapper[link.ID].Data.Cost;
			var sellCost = link.Data.Cost;
			var td = $(document.createElement("td"));
			td.clone().html(link.Data.Name).appendTo(tr);		// Name
			td.clone().html(m(link.Data.Amount, 3)).appendTo(tr); 	// Amount
			td.clone().html(m(sellCost, 3)).appendTo(tr); 		// Sell Cost
			td.clone().html(m(buyCost, 3)).appendTo(tr); 		//Buy Cost
			var profit = parseInt(sellCost) - parseInt(buyCost);
			td.clone().html(m(profit, 3)).appendTo(tr); 			// Total Profit
			td.clone().html(Math.floor(profit / link.Data.Amount)).appendTo(tr);
			//console.log(tr);
			link_mapper[link.ID] = undefined; //Do not make duplicates
		}
	}
	//console.log(link_mapper);
	
	$(linkedTable).css({'border': "1px solid black", "padding": "10px"});
	$(linkedTable).find("td").css({'border': "1px solid black", "padding": "10px"});
	$(linkedTable).find("th").css({'border': "2px solid grey", "padding": "10px"});
	$(linkedTable).html(linkedTable.html().replace(/000000\D/, "M").replace(/000\D/, "k"));
}
function BuildTable(d){
	console.log("Starting to generate table..");
	table.find("tr").each(function(index, obj){ //Clear table except top row
		if(index > 0){
			table.find(obj).remove();
		}
	});
	for(var i=0;i<d.entries.length;i++){
		AddRow(d.entries[i]);
	}

	$(table).css({'border': "1px solid black", "padding": "10px"});
	$(table).find("td").css({'border': "1px solid black", "padding": "10px"});
	$(table).find("th").css({'border': "2px solid grey", "padding": "10px"});
}

//Number formatter (000 => k, 000000 => M)
function m(n,d){
	x=(''+n).length,p=Math.pow,d=p(10,d)
	x-=x%3
	return Math.round(n*d/p(10,x))/d+" kMGTPE"[x/3]
}
