// ==UserScript==
// @name         SimpleMMO Bot
// @namespace    UnKnoWnCheaTs
// @version      0.1.0
// @description  Feature-rich bot for the browser-based game SimpleMMO.
// @author       rogerxiii
// @match        https://web.simple-mmo.com/*
// @runat        document-end
// @grant        none
// ==/UserScript==

var G_VERSION = "0.1.0";
var welcome_footer = document.getElementsByClassName("kt-portlet__foot");
if (welcome_footer.length > 0) welcome_footer[welcome_footer.length - 1].innerHTML += "<br>SimpleMMO-Bot v" + G_VERSION + " by rogerxiii";



/*
	Menu
*/

// First we create the modal that pops up whenever you click on an option
var modal = document.createElement("div");
modal.setAttribute("id", "bot_modal");
modal.style.display = "none"; // Hidden by default of course
modal.style.position = "fixed";
modal.style.zIndex = 1;
modal.style.left = 0;
modal.style.top = 0;
modal.style.width = "100%";
modal.style.height = "100%";
modal.style.overflow = "auto";
modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

var modal_content = document.createElement("div");
modal_content.setAttribute("id", "bot_modal_content");
modal_content.style.textAlign = "center";
modal_content.style.backgroundColor = "#fefefe";
modal_content.style.margin = "20% auto";
modal_content.style.padding = "20px";
modal_content.style.border = "2px solid black";
modal_content.style.borderRadius = "8px";
modal_content.style.width = "500px";
modal_content.has_changed = false;

modal.appendChild(modal_content);
document.body.appendChild(modal);

// Constructor for a menu item object
// "default_states" contains stringified identifiers and their default values
// These can be accessed by ITEM.values.IDENTIFIER, i.e., item.values.Enabled or item.values["Enabled"] if they have spaces
// "tooltips" are the descriptions of the options with the same identifiers as the states
var new_y = 0;
var menu_items = [];
function menu_item(name, default_states, tooltips)
{
	//Here we deal with changes in structure due to updates. We try to keep as many settings as possible
	var version = localStorage.getItem("version");
	var states = localStorage.getItem(name);

	if (version !== G_VERSION || states === null)
	{
		// We try to salvage whatever settings are possible
		if (states !== null)
		{
			var old_states = JSON.parse(states);
			for (let key in old_states)
				// Check to make sure we don't add obsolete variables
				if (default_states[key] !== null && typeof(default_states[key]) != "undefined") default_states[key] = old_states[key];
		}

		states = JSON.stringify(default_states);
		localStorage.setItem(name, states);
	}

	this.name = name;
	this.values = JSON.parse(states);
	this.temp_values = null;

	var btn = document.createElement("button");
	btn.setAttribute("id", name);
	btn.values = this.values;
	btn.innerHTML = name + " Options";
	btn.addEventListener("click", callback_menu.bind(this, tooltips));

	btn.style.position = "fixed";
	btn.style.left = "0px";
	btn.style.top = new_y + "px";
	btn.style.height = "30px";
	btn.style.width = "150px";
	btn.style.zIndex = 1;

	menu_items.push(this);
	document.body.appendChild(btn);
	new_y = parseInt(btn.style.top) + 30;
}

