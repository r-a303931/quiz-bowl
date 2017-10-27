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
var activeteams = [0];

function loadTable (index) {
    currenttable = boarddata[index];
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

$("td").click(function (e) {
    $answer = $(this).find('.answer').text();
    $question = $(this).find('.question').text();
    ipcRenderer.send('qa-update', $answer);
    $(this).addClass('called');
    $(this).off('click');
    $div = $("<div class=\"qa\"></div>");
    $off = $(this).offset();
    var ow = $(this).outerWidth(), oh = $(this).outerHeight();
    right = $(document).width() - ($off.left+ow);
    bottom = $(document).height() - ($off.top+oh);
    $div.css({
        "top" : $off.top,
        "left" : $off.left,
        "right" : right,
        "bottom" : bottom
    });
    $q = $(this).children();
    $a = $q[1]; $q = $q[0];
    var qc = (e2) => {

    };
    var qc2 = function () {
        $div.html($q);
        $cont = $("<div class=\"teams\"></div>");
        $div.append($cont);
        console.log("Animated");
        for (var i = 0; i < activeteams.length; i++) {
            console.log(i, activeteams[i], teamdata[activeteams[i]]);
            $cont.append($(`<div class="team" style="background-color: #${teamdata[activeteams[i]].color}>${teamdata[activeteams[i]].name}</div>`))
        }
        $cont.children().click(qc);
    };
    $div.animate({
        'top' : '20px',
        'left': '20px',
        'bottom' : '20px',
        'right' : '20px'
    }, 500, 'swing', console.log);
    $("#game").append($div);
});

for (var i = 0; i < boarddata.length; i++) {
    $("#menu").append(`<div class="board" data-index="${i}">${boarddata[i].name}</div>`);
}
$("#menu div.board").on('click', function () {
    loadTable(parseInt($(this).attr("data-index"), 10));
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