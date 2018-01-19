const {remote, ipcRenderer} = require('electron');
var maximized = false;
var win = remote.getCurrentWindow();

const fs = require('fs');
const path = require('path');
const appDir = path.join(remote.app.getPath('userData'), 'quizbowl');

const jQuery = $ = require('jquery');

var boardpath, teampath;

const DEBUG = true;

if (DEBUG) {
    boardpath = path.join(__dirname, 'samples', 'boards.json');
    teampath = path.join(__dirname, 'samples', 'teams.json');
} else {
    boardpath = path.join(appDir, 'boards.json');
    teampath = path.join(appDir, 'teams.json');
}

if (!fs.existsSync(boardpath)) {
    fs.writeFileSync(boardpath, '[]', 'utf8');
}

if (!fs.existsSync(teampath)) {
    fs.writeFileSync(teampath, '[]', 'utf8');
}

var boarddata = JSON.parse(fs.readFileSync(boardpath, 'utf8'));
var teamdata = JSON.parse(fs.readFileSync(teampath, 'utf8'));

Array.prototype.rando = function () {
    return this[Math.floor(Math.random()*this.length)];
};

var currenttable = null;
var activeteams = [];
var currentscore = null;
for (var i in teamdata) {
    if (teamdata[i].active) {
        activeteams.push(parseInt(i, 10));
    }
}


ipcRenderer.on('qa-update', (e, data) => {
    $("#qa-answer").text(`${data[0]}, prize: ${data[1]}`);
    currentscore = data[1];
});

function loadTable (i) {
    currenttable = boarddata[i];
}

for (var i = 0; i < boarddata.length; i++) {
    $("#gameselect").append("<option value=\""+i+"\">"+boarddata[i].name+"</option>");
}
$("#gameselect").on('change', () => {
    if (parseInt($("#gameselect :selected").val())+1) loadTable($("#gameselect :selected").val());
});

$("#scores").html("");
for (var i of activeteams) {
    let team = teamdata[i];
    $("#scores").append($(`<li id="team${i}" style="background-color: #${team.color}">${team.name}: 0</li>`));
    $(".current-answer").append($(`<button class="answer" data-teamid="${i}" style="background-color: #${team.color}">${team.name}</button>`))
}
for (let i in teamdata) {
    if (i == 'rando') continue;
    let cclass = activeteams.indexOf(parseInt(i, 10)) == -1 ? 'unactive' : 'active';
    $("#teams").append(`
        <option value="${i}" class="${cclass}">${teamdata[i].name}</option>
    `);
}
$("#teams").on("change", function () {
    let team = teamdata[$("#teams :selected").val()];
    $("#currentTeamEdit").val($(this).find(":selected").val());
    document.getElementById('color').jscolor.fromString(team.color);
    $("#name").val(team.name);
    let active = activeteams.indexOf(parseInt($("#currentTeamEdit").val(), 10)) != -1;
    $("#activeTeam").prop('checked', active);
});

var save =  () => {
    if (!$("#currentTeamEdit").attr("value")) return;
    let id = parseInt($("#currentTeamEdit").val(), 10);
    let active = activeteams.indexOf(parseInt($("#currentTeamEdit").val(), 10)) != -1;
    teamdata[$("#currentTeamEdit").attr("value")] = {
        name: $("#name").val(),
        color: $("#color").val(),
        active: $("#activeTeam").prop('checked'),
        score: 0
    };
    if (!active && !$("#activeTeam").prop('checked')) { return; }
    if (active && $("#activeTeam").prop('checked')) { return; }

    if ($("#activeTeam").prop('checked')) {
        activeteams.push(id);
    } else {
        activeteams.splice(activeteams.indexOf(id), 1);
    }
    activeteams.sort();

    $("#scores").html("");
    $(".current-answer").html("");
    for (var i of activeteams) {
        let team = teamdata[i];
        $("#scores").append($(`<li id="team${i}" style="background-color: #${team.color}">${team.name}: 0</li>`));
        $(".current-answer").append($(`<button class="answer" data-teamid="${i}" style="background-color: #${team.color}">${team.name}</button>`))
    }

    fs.writeFileSync(teampath, JSON.stringify(teamdata, null, 4), 'utf8');
};

$(".current-answer .answer").click(function () {
    console.log("Hi");
    console.log(currentscore);
    if (!currentscore) return;
    let id = $(this).attr("data-teamid");
    let team = teamdata[id];
    team.score += parseInt(currentscore.slice(1), 10);
    currentscore = null;
    ipcRenderer.send('team-answer', 'data');
    $("#scores").html("");
    for (var i of activeteams) {
        let team = teamdata[i];
        $("#scores").append($(`<li id="team${i}" style="background-color: #${team.color}">${team.name}: ${team.score}</li>`));
    }
});