// Callback for a main option button click
// The this pointer is actually that of the parent
function callback_menu(tooltips)
{
	modal.style.display = "block";
	modal_content.innerHTML = "";

	var header = document.createElement("span");
	header.style.fontSize = "25px";
	header.innerHTML = this.name + " Options";
	modal_content.appendChild(header);
	modal_content.innerHTML += "<br><br>";

	var values = (this.temp_values !== null ? this.temp_values : this.values);
	for (let key in values)
	{
		var type = typeof(values[key]);

		if (type == "boolean")
		{
			var btn = document.createElement("button");
			btn.setAttribute("id", this.name + "_" + key);
			btn.style.width = "150px";
			btn.style.color = (values[key] ? "green" : "#919191");
			btn.innerHTML = key; // + (this.values[key] ? " [ON]" : " [OFF]");
			modal_content.appendChild(btn);
		}
		else if (type == "number")
		{
			modal_content.innerHTML += key + "&nbsp&nbsp&nbsp";
			var input = document.createElement("input");
			input.setAttribute("id", this.name + "_" + key);
			input.setAttribute("type", "number");
			input.setAttribute("value", values[key]);
			input.style.width = "75px";
			input.style.textAlign = "center";
			modal_content.appendChild(input);
		}
		else if (type == "string")
		{
			modal_content.innerHTML += key + "&nbsp&nbsp&nbsp";
			var input = document.createElement("input");
			input.setAttribute("id", this.name + "_" + key);
			input.setAttribute("value", values[key]);
			input.style.textAlign = "center";
			modal_content.appendChild(input);
		}

		modal_content.innerHTML += "&nbsp&nbsp&nbsp&nbsp";

		if (tooltips[key])
		{
			var tooltip = document.createElement("div");
			tooltip.setAttribute("id", this.name + "_" + key + "_" + "tooltip");
			tooltip.style.position = "absolute";
			tooltip.style.display = "inline-block";
			tooltip.style.border = "1px dotted black";
			tooltip.style.padding = "2px 5px";
			tooltip.innerHTML = "?";

			var tooltip_text = document.createElement("span");
			tooltip_text.setAttribute("id", "tooltip");
			tooltip_text.setAttribute("id", this.name + "_" + key + "_" + "tooltip_text");
			tooltip_text.innerHTML = tooltips[key];
			tooltip_text.style.visibility = "hidden";
			tooltip_text.style.width = "350px";
			tooltip_text.style.backgroundColor = "#555555";
			tooltip_text.style.color = "white";
			tooltip_text.style.textAlign = "center";
			tooltip_text.style.borderRadius = "6px";
			tooltip_text.style.padding = "5px";
			tooltip_text.style.position = "absolute";
			tooltip_text.style.zIndex = 1;
			tooltip_text.style.bottom = "100%";

			tooltip.appendChild(tooltip_text);
			modal_content.appendChild(tooltip);
		}

		modal_content.innerHTML += "<br><br>";
	}

	// For some reason adding the event listeners doesn't work in the same loop
	for (let key in this.values)
	{
		var ele = document.getElementById(this.name + "_" + key);
		var type = typeof(this.values[key]);
		if (type == "boolean") ele.addEventListener("click", callback_menu_item.bind(this, key, ele, type));
		else if (type == "number" || type == "string") ele.addEventListener("change", callback_menu_item.bind(this, key, ele, type));

		if (tooltips[key])
		{
			var tooltip = document.getElementById(this.name + "_" + key + "_" + "tooltip");
			tooltip.addEventListener("mouseenter", function() { this.children[0].style.visibility = "visible"; });
			tooltip.addEventListener("mouseleave", function() { this.children[0].style.visibility = "hidden"; });
		}
	}
}

// Callback for an option entry in the popup modal
// The this pointer is still that of the uppermost parent
function callback_menu_item(key, ele, type)
{
	modal_content.has_changed = true;

	// This *should* be fine, since we don't have any references we don't need to deep clone
	// The reason for doing it this way is so that the options will only take effect after the modal is closed
	if (this.temp_values === null) this.temp_values = Object.assign({}, this.values);

	if (type == "boolean")
	{
		this.temp_values[key] = !this.temp_values[key];
		ele.style.color = (this.temp_values[key] ? "green" : "#919191");
		//btn.innerHTML = key + (this.values[key] ? " [ON]" : " [OFF]");
	}
	else if (type == "number")
	{
		var num = parseInt(ele.value);
		if (!isNaN(num)) this.temp_values[key] = num;
	}
	else if (type == "string")
	{
		var str = ele.value;
		if (str) this.temp_values[key] = str;
	}
}

// The actual menu items
var Autostep = new menu_item("Autostep", {"Enabled":false}, {});
var Autobattle = new menu_item("Autobattle", {"Enabled":true, "Health Percent Threshold":50, "Auto Battle Arena":false},
					{"Enabled":"Automatically fights battles when you're on a battle screen or when you encounter one on your travels.",
					"Health Percent Threshold":"If you are under this percentage of health, no battles will be started regardless of other settings."});
var Autoquest = new menu_item("Autoquest", {"Enabled":false, "Minimum Percentage":100, "Only Uncompleted":true},
					{"Minimum Percentage":"The minimum percentage a quest needs to have before attempting it.<br>If multiple quests are possible, then the one with the highest level is chosen.",
					"Only Uncompleted":"Only perform quests that have not been completed yet."});
var Autojob = new menu_item("Autojob", {"Enabled":false, "Only When Finished":true, "Job Amount":0},
					{"Only When Finished":"The bot will only start a job when you are out of steps, energy and quests (given the amount below).",
					"Job Amount":"The amount of jobs the bot will perform. If 'Only When Finished' is disabled, then bot will be automatically turned off when this amount has been reached.<br>" +
					"Set to -1 for infinite jobs (for when you're asleep, gone, etc.)."});

var Marketbot = new menu_item("Market Bot", {"Enabled":false, "Item Name Filter":"", "Max Price":-1, "Min Level":-1, "Max Level":-1, "Amount":0, "Fast Mode":true},
					{"Max Price":"Set to -1 for any price.", "Min Level":"Set to -1 or 0 for no minimum level.", "Max Level":"Set to -1 for no maxmimum level.",
					"Amount":"Market bot will turn off when this amount has been reached or you don't have enough gold.<br>Set to -1 for as many as you can afford.",
					"Fast Mode":"The game added a limit to requests, using fast mode will make you unable to use other features without getting ratelimited.<br>" + 
					"When it's on, the bot checks for items every 3-4 seconds, when it's off it checks every 8-10 seconds."});
