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

ipcRenderer.on('team-update', (e, data) => {
    activeteams = data;
});

$("td").click(function (e) {
    $answer = $(this).find('.answer').html();
    $question = $(this).find('.question').text();
    ipcRenderer.send('qa-update', [$answer, $(this).clone().children().remove().end().text()]);
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
    $div.animate({
        'top' : '20px',
        'left': '20px',
        'bottom' : '20px',
        'right' : '20px'
    }, 500, 'swing', function () {
        $div.html($q);
    });
    $("#game").append($div);
    ipcRenderer.once('team-answer', (e, data) => {
        $(".qa .question").html($answer);
        ipcRenderer.once('team-answer-close', (e, data) => {
            $div.html("");
            $div.animate({
                top: $off.top,
                left: $off.left,
                right: right,
                bottom: bottom
            }, 500, 'swing', function () {
                $(this).remove();
            });
        });
    });
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

var scoresShown = false;
ipcRenderer.on('scores-show', (e, data) => {
    if (scoresShown) {
        scoresShown = false;
        $(".scores-show").remove();
    } else {
        scoresShown = true;
        data = JSON.parse(data);
        console.log(data);
        data = data.sort(function (a, b) {
            return parseInt(a.score) - parseInt(b.score)
        });
        data = data.reverse();
        console.log(data);
        $div = $(`<div class="scores-show"></div>`);
        let max = 0;
        for (let team of data) {
            max = Math.max(team.score, max);
        }
        for (let team of data) {
            $div.append(`
                <div class="score-row" style="height: ${100 / data.length}%">
                    <div class="score">
                        ${team.name}<br />
                        ${team.score}
                    </div>
                    <div class="row-box">
                        <div class="score-bar" style="width: 0; height: 100%; max-width: ${100 * (team.score / max)}%; background-color: #${team.color}"></div>
                    </div>
                </div>
            `);
        }
        $("#game").append($div);
        $div.find('.score-bar').animate({
            "width" : "100%"
        });
    }
});