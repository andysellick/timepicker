/*
    JQuery timepicker plugin - https://github.com/andysellick/timepicker

    Usage: $('.timepicker').timepicker();
    Markup:
        <div class="tp-wrapper">
            <input type="text" class="timepicker"/>
        </div>

    Options:
        - twentyfourhour: 0 or 1. Defaults to 0, which sets the time to a 12 hour clock.
        - initialHour: the initial hour shown in the input.
        - initialMin: the initial minute shown in the input.
        - initialAMPM: 'AM' or 'PM'. The initial value for am or pm. Ignored if twentyfourhour is 1.
        - incrementMins: number. When the change value buttons for minutes are clicked, change the minutes by this number. Defaults to 5 (hours always change by 1).
        - increaseText: text string for the increment button text. Defaults to "+"
        - decreaseText: text string for the decrement button text. Defaults to "-"
*/
(function (window,$) {
	var Plugin = function(elem,options){
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
	};

	Plugin.prototype = {
		init: function(){
			var thisobj = this;
			this.popupwrapper;
            this.popup;
            this.hour;
			this.mint;
			this.ampm;
			this.display_hour;
        	this.display_mint;
            this.hourulimit;
            this.hourdlimit;
            this.mintulimit;
            this.mintdlimit;

            //settings
			this.settings = $.extend({
				twentyfourhour: 0,
				initialHour: 1,
				initialMin: 0,
				initialAMPM: 'AM',
				incrementMins: 5,
				increaseText: "+",
				decreaseText: "-"
			}, this.defaults, this.options);

            //all functions
            this.timefunctions = {
                //set some sensible initial values
                setupVariables: function(){
                    thisobj.popupwrapper = thisobj.$elem.closest('.tp-wrapper');
                    if(thisobj.settings.initialAMPM != 'AM' || thisobj.settings.initialAMPM != 'PM'){
                        thisobj.settings.initialAMPM = 'AM';
                    }
                    //create variables based on the settings, resetting them to sensible values if needed
        			thisobj.hour = Math.min(thisobj.settings.initialHour,12);
        			thisobj.mint = Math.min(thisobj.settings.initialMin,59);
        			thisobj.incrementMins = Math.min(thisobj.settings.incrementMins,60);
        			thisobj.ampm = thisobj.settings.initialAMPM;
        			//for display purposes, numbers may need padded zeroes
        			thisobj.display_hour = thisobj.hour;
        			thisobj.display_mint = thisobj.mint;
                    //upper and lower limits for hours and minutes
                    thisobj.hourulimit = 12;
                    thisobj.hourdlimit = 1;
                    thisobj.mintulimit = 59;
                    thisobj.mintdlimit = 0;
                    //do some adjustments if we're on 24 hour clock
        			if(thisobj.settings.twentyfourhour){
                        thisobj.hourulimit = 23;
                        thisobj.hourdlimit = 0;
                        thisobj.hour = Math.min(thisobj.settings.initialHour,thisobj.hourulimit);
                    }
        			thisobj.timefunctions.syncTime();
                    thisobj.timefunctions.updateParent();
                },
                createTimePopup: function(){
                    thisobj.popup = $('<div/>').addClass('tp');
                    //create three inputs, and associated up/down buttons, hour, minute, am/pm
                    var $hourwrap = $('<div/>').addClass('timewrap hour');
                    var $mintwrap = $('<div/>').addClass('timewrap mint');
                    var $ampmwrap;

                    var time = thisobj.timefunctions.getCurrTime();

                    $('<input/>').attr('type','text').addClass('timeinput hour').attr('maxlength',2).val(time[0]).appendTo($hourwrap);
                    $('<button/>').addClass('changeval up hour').html(thisobj.settings.increaseText).attr('data-action','1').appendTo($hourwrap);
                    $('<button/>').addClass('changeval down hour').html(thisobj.settings.decreaseText).attr('data-action','-1').appendTo($hourwrap);

                    $('<input/>').attr('type','text').addClass('timeinput mint').attr('maxlength',2).val(time[1]).appendTo($mintwrap);
                    $('<button/>').addClass('changeval up mint').html(thisobj.settings.increaseText).attr('data-action','1').appendTo($mintwrap);
                    $('<button/>').addClass('changeval down mint').html(thisobj.settings.decreaseText).attr('data-action','-1').appendTo($mintwrap);

                    if(!thisobj.settings.twentyfourhour){
                        $ampmwrap = $('<div/>').addClass('timewrap ampm');
                        $('<input/>').attr('type','text').addClass('timeinput ampm').attr('maxlength',2).val(time[2]).appendTo($ampmwrap);
                        $('<button/>').addClass('changeval up ampm').html(thisobj.settings.increaseText).attr('data-action','am').appendTo($ampmwrap);
                        $('<button/>').addClass('changeval down ampm').html(thisobj.settings.decreaseText).attr('data-action','pm').appendTo($ampmwrap);
                    }
                    thisobj.popup.append($hourwrap,$mintwrap,$ampmwrap).appendTo(thisobj.popupwrapper);
                },
                //show the time popup
                showTimePopup: function(){
                    thisobj.popup.show();
                },
                //take away the popup
                removeTimePopup: function(){
                    if(thisobj.popup){
                        thisobj.popup.hide();
                    }
                },
                //update all relevant displays of the selected time
                updateAll: function(){
                    thisobj.timefunctions.syncTime();
                    thisobj.timefunctions.updateChildren();
                    thisobj.timefunctions.updateParent();
                },
                //change the current time by a given amount of minutes
                changeMinutes: function(mult,mins){
                    //var pass = thisobj.mint + (mins * mult);
                    var check = thisobj.timefunctions.changeNum(thisobj.mint,thisobj.mintulimit,thisobj.mintdlimit,mins * mult);
                    thisobj.mint = check[0];
                    if(check[1]){ //minutes have ticked over, so change the hour accordingly
                        thisobj.timefunctions.changeHours(check[1],1);
                    }
                },
                //change the current time by a given amount of hours
                changeHours: function(mult,changeby){
                    var storehour = thisobj.hour;
                    var check = thisobj.timefunctions.changeNum(thisobj.hour,thisobj.hourulimit,thisobj.hourdlimit,changeby * mult); //now check if that's within the bounds
                    thisobj.hour = check[0];
                    //this is clunky but works
                    if(!thisobj.settings.twentyfourhour){
                        if(storehour == 11 && thisobj.hour == 12) {
                            thisobj.timefunctions.switchAMPM();
                        }
                        if(storehour == 12 && thisobj.hour == 11){
                            thisobj.timefunctions.switchAMPM();
                        }
                    }
                },

                //change a number by the amount supplied, adjust for limits and notify if an adjustment was made
                changeNum: function(num,rangemax,rangemin,changeby){
                    num = num + changeby;
                    var overallchange = 0;
                    if(num > rangemax){
                        num = num - rangemax;
                        if(rangemin == 0){ //slight hack, numbers do weird things when rangemin is 0
                            num -= 1;
                        }
                        overallchange = 1;
                    }
                    if(num < rangemin){
                        num = num + rangemax;
                        if(rangemin == 0){
                            num += 1;
                        }
                        overallchange = -1;
                    }
                    return([num,overallchange]);
                },
                //update the values for time that are displayed
                syncTime: function(){
        			thisobj.display_hour = thisobj.hour;
        			thisobj.display_mint = thisobj.mint;
        			//pad numbers with zeroes if needed
        			if(thisobj.settings.twentyfourhour){
            			if(thisobj.display_hour < 10){
                            thisobj.display_hour = '0' + thisobj.hour;
                        }
                    }
        			if(thisobj.display_mint < 10){
                        thisobj.display_mint = '0' + thisobj.mint;
                    }
                },
                //update all the popup's time boxes with the correct values for hour, minute, etc.
                updateChildren: function(){
                    var toshow = [thisobj.display_hour,thisobj.display_mint,thisobj.ampm];
                    var i = 0;
                    if(thisobj.popup){
                        thisobj.popup.find('input').each(function(){
                            $(this).val(toshow[i]);
                            i++;
                        });
                    }
                },
                //update the parent's displayed val
                updateParent: function(){
                    if(thisobj.settings.twentyfourhour){
                        thisobj.$elem.val(thisobj.display_hour + ':' + thisobj.display_mint);
                    }
                    else {
                        thisobj.$elem.val(thisobj.display_hour + ':' + thisobj.display_mint + ' ' + thisobj.ampm);
                    }
                },
                //switch between am and pm
                switchAMPM: function(){
                    if(thisobj.ampm == 'AM'){
                        thisobj.ampm = 'PM';
                    }
                    else {
                        thisobj.ampm = 'AM';
                    }
                    thisobj.timefunctions.updateAll();
                },
                //get the 'current' time, that is, the time currently set in the variables
                getCurrTime: function(){
                    var time = thisobj.$elem.val();
                    var hour = time.split(':');
                    var mint = hour[1].split(' ');
                    var ampm = mint[1];
                    if(thisobj.settings.twentyfourhour){
                        return([hour[0],mint[0]]);
                    }
                    else {
                        return([hour[0],mint[0],ampm]);
                    }
                },
                createListeners: function(){
                    //create popup
                    thisobj.$elem.on('focus',function(){
                        if(thisobj.popup){
                            thisobj.timefunctions.showTimePopup();
                        }
                        else {
                            thisobj.timefunctions.createTimePopup();
                        }
                    });
                    //general body click events
                    $('body,html').on('click',thisobj.timefunctions.removeTimePopup);
                    $('body').on('click','.tp',function(e){
                        e.stopPropagation();
                    });
                    thisobj.$elem.on('click',function(e){
                        e.stopPropagation();
                    });
                    //buttons in popup to change time
                    thisobj.popupwrapper.on('click','.changeval.hour',function(e){
                        e.preventDefault();
                        thisobj.timefunctions.changeHours(parseInt($(this).data('action')),1);
                        thisobj.timefunctions.updateAll();
                    });
                    thisobj.popupwrapper.on('click','.changeval.mint',function(e){
                        e.preventDefault();
                        thisobj.timefunctions.changeMinutes(parseInt($(this).data('action')),thisobj.settings.incrementMins);
                        thisobj.timefunctions.updateAll();
                    });
                    thisobj.popupwrapper.on('click','.changeval.ampm',function(e){
                        e.preventDefault();
                        thisobj.timefunctions.switchAMPM();
                        thisobj.timefunctions.updateAll();
                    });
                    //selects all text in element when focussed
                    thisobj.popupwrapper.on('focus','.timeinput',function(){
                        thisobj.timefunctions.updateAll();
                    });

                    //handles text input on inputs and up/down keypress for increment/decrement
                    thisobj.popupwrapper.on('keyup','.timeinput',function(e){
                        var change = 0;
                        var code = e.keyCode || e.which;

                        //var ulimit = thisobj.hourulimit;
                        //var dlimit = thisobj.hourdlimit;
                        var timeval = thisobj.hour;
                        var callme = thisobj.timefunctions.changeHours;
                        var increment = 1;

                        if($(this).hasClass('mint')){
                            //ulimit = thisobj.mintulimit;
                            //dlimit = thisobj.mintdlimit;
                            timeval = thisobj.mint;
                            increment = thisobj.settings.incrementMins;
                            callme = thisobj.timefunctions.changeMinutes;
                        }
                        if(code == 38){ //up
                            callme(1,increment);
                            thisobj.timefunctions.updateAll();
                        }
                        else if(code == 40){ //down
                            callme(-1,increment);
                            thisobj.timefunctions.updateAll();
                        }
                        else {
                            var ent = parseInt($(this).val());
                            if(!isNaN(ent)){ //if a number has been entered
                                if(ent > timeval){
                                    change = 1;
                                    increment = ent - timeval;
                                }
                                else if(timeval > ent){
                                    change = -1;
                                    increment = timeval - ent;
                                }
                                callme(increment,change);
                    			thisobj.timefunctions.syncTime();
                                thisobj.timefunctions.updateParent();
                            }
                        }
                    });
                }
            }

			thisobj.timefunctions.setupVariables();
            thisobj.timefunctions.createListeners();
            
            //console.log(this.hourulimit,this.hourdlimit,this.mintulimit,this.mintdlimit);

            //fixme up/down keyboard?
            $('.timeinput').on('click',function(e){});
		}
	}
	$.fn.timepicker = function(options){
		return this.each(function(){
			new Plugin(this,options).init();
		});
	}
	window.Plugin = Plugin;
})(window,jQuery);