var General = new menu_item("General", {"Master Switch":true, "World Boss Timer":true},
					{"Master Switch":"Regardless of other settings, if this is disabled the bot does nothing.",
					"World Boss Timer":"Shows a timer in the top right of the window for when the next world boss is attackable."});



/*
	Features
*/

var player_data = {health_percent:-1, health:-1, max_health:-1, exp_remaining:-1, exp_percent:-1, exp:-1, max_exp:-1,
					energy_percent:-1, energy:-1, max_energy:-1, gold:-1, diamonds:-1, quest_points:-1, steps:-1};

add_event_listeners();
main();

function main()
{
	localStorage.setItem("version", G_VERSION);
	status_box_create();
	status_box_general_message("[SimpleMMO-Bot by rogerxiii]", "#000000");

	if (!General.values["Master Switch"])
	{
		status_box_general_message("Master switch turned off. Bot is idle.", "red");
		return;
	}
	
	// Get player data every half second, the boss timer and market bot all regardless of work
	update_player_data();
	boss_timer();
	market_bot();

	// Don't do anything while we're working
	if (document.documentElement.innerHTML.indexOf("You are currently working") != -1)
	{
		var str = document.documentElement.innerHTML;
		var begin = str.indexOf("Your work will finish in ");
		var time = parseInt(str.substr(begin + 25, str.indexOf(" minute", begin) - begin - 25));

		// It always takes a bit before the work status actually updates after we're done working
		if (time <= 0)
		{
			time = 10000;
			status_box_general_message("Job done! Waiting for processing...", "green");
		} else
		{
			time = time * 60000;
			status_box_general_message("Currently working. Bot is idle.", "red");
			status_box_update(Autojob, "Currently working.", "green");
			status_box_timer(Autojob, (new Date()).getTime() + time, "green");
		}

		setTimeout( function() { location.reload(); }, time);
		return;
	}
	
	// Actual bot features
	do_job();
	do_step();
	do_battle();
	do_quest();
}

function do_job(id = -1)
{
	if (!Autojob.values["Enabled"] || !General.values["Master Switch"] || 
		document.documentElement.innerHTML.indexOf("You are currently working") != -1) return;
	else if (player_data.steps == -1) { setTimeout(do_job, 500); return; }

	// We start a job if "Only When Finished" is off when the bot is enabled and there's jobs to do
	if (!Autojob.values["Only When Finished"] && Autojob.values["Job Amount"] == 0) 
	{
		// We also turn off the bot when amount has reached 0
		Autojob.values["Enabled"] = false;
		localStorage.setItem("Autojob", JSON.stringify(Autojob.values));
		return;
	}
	
	// We start a job if "Only When Finished" is on when the bot is enabled and nothing is being done with the other bots
	else if (Autojob.values["Only When Finished"])
	{
		if ( (Autostep.values["Enabled"] && player_data.steps > 0) ||
			(Autobattle.values["Enabled"] && Autobattle.values["Auto Battle Arena"] && player_data.energy > 0) ||
			(Autoquest.values["Enabled"] && player_data.quest_points > 0) )
			{ 
				setTimeout(do_job, 4000); 
				return;
			}
	}

	// First we need the job ID of the currently active job
	if (id == -1)
	{
		status_box_update(Autojob, "Starting new work job...", "green");
		
		var xhr = new XMLHttpRequest();
		xhr.addEventListener("load", get_job_id);
		xhr.open("GET", "/jobs/viewall");
		xhr.send();
		
		function get_job_id(event)
		{
			if (!handle_errors(event, "Autojob ratelimited at getting job ID", "Failed to get job id", do_job)) return;
			
			var doc = (new DOMParser()).parseFromString(event.target.response, "text/html");
			var link = doc.getElementsByClassName("btn-success")[0].href;
			var id = link.substr(link.lastIndexOf("/" + 1));
			do_job(id);
		}
		
		return;
	}

	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", perform_job);
	xhr.open("GET", "/jobs/view/" + id);
	xhr.send();

	function perform_job(event)
	{
		if (!handle_errors(event, "Autojob ratelimited at performing job", "Failed to perform job", do_job)) return;
		
		// Find the job id and what the maximum number of jobs that we can perform is
		var doc = (new DOMParser()).parseFromString(event.target.response, "text/html").documentElement.innerHTML;
		var begin = doc.indexOf("max: ");
		var max = (parseInt(doc.substr(begin + 5, doc.indexOf(',', begin) - begin - 5)));

		// Decide what to perform based on user settings
		var amount;
		if (Autojob.values["Job Amount"] == -1) amount = 2;	// Do 2 jobs at a time so that the user can quit at any time without having to wait an hour+
		else //if (Autojob.values["Job Amount"] > 0)
		{
			amount = Math.min(Autojob.values["Job Amount"], max);
			Autojob.values["Job Amount"] -= amount;
		}

		// Turn off the bot if we're done after this
		if (!Autojob.values["Only When Finished"] && Autojob.values["Job Amount"] == 0) Autojob.values["Enabled"] = false;
		localStorage.setItem("Autojob", JSON.stringify(Autojob.values));

		// Perform!
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/api/job/perform/" + id + "/" + amount, true);
		xhr.addEventListener("load", function(event) { location.href = location.origin; });	// Refresh the page when done, to update status box
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({ '_token': document.getElementsByName("csrf-token")[0].content, testdata: 'testdatacontent' }));
	}
}

