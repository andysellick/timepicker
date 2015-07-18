Timepicker
==========

A plugin to allow easy selection of times within a text field.

Acts on a chosen text input field that when clicked produces a popup with buttons to change the values of hour, minute and am/pm. Numbers can also be typed into the boxes in the popup, or if focussed, the cursor up and down keys will increment or decrement the value.

Times automatically roll around, so increasing the time by one minute from 11:59 AM will take the time to 12:00 PM.

Designed to be lightweight and have no external dependencies other than its own (quite simple) stylesheet.

Usage
-----
```html
$(document).ready(function(){
    $('.timepicker').timepicker();
});
```

Markup
------
```html
<div class="tp-wrapper">
    <input type="text" class="timepicker"/>
</div>
```

Note that the input is the element the plugin is called on, and the wrapper element is still required.


Options
-------

- **twentyfourhour**: 0 or 1. Defaults to 0, which sets the time to a 12 hour clock.
- **initialHour**: the initial hour shown in the input.
- **initialMin**: the initial minute shown in the input.
- **initialAMPM**: 'AM' or 'PM'. The initial value for am or pm. Ignored if twentyfourhour is 1.
- **incrementMins**: number. When the change value buttons for minutes are clicked, change the minutes by this number. Defaults to 5 (hours always change by 1).
- **increaseText**: text string for the increment button text. Defaults to "+"
- **decreaseText**: text string for the decrement button text. Defaults to "-"


TODO
----

- Probably needs a bit more testing.
- Doesn't yet allow for direct input in the original box.
