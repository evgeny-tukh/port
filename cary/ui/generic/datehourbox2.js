Cary.ui.DateHourBox = function (desc)
{
    var control    = document.createElement ('div'),
        datePicker = document.createElement ('input'),
        hourBox    = document.createElement ('input');
    var parent     = getCtlParent (desc);
    var dateTime   = getCtlDescField (desc, 'value');
    var minDate    = 'min' in desc ? desc.min : null;
    var maxDate    = 'max' in desc ? desc.max : null;
    var onChange   = 'onChange' in desc ? desc.onChange : null;
    var calendCtrl = null;
    var utcMode    = 'utc' in desc ? desc.utc : true;
    var defHours   = 'defHours' in desc ? desc.defHours : null;

    control.className = getClassName ('dateTimeBox');
    
    datePicker.type        = 'text';
    datePicker.className   = getClassName ('dateBox dateBox2', 'dpExtraClass');
    datePicker.id          = 'id' in desc ? desc.id + '_date' : null;
    datePicker.onclick     = processDateClick;

    hourBox.type      = 'text';
    hourBox.className = getClassName ('hourBox', 'hbExtraClass');
    hourBox.id        = 'id' in desc ? desc.id + '_hour' : null;
    hourBox.onclick   = function (event)
                        {
                            new HourSelector ({ parent: control, x: event.clientX, y: event.clientY, value: parseInt (hourBox.value), utc: utcMode,
                                                onSelect: function (value)
                                                          {
                                                              hourBox.value = value.toString ();
                                                              
                                                              if (onChange)
                                                                  onChange ();
                                                          }});
                        };

    if (dateTime !== null)
    {
        var date = utcMode ? formatDateUTC (dateTime) : formatDateLocal (dateTime);
        var hour = utcMode ? formatHourUTC (dateTime) : formatHourLocal (dateTime);
        
        datePicker.value = date;
        hourBox.value    = hour.toString ();
    }
    
    control.appendChild (datePicker);
    control.appendChild (hourBox);
    parent.appendChild (control);
    
    this.htmlObject = control;
    this.setValue   = setValue;
    this.getValue   = getValue;
    this.setMin     = setMin;
    this.setMax     = setMax;
    this.enable     = enable;
    
    enable (!(('disabled' in desc) && desc.disabled));

    function enable (enabled)
    {
        var disabled = enabled ? null : 'disabled';
        
        control.disabled    = disabled;
        datePicker.disabled = disabled;
        hourBox.disabled    = disabled;
    }
    
    function setMin (date)
    {
        minDate = date;
        
        if (calendCtrl !== null)
            calendCtrl.setMin (date);
    }
    
    function setMax (date)
    {
        maxDate = date;
        
        if (calendCtrl !== null)
            calendCtrl.setMax (date);
    }
    
    function processDateClick (event)
    {
        var x;
        var y;
        var windowWidth  = window.innerWidth;
        var windowHeight = window.innerHeight;
        var calendarDesc;
        
        if (isUndefinedOrNull (event))
            event = window.event;
        
        x = event.clientX;
        y = event.clientY;
        
        if ((x + 220) > windowWidth)
            x = windowWidth - 220;
        
        if ((y + 180) > windowHeight)
            y = windowHeight - 180;

        if (CalendarControl.instance !== null)
            CalendarControl.instance.close ();

        calendarDesc = { position: { x: x, y: y }, utc: utcMode,
                         onSelect: function (date)
                                   {
                                        datePicker.value = formatDateLocal (date);

                                        CalendarControl.instance.close ();
                                        
                                        if ('onDateChanged' in desc)
                                            desc.onDateChanged (date);
                                   } };
            
        if (minDate !== null)
            calendarDesc.min = minDate;
        
        if (maxDate !== null)
            calendarDesc.max = maxDate;
        
        calendCtrl = new CalendarControl (calendarDesc, this.value === '' ? new Date () : stringToDateUTC (this.value /*+ 'T00:00:00Z'*/));
    }
    
    function getClassName (defaultClass, classKey)
    {
        if (!classKey)
            classKey = 'extraClass';
        
        return classKey in desc ? defaultClass + ' ' + desc [classKey] : defaultClass;
    }
    
    function getValue ()
    {
        var value = datePicker.value;
        var date  = stringToDateUTC (value /*+ 'T00:00:00Z'*/);

        if (date !== null)
        {
            var hours = hourBox.value;
            
            if ((hours === null || hours === '') && defHours !== null)
                hours = defHours.toString ();
            
            if (utcMode)
                date.setUTCHours (parseInt (hours));
            else
                date.setHours (parseInt (hours));
        }
        
        return date;
    }
    
    function setValue (value)
    {
        var date = value ? (utcMode ? formatDateUTC (value) : formatDateLocal (value)) : null;
        var hour = value ? (utcMode ? formatHourUTC (value) : formatHourLocal (value)) : null;
        
        datePicker.value = date;
        hourBox.value    = hour;
    }
};