function do_step()
{
	if (!Autostep.values["Enabled"] || !General.values["Master Switch"] ||
		document.documentElement.innerHTML.indexOf("You are currently working") != -1) return;
	else if (player_data.steps == -1) { setTimeout(do_step, 500); return; }

	else if (player_data.steps <= 0)
	{
		status_box_update(Autostep, "Ran out of steps...", "red");
		setTimeout(do_step, 2000);
		return;
	}
	
	// Perform the step / send the request
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", step_result);
	xhr.open("POST", "/travel/get/travel", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({ '_token': document.getElementsByName("csrf-token")[0].content, testdata: 'testdatacontent' }));
	
	function step_result(event)
	{
		if (!handle_errors(event, "Autostep ratelimited", "Autostep failed", do_step)) return;
		
		status_box_update(Autostep, "Walked one step - ", "green");
		var res = JSON.parse(event.target.response);

		// Attack is available
		if (Autobattle.values["Enabled"] && res.text.indexOf("Attack") != -1)
		{
			var begin = res.text.indexOf("<a class='cta' href='/npcs/attack");
			var url = res.text.substr(begin + 21, res.text.indexOf("' onclick") - begin - 21);
			begin = res.text.indexOf("showNPC('");
			var enemy = res.text.substr(begin + 9, res.text.indexOf("','", begin) - begin - 9);

			if (parseInt(document.getElementById("health_percent").innerHTML) > Autobattle.values["Health Percent Threshold"])
			{
				status_box_update(Autostep, "Fight encounter!", "green", true);
				queue_fight(url, enemy, "travel");
			}
			else status_box_update(Autostep, "Skipping encounter fight due to low health.", "red", true);
		}

		// We found an item
		else if (res.rewardType == "item")
		{
			var begin = res.resultText.indexOf(">", res.resultText.indexOf("id='item-id"));
			var item = res.resultText.substr(begin + 1, res.resultText.indexOf("</span>") - begin - 1);
			status_box_update(Autostep, "Found item '" + item + "'!", "green", true);
			_log("Found item '" + item + "' while traveling!");
		}

		// Got nothing
		else if (res.rewardType == "none") status_box_update(Autostep, (res.rewardAmount == "none") ? "Got nothing... :( &nbsp&nbsp&nbsp&nbsp" : "Ratelimited.", "green", true);

		// Normal step
		else status_box_update(Autostep, "Got " + res.rewardAmount + " " + res.rewardType + ".", "green", true);

		status_box_timer(Autostep, (new Date()).getTime() + (res.nextwait * 1000), "green");
		setTimeout(do_step, res.nextwait * 1000);
	}
	
	
}

// FIFO stack, not the most efficient but the fairest
var fights_queued = [];
function queue_fight(url, enemy, source)
{
	fights_queued.push({"url":url, "enemy":enemy, "source":source});
}

function do_battle()
{
	if (!Autobattle.values["Enabled"] || !General.values["Master Switch"] ||
		document.documentElement.innerHTML.indexOf("You are currently working") != -1) return;
	else if (player_data.energy == -1) { setTimeout(do_battle, 500); return; }
	
	// We take the fight if there is one available
	if (fights_queued.length > 0)
	{
		var fight = fights_queued.shift();
		do_fight(fight.url, fight.enemy, fight.source);
	}
	
	// If not, we add an arena battle to the queue if possible
	else if (Autobattle.values["Auto Battle Arena"])
	{
		if (player_data.energy <= 0) status_box_update(Autobattle, "Ran out of energy...", "red");
		else
		{
			status_box_update(Autobattle, "Generating 'Battle Arena' enemy...", "green");
			
			var xhr = new XMLHttpRequest();
			xhr.addEventListener("load", generate_result);
			xhr.open("POST", "/api/battlearena/generate", true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify({ '_token': document.getElementsByName("csrf-token")[0].content}));
			
			function generate_result(event)
			{
				if (!handle_errors(event, "Auto battle arena ratelimited", "Battle arena generation failed", do_battle)) return;
				
				var res = JSON.parse(event.target.response);
				queue_fight("npcs/attack/" + res.id, res.name, "arena");
			}
		}
		setTimeout(do_battle, 2000);
	}
	
	// If neither, we can hide the status box as we are done for now
	else
	{
		status_box_remove(Autobattle);
		setTimeout(do_battle, 1000);
	}
}

