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

ipcRenderer.on('team-update', (e, data) => {

});

ipcRenderer.on('score-update', (e, data) => {
    
});

ipcRenderer.on('qa-update', (e, data) => {
    $("#qa-answer").html(data);
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
