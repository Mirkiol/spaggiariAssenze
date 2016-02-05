// ==UserScript==
// @name        Spaggiari Assenze
// @namespace   italianplayers.it
// @description Uno script essenziale per gestire al meglio le proprie assenze
// @include     https://web.spaggiari.eu/tic/app/default/consultasingolo.php#eventi
// @version     1.1
// @updateURL 	https://github.com/Mirkiol/spaggiariAssenze/blob/master/spAssenze.user.js
// @grant       GM_log
// @grant       GM_addStyle
// @run-at      document-idle
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

GM_addStyle ("\
    div.f_reg_school {                              \
        background: #E08C8C;                        \
    }                                               \
    div.f_reg_trip {                                \
        background: purple;                         \
    }                                               \
    div.f_reg_last_school_day {                     \
        background: #4F4FE3;                        \
    }                                               \
    td.f_reg_school,                                \
    td.f_reg_trip,                                  \
    td.f_reg_last_school_day{                       \
        background: white;                          \
    }                                               \
");


var months = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];

GM_log('prova');
Date.holidays = {
	0: [],
	1: [],
	2: [24,25,26,27,28,29],
	3: [23,25],
	4: [1],
	5: [2],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: []
};

Date.trips = {
	0: [],
	1: [],
	2: [30,31],
	3: [1,2],
	4: [],
	5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: []
};

var skippedDays = parseInt($('#skeda_eventi tbody tr:nth-child(3) td:nth-child(2) p').html().match(/\([0-9]{1,} gg\)/)[0].substring(1));
var skippedHours = parseInt($('#skeda_sintesi tbody tr:nth-child(4) td:nth-child(12) p:nth-child(2)').html().match(/: [0-9]{1,}/)[0].substring(2));
var delays = parseInt($('#skeda_eventi tbody tr:nth-child(3) td:nth-child(4) p font').html());
var earlyExits = parseInt($('#skeda_eventi tbody tr:nth-child(3) td:nth-child(6) p font').html());
var leftSchoolDays = 0;
var tripDays = 0;
var lastSchoolDay = new Date(2016,5,6);

function lastCalendarRow(){
  return $('#skeda_calendario tbody tr:last-child');
}

function lastCalendarCell(){
  return lastCalendarRow().find('td:last-child');
}

function addMonthRow(month){
  var row = $('<tr class="rigtab" valign="middle" height="38" align="center"></tr>');
  
  var std = $('<td class="registro" width="40"></td>');
  var sp = $('<p class="double" align="center"></p>');
  var sfont = $('<font class="graytext" size="-1"></font>').html(month.substring(0,3));
  row.append(std);
  std.append(sp);
  sp.append(sfont);
  
  var td = $('<td class="registro" width="200" align="left"></td>');
  var p = $('<p class="double"></p>');
  var font = $('<font class="bluetext handwriting" size="+2"></font>').html(month);
  row.append(td);
  td.append(p);
  p.append(font);
  
  lastCalendarRow().after(row);
  var spaceRow = $('<tr valign="middle" height="1" align="center"></tr>');
  row.before(spaceRow);
  return row;
}

function createCell(className, p, title){
  var cell = $('<td class="registro '+className+' rigtab" valign="top" width="20"></td>');
  var font = $('<font style="font-size:10px; font-weight:bold; color:#ff0000;"></font>');
  var div = $('<div title="'+title+'" class="'+className+'" valign="top"></div>');
  var p = $('<p class="s_reg_testo" align="center">'+p+'</p>');
  
  cell.append(font);
  cell.append(div);
  div.append(p);
  return cell;
}

function createTripCell(){
  return createCell('f_reg_trip','G');
}

function createSchoolDayCell(){
  return createCell('f_reg_school','S');
}

function createHolidayCell(){
  return createCell('f_reg_festivo','');
}

function createLastSchoolDayCell(){
  return createCell('f_reg_last_school_day','F');
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

Date.prototype.next = function(){
  this.setDate(this.getDate()+1);
};


Date.prototype.isTrip = function(){
  return Date.trips[this.getMonth()].contains(this.getDate());
};

Date.prototype.isHoliday = function(){
  return Date.holidays[this.getMonth()].contains(this.getDate());
};

/*
#############################
##                         ##
##          MAIN           ## 
##                         ##
#############################
*/

// Calendar
var calendar = $('#skeda_calendario tbody');
var i = new Date();
i.setHours(0,0,0,0);

lastCalendarRow().remove();
lastCalendarRow().remove();
lastCalendarCell().remove();

i.next();
while(i.getTime() <= lastSchoolDay.getTime()){
  if(i.getDate()==1){
    addMonthRow(months[i.getMonth()]);
  }
  
  var cell;
  
  if(i.isHoliday() || i.getDay()==0){
    cell = createHolidayCell();
  } else if(i.getTime() == lastSchoolDay.getTime()){
    cell = createLastSchoolDayCell();
    leftSchoolDays++;
  } else if(i.isTrip()){
    cell = createTripCell();
    leftSchoolDays++;
    tripDays++;
  } else {
    cell = createSchoolDayCell();
    leftSchoolDays++;
  }
  
  lastCalendarCell().after(cell); 
  
  i.next();
}

// Info
$('#footer_menu').before('<p>Mancano <b>'+leftSchoolDays+'</b> giorni effettivi di scuola, di cui '+tripDays+' di gita.</p>');

setTimeout(function(){
  $('.switching_tab').hide(); $('#skeda_calendario').show();
}, 500);