function do_fight(url, enemy, source)
{
	status_box_update(Autobattle, "Fighting '" + enemy + "'... [" + source + "] ", "green");
	
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", attack_result);
	xhr.open("POST", url.replace("attack", "attack/api"), true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({ '_token': document.getElementsByName("csrf-token")[0].content, 'special_attack': "false" }));
	
	function attack_result(event)
	{
		if (!handle_errors(event, "Autobattle ratelimited", "Fight attack failed", do_battle)) return;
		
		var res = JSON.parse(event.target.response);

		if (res.they_are_dead)
		{
			status_box_update(Autobattle, "Battle won against '" + enemy + "'! [" + source + "] ", "green");

			if (res.item_drop)
			{
				var begin = res.item_drop.indexOf(">", res.item_drop.indexOf("id='item-id"));
				var item = res.item_drop.substr(begin + 1, res.item_drop.indexOf("</span>") - begin - 1);
				status_box_update(Autobattle, "The enemy dropped item '" + item + "'!'", "green", true);
				_log("Found item '" + item + "' while fighting!");
			}

			status_box_timer(Autobattle, (new Date()).getTime() + 4000, "green");
			setTimeout(do_battle, 4000);
		}
		else setTimeout(do_fight.bind(this, url, enemy, source), 1000);
	}
}

function do_quest()
{
	if (!Autoquest.values["Enabled"] || !General.values["Master Switch"] ||
		document.documentElement.innerHTML.indexOf("You are currently working") != -1) return;
	else if (player_data.quest_points == -1) { setTimeout(do_quest, 500); return; }
	
	else if (player_data.quest_points <= 0)
	{
		status_box_update(Autoquest, "Ran out of quest points...", "red");
		setTimeout(do_quest, 2000);
		return;
	}
	
	status_box_update(Autoquest, "Finding quest to perform...", "green");
	
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", parse_quests);
	xhr.open("GET", "/quests/viewall");
	xhr.send();
	
	function parse_quests(event)
	{
		if (!handle_errors(event, "Autoquest ratelimited at getting quest list", "Failed getting quest list", do_quest)) return;
		
		var doc = (new DOMParser()).parseFromString(event.target.response, "text/html");
		var quests = doc.getElementsByClassName(("kt-widget5__item"));
		
		for (var i = 0; i < quests.length; ++i)
		{
			// The ID and percentage are very difficult to get, they're inside a script inside the "View Quest" button
			var script = quests[i].getElementsByClassName("btn-info")[0].getAttribute("onclick").split(",");
			var id = script[5];
			var percentage = parseInt(script[2]);
			
			var completed = (quests[i].getElementsByClassName("label-success").length > 0);
			var title = quests[i].getElementsByClassName("kt-widget5__title")[0].innerHTML;
			title = title.substr(1, title.length - 2); // Begins and ends with a newline character
			
			if (percentage >= Autoquest.values["Minimum Percentage"] && (!completed || !Autoquest.values["Only Uncompleted"]))
			{
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("load", perform_quest.bind(this, title));
				xhr.open("POST", "/api/quest/" + id);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify({ '_token': document.getElementsByName("csrf-token")[0].content}));
				
				function perform_quest(title, event)
				{
					if (!handle_errors(event, "Autoquest ratelimited at performing quest", "Failed performing quest", do_quest)) return;
					
					status_box_update(Autoquest, "Performed quest: '" + title + "'!", "green");
					status_box_timer(Autoquest, (new Date()).getTime() + 6000, "green");
					setTimeout(do_quest, 6000);
				}
				
				return;
			}
		}
		
		// No quests meet our needs
		status_box_update(Autoquest, "No suitable quest found!", "red");
		status_box_timer(Autoquest, (new Date()).getTime() + 8000, "red");
		setTimeout(do_quest, 8000);
	}
}

