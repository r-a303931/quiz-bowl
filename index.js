const {remote} = require('electron');
var maximized = false;
var win = remote.getCurrentWindow();
const appDir = remote.app.getPath('userData');

const fs = require('fs');
const path = require('path');

const jQuery = $ = require('jquery');

var boardpath;

const DEBUG = false;

if (DEBUG) {
    boardpath = 'C:\\Users\\Andrew\\Desktop\\quiz-bowl\\samples\\boards.json';
} else if (appDir.slice(-8) == 'Electron') { // Is it launched using VSCode debug? If so, this is true
    boardpath = '/Users/andrewrioux/Library/Application Support/quizbowl/boards.json';    
} else { // Otherwise, it is `uiz-bowl`
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
    e.stopPropagation();
    $answer = $(this).find('.answer').text();
    $question = $(this).find('.question').text();
    $(this).addClass('called');
    $(this).off('click');
    $div = $("<div class=\"qa\"></div>");
    $off = $(this).offset();
    $div.css({
        "top" : $off.top,
        "left" : $off.left,
        "height": $(this).outerHeight(),
        "width" : $(this).outerWidth()
    });
    $("#game").append($div);
});

for (var i = 0; i < boarddata.length; i++) {
    $("#gameselect").append("<option value=\""+i+"\">"+boarddata[i].name+"</option>");
}
$("#gameselect").on('change', () => {
    if (parseInt($("#gameselect :selected").val())+1) loadTable($("#gameselect :selected").val());
});

jQuery(document).click(function () {
    if ($("#game").css('top') != '0px') {
        $("#game").animate({
            'top' : '0',
            'bottom' : '0'
        }, 500, 'swing');
    } else {
        $("#game").animate({
            'top': '-100%',
            'bottom': '100%'
        }, 500, 'swing');
    }
});

$("#menu").click(function (e) {
    e.stopPropagation();
});

$("#game tbody").each(function () {
    $height = $(this).height();
    $(this).children().each(function () {
        $(this).height($height / 6);
    });
});