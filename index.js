const {remote} = require('electron');
var maximized = false;
var win = remote.getCurrentWindow();
const appDir = remote.app.getPath('userData');

const fs = require('fs');
const path = require('path');

const jQuery = $ = require('jquery');

var boardpath;

const DEBUG = true;

if (DEBUG) {
    boardpath = 'samples';
} else if (appDir.slice(-8) == 'Electron') { // Is it launched using VSCode debug? If so, this is true
    boardpath = '/Users/andrewrioux/Library/Application Support/quizbowl/boards.json';    
} else { // Otherwise, it is the last eight characters of `quiz-bowl`
    boardpath = path.join(appDir, 'boards.json');
}

const teampath = path.join(appDir, 'teams.json');

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

function loadTable (index) {
    console.log(boarddata);
    currenttable = boarddata[index];
    $("#game caption").html(currenttable.name);
    for (var i = 0; i < 5; i++) {
        $("#0"+(i+1)).html(currenttable.categories[i]);
    }
    for (var i = 1; i < 6; i++) {
        for (var j = 0; j < 5; j++) {
            var q = currenttable.values[i+"00"][(j+1)+""];
            q = q[Math.floor(Math.random()*this.length)] || ["",""];
            $("#"+(i+"")+((j+1)+"")).html(`$${i}00
            <div class="question">${q[0]}</div>
            <div class="answer">${q[1]}</div>`);
        }
    }
}

loadTable(0);

jQuery(document).click(function () {
    $("#game").animate({
        'top' : '0',
        'bottom' : '0'
    }, 500, 'swing');
});

$("#game tbody").each(function () {
    $height = $(this).height();
    $(this).children().each(function () {
        $(this).height($height / 6);
    });
});