function market_bot()
{
	status_box_remove(Marketbot);
	if (!Marketbot.values["Enabled"] || Marketbot.values["Item Name Filter"].length == 0) return;
	else if (player_data.gold == -1) { setTimeout(market_bot, 500); return; }
	
	else if (Marketbot.values["Max Price"] > player_data.gold || Marketbot.values["Amount"] == 0)
	{
		Marketbot.values["Enabled"] = false;
		localStorage.setItem(Marketbot.name, JSON.stringify(Marketbot.values));
	}		
	
	var amt = Marketbot.values["Amount"];
	status_box_update(Marketbot, "Searching for " + (amt == -1 ? "∞" : amt) + "x '" + Marketbot.values["Item Name Filter"] + "'...", "green");
	
	var url = "/market/all/all?itemname=" + Marketbot.values["Item Name Filter"].replace(/ /g, "+");
	if (Marketbot.values["Max Price"] != -1) url += "&maxprice=" + Marketbot.values["Max Price"];
	if (Marketbot.values["Min Level"] != -1) url += "&minlevel=" + Marketbot.values["Min Level"];
	if (Marketbot.values["Max Level"] != -1) url += "&maxlevel=" + Marketbot.values["Max Level"];
	
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", handle_market_listings);
	xhr.open("GET", url);
	xhr.send();
	
	function handle_market_listings(event)
	{
		if (!handle_errors(event, "Market bot ratelimited at getting market listings", "Market bot failed at getting market listings", market_bot)) return;
		
		var doc = (new DOMParser()).parseFromString(event.target.response, "text/html");
		var listings = doc.getElementsByClassName("fullPanelTwo links")[0].children;
		for (var i = 0; i < listings.length; i+=2)
		{
			if (amt != -1 && --amt < 0) break;
			
			// Don't @ me about this garbage code
			var script = listings[i].getAttribute("onclick").split(",");
			var id = script[script.length - 2];
			
			// Send purchase request
			var xhr = new XMLHttpRequest();
			xhr.addEventListener("load", purchase_check.bind(this, listings[i]));
			xhr.open("POST", "/api/market/buy/" + id);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify({ '_token': document.getElementsByName("csrf-token")[0].content, data: true}));
			
			function purchase_check(listing, event)
			{
				if (!handle_errors(event, "Market bot ratelimited at purchasing item", "Market bot failed at purchasing item", market_bot)) return;
				
				var res = JSON.parse(event.target.response);
				if (res.type == "success")
				{
					var script = listing.getAttribute("onclick").split(",");
					var name = listing.getElementsByClassName("col-xs-8")[0].children[1].innerHTML;
					_log("Succesfully bought item '" + name + "' for " + parseInt(script[2].replace(/'/g, "")).toLocaleString() + " gold from user" + script[3] + "!");
					
					Marketbot.values["Amount"] -= (Marketbot.values["Amount"] == -1 ? 0 : 1);
					localStorage.setItem(Marketbot.name, JSON.stringify(Marketbot.values));
					if (Marketbot.values["Amount"] == 0) return;
				}
			}
		}
		
		// To hopefuly avoid the ratelimiting they added
		if (Marketbot.values["Fast Mode"]) setTimeout(market_bot, random_int(3000, 4000));
		else setTimeout(market_bot, random_int(8000, 10000));
	}
}

function boss_timer()
{
	if (!General.values["World Boss Timer"]) return;
	
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", create_bosstimer_box);
	xhr.open("GET", "/worldbosses");
	xhr.send();
	
	function create_bosstimer_box(event)
	{
		if (!handle_errors(event, "Ratelimited getting World Boss list", "Failed to get World Boss list", boss_timer)) return;
		
		var box = document.createElement("div");
		box.setAttribute("id", "boss_timer");
		box.style.backgroundColor = "white";
		box.style.fontSize = "17px";
		box.style.textAlign = "center";
		box.style.border = "1px solid black";
		box.style.borderTopWidth = "0px";
		box.style.borderRightWidth = "0px";
		box.style.borderRadius = "5px";
		box.style.position = "fixed";
		box.style.right = "0px";
		
		var title = document.createElement("div");
		title.style.padding = "5px 10px";
		title.style.paddingBottom = "0px";
		
		var timer = document.createElement("div");
		timer.style.padding = "5px 10px";
		timer.style.color = "CornflowerBlue";
		
		box.appendChild(title);
		box.appendChild(timer);
		document.body.appendChild(box);
		
		var doc = (new DOMParser()).parseFromString(event.target.response, "text/html");
		if (doc.getElementsByClassName("kt-widget__username").length <= 0)
		{
			title.style.color = "red";
			title.innerHTML = "No world boss available!";
			setTimeout(boss_timer, 10000);
			return;
		}
		
		var boss = doc.getElementsByClassName("kt-widget__username")[0]; // First one is always the next, duh
		var name = boss.innerHTML.substr(1, boss.innerHTML.indexOf("<span") - 2); // First character is a newline
		var id = boss.href.substr(boss.href.lastIndexOf('/') + 1);

		// The target time is in a pre-generated script, hopefully this structure won't change, lot of magic numbers/strings
		// And of course the structure is different while working...
		var script;
		if (document.documentElement.innerHTML.indexOf("You are currently working") != -1) script = doc.getElementsByClassName("container-two")[0].children[0].children[3].text;
		else script = doc.getElementsByClassName("container-two")[0].children[2].text;
		
		var target_time = script.substr(script.indexOf("=") + 2, script.indexOf("*") - script.indexOf("=") - 2); // *should* be the variable defined on the first line
		target_time = parseInt(target_time) * 1000;
		var time = get_time_remaining(target_time);
		
		title.innerHTML = "Next world boss is '" + name + "'.";
		timer.innerHTML = "Attackable in ";
		timer.innerHTML += (time.days > 0 ? (time.days + "d ") : "");
		timer.innerHTML += (time.hours > 0 ? (time.hours + "h ") : "");
		timer.innerHTML += (time.minutes > 0 ? (time.minutes + "m ") : "");
		timer.innerHTML += time.seconds + "s.";
		
		setTimeout(boss_timer_tick.bind(this, target_time), 1000);
	}
}

function boss_timer_tick(target)
{
	var timer = document.getElementById("boss_timer").children[1];
	if ((target - (new Date()).getTime()) > 0)
	{
		var time = get_time_remaining(target);
		timer.innerHTML = "Attackable in ";
		timer.innerHTML += (time.days > 0 ? (time.days + "d ") : "");
		timer.innerHTML += (time.hours > 0 ? (time.hours + "h ") : "");
		timer.innerHTML += (time.minutes > 0 ? (time.minutes + "m ") : "");
		timer.innerHTML += time.seconds + "s.";
		setTimeout(boss_timer_tick.bind(this, target), 1000);
		
	} else
	{
		timer.color = "green";
		timer.innerHTML = "Attackable now!";
	}
}



/*
	Helper Functions & Event Listeners
*/

function handle_errors(event, ratelimit_message, failed_message, callback)
{
	if (event.target.status == 429)
	{
		_log(ratelimit_message + ", waiting 10s.", "red");
		setTimeout(callback, 10000);
		return false;
	}
	
	else if (event.target.status != 200)
	{
		_log(failed_message + "! Status code = " + event.target.status, "red");
		console.log(event);
		setTimeout(callback, 10000);
		return false;
	}
	
	return true;
}

function get_time_remaining(target)
{
	var time = target - (new Date()).getTime();

	var result = {};
	result.days = Math.floor(time / (1000 * 60 * 60 * 24));
	result.hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	result.minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
	result.seconds = Math.floor((time % (1000 * 60)) / 1000);

	return result;
}

function update_player_data()
{
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", parse_data);
	xhr.open("GET", location.origin);
	xhr.send();
	
	// This call also seems to not be affected by the global ratelimiting
	function parse_data(event)
	{
		if (!handle_errors(event, "Getting player data ratelimited", "Failed getting player data", do_battle)) return;

		var doc = (new DOMParser()).parseFromString(event.target.response, "text/html");
		
		player_data.health_percent = parseInt(doc.getElementById("health_percent").innerHTML.replace(/,/g, ""));
		player_data.health = parseInt(doc.getElementById("current_health").innerHTML.replace(/,/g, ""));
		player_data.max_health = parseInt(doc.getElementById("max_health").innerHTML.replace(/,/g, ""));
		player_data.exp_remaining = parseInt(doc.getElementById("exp_remaining").innerHTML.replace(/,/g, ""));
		player_data.exp_percent = parseInt(doc.getElementById("exp_percent").innerHTML.replace(/,/g, ""));
		player_data.exp = parseInt(doc.getElementById("current_exp").innerHTML.replace(/,/g, ""));
		player_data.max_exp = parseInt(doc.getElementById("max_exp").innerHTML.replace(/,/g, ""));
		player_data.energy_percent = parseInt(doc.getElementById("energy_percent").innerHTML.replace(/,/g, ""));
		player_data.energy = parseInt(doc.getElementById("current_energy").innerHTML.replace(/,/g, ""));
		player_data.max_energy = parseInt(doc.getElementById("max_energy").innerHTML.replace(/,/g, ""));
		player_data.gold = parseInt(doc.getElementById("current_gold").innerHTML.replace(/,/g, ""));
		player_data.diamonds = parseInt(doc.getElementById("current_diamonds").innerHTML.replace(/,/g, ""));
		player_data.quest_points = parseInt(doc.getElementById("current_quest_points").innerHTML.replace(/,/g, ""));
		player_data.steps = parseInt(doc.getElementById("current_steps").innerHTML.replace(/,/g, ""));

		// Update the values on the current page
		document.getElementById("health_percent").innerHTML = player_data.health_percent.toLocaleString();
		document.getElementById("current_health").innerHTML = player_data.health.toLocaleString();
		document.getElementById("max_health").innerHTML = player_data.max_health.toLocaleString();
		document.getElementById("exp_remaining").innerHTML = player_data.exp_remaining.toLocaleString();
		document.getElementById("exp_percent").innerHTML = player_data.exp_percent.toLocaleString();
		document.getElementById("current_exp").innerHTML = player_data.exp.toLocaleString();
		document.getElementById("max_exp").innerHTML = player_data.max_exp.toLocaleString();
		document.getElementById("energy_percent").innerHTML = player_data.energy_percent.toLocaleString();
		document.getElementById("current_energy").innerHTML = player_data.energy.toLocaleString();
		document.getElementById("max_energy").innerHTML = player_data.max_energy.toLocaleString();
		document.getElementById("current_gold").innerHTML = player_data.gold.toLocaleString();
		document.getElementById("current_diamonds").innerHTML = player_data.diamonds.toLocaleString();
		document.getElementById("current_quest_points").innerHTML = player_data.quest_points.toLocaleString();
		document.getElementById("current_steps").innerHTML = player_data.steps.toLocaleString();

		// Update the progress bars
		document.getElementById("health_percent_bar").style.width = (player_data.health_percent + "%");
		document.getElementById("exp_percent_bar").style.width = (player_data.exp_percent + "%");
		document.getElementById("energy_percent_bar").style.width = (player_data.energy_percent + "%");

		setTimeout(update_player_data, 500);
	}
}

function random_int(min, max)
{
	return Math.floor(Math.random() * ((max + 1) - min)) + min;
}

function status_box_create()
{
	var box = document.createElement("div");
	box.setAttribute("id", "bot_status");
	box.style.backgroundColor = "white";
	box.style.textAlign = "center";
	box.style.border = "1px solid black";
	box.style.borderBottomWidth = "0px";
	box.style.borderRadius = "5px";
	box.style.position = "fixed";
	box.style.bottom = "0px";

	// The first child will always be one without a title, for general messages
	var general = document.createElement("div");
	general.style.fontSize = "17px";
	general.style.padding = "5px 10px";

	box.appendChild(general);
	document.body.appendChild(box);
}

function _log(text, color="green")
{
	console.log("%c[BOT]%c " + text, "color:blue;", "color:" + color + ";");
}

function status_box_add(menu_item, text, text_color)
{
	// Every div inside the box has a title div and a contents span in that order
	// So we can access and change them with .children[0] and ..children[0] respectively
	// There's also a second child for the title div containing a potential timer if needed
	var item = document.createElement("div");
	item.setAttribute("id", ("status_box_" + menu_item.name).replace(" ", "_"));

	var title = document.createElement("div");
	title.style.fontSize = "17px";
	title.style.paddingLeft = "10px";
	title.style.paddingBottom = "5px";
	title.innerHTML = menu_item.name + ": ";

	var content = document.createElement("span");
	content.style.fontSize = "15px";
	content.style.color = text_color;
	content.innerHTML = text;

	var timer = document.createElement("span");
	timer.style.fontSize = "15px";
	timer.style.paddingRight = "10px";
	timer.style.color = text_color;

	title.appendChild(content);
	title.appendChild(timer);
	item.appendChild(title);
	document.getElementById("bot_status").appendChild(item);

	status_box_resize();
	return item;
}

function status_box_update(menu_item, text, text_color, append = false)
{
	var item = document.getElementById(("status_box_" + menu_item.name).replace(" ", "_"));
	if (item === null) item = status_box_add(menu_item, text, text_color);
	else
	{
		var content = item.children[0].children[0];
		content.style.color = text_color;
		content.innerHTML = (append ? (content.innerHTML + text) : text);
	}

	status_box_resize();
}

function status_box_remove(menu_item)
{
	var item = document.getElementById(("status_box_" + menu_item.name).replace(" ", "_"));
	if (item !== null) item.parentNode.removeChild(item);
}

function status_box_general_message(text, text_color, append = false)
{
	var item = document.getElementById("bot_status").children[0];
	item.style.color = text_color;
	item.innerHTML = (append ? (item.innerHTML + text) : text);

	status_box_resize();
}

var timer_timeouts = {};
function status_box_timer(menu_item, target_time, text_color)
{
	if (timer_timeouts[menu_item.name] !== null) clearTimeout(timer_timeouts[menu_item.name]);
	status_box_timer_tick(menu_item, target_time, text_color);
}

function status_box_timer_tick(menu_item, target_time, text_color)
{
	var item = document.getElementById(("status_box_" + menu_item.name).replace(" ", "_"));
	if (item === null) return; // No need for a timer when the status box entry has been removed
	
	var times = get_time_remaining(target_time);
	
	var timer = item.children[0].children[1];
	timer.style.color = text_color;
	timer.innerHTML = " (wait ";
	timer.innerHTML += (times.days > 0 ? (times.days + "d ") : "");
	timer.innerHTML += (times.hours > 0 ? (times.hours + "h ") : "");
	timer.innerHTML += (times.minutes > 0 ? (times.minutes + "m ") : "");
	timer.innerHTML += times.seconds + "s)";

	if ((target_time - (new Date()).getTime()) > 0) timer_timeouts[menu_item.name] = setTimeout(status_box_timer_tick.bind(this, menu_item, target_time, text_color), 500);
	else 
	{
		timer.innerHTML = "";
		timer_timeouts[menu_item.name] = null;
	}
}

function status_box_resize()
{
	var box = document.getElementById("bot_status");
	if (box) box.style.left = ((document.body.clientWidth / 2) - (box.clientWidth / 2)) + "px";
}

function onresize_callback()
{
	status_box_resize();
}

function onclick_callback(event)
{
	if (event.target.id == "bot_modal")
	{
		// We apply our settings (if changed)
		if (modal_content.has_changed)
		{
			modal_content.has_changed = false;
			for (var i = 0; i < menu_items.length; ++i)
			{
				var item = menu_items[i];
				if (item.temp_values !== null)
				{
					item.values = Object.assign({}, item.temp_values);
					item.temp_values = null;
					localStorage.setItem(item.name, JSON.stringify(item.values));
				}
			}

			// We should also refresh the page to make sure all settings are applied
			location.href = location.origin;
		}
		modal.style.display = "none";
	}
}

function add_event_listeners()
{
	window.addEventListener("resize", onresize_callback);
	window.addEventListener("click", onclick_callback);
}
