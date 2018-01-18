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
var activeteams = [0, 1, 2];
var currentscore = null;

ipcRenderer.on('team-update', (e, data) => {
    activeteams = data;
});

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
})