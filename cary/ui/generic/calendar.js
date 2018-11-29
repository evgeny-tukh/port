function CalendarControl (desc, date)
{
    var parent;
    var control;
    var year;
    var month;
    var weekDay;
    var monthDay;
    var week;
    var selectedDate;
    var minDate = 'min' in desc ? desc.min : new Date (0);
    var maxDate = 'max' in desc ? desc.max : new Date ();

    if (isNaN (date.getTime ()))
        date = new Date ();
    
    minDate.setHours (0);
    minDate.setMinutes (0);
    minDate.setSeconds (0);
    minDate.setMilliseconds (0);
    
    maxDate.setHours (23);
    maxDate.setMinutes (59);
    maxDate.setSeconds (59);
    maxDate.setMilliseconds (999);
    
    CalendarControl.instance = this;
    
    if (typeof (desc) === 'undefined')
        desc = {};

    if (typeof (date) === 'undefined')
        date = new Date ();

    selectedDate = date;

    getDateProperties ();

    if ('parent' in desc)
        parent = desc.parent;
    else
        parent = document.getElementsByTagName ('body') [0];

    control = createControl (desc);

    popupateCalendar ();

    document.getElementById ('prevMonth').onclick = goToPrevMonth;
    document.getElementById ('nextMonth').onclick = goToNextMonth;

    this.close  = close;
    this.setMin = setMin;
    this.setMax = setMax;

    function setMin (date)
    {
        minDate = date;
    }
    
    function setMax (date)
    {
        maxDate = date;
    }
    
    function close ()
    {
        parent.removeChild (control);
        
        CalendarControl.instance = null;
    }

    function createControl (desc)
    {
        var parentElement = null;
        var container     = document.createElement ('div');
        var monthSelector = document.createElement ('div');
        var goToPrevMonth = document.createElement ('button');
        var goToNextMonth = document.createElement ('button');
        var monthName     = document.createElement ('div');
        var weekHeader    = document.createElement ('div');
        var closeButton   = document.createElement ('button');
        var daysOfWeek    = [];
        var weeks         = [];
        var dayOfWeek;
        var i;
        var j;

        if ('parentID' in desc)
            parentElement = document.getElementById (desc.parent);
        else if ('parent' in desc)
            parentElement = desc.parent;
        else
            parentElement = document.getElementsByTagName ('body') [0];

        container.className = 'calendar';
        container.onselectstart = function () { return false; };

        if ('position' in desc)
        {
            container.style.position = 'absolute';
            container.style.left     = desc.position.x.toString () + 'px';
            container.style.top      = desc.position.y.toString () + 'px';
        }

        monthSelector.className = 'monthSelector';

        goToPrevMonth.className = 'goToPrevMonth';
        goToPrevMonth.id        = 'prevMonth';
        goToPrevMonth.innerText = '◄';

        goToNextMonth.className = 'goToNextMonth';
        goToNextMonth.id        = 'nextMonth';
        goToNextMonth.innerText = '►';

        closeButton.innerText = 'X';
        closeButton.className = 'closeButton';
        closeButton.onclick   = close;
        
        monthName.className = 'monthName';
        monthName.id        = 'monthName';
        monthName.innerText = 'August 2016';

        monthSelector.appendChild (monthName);
        monthSelector.appendChild (goToPrevMonth);
        monthSelector.appendChild (closeButton);
        monthSelector.appendChild (goToNextMonth);

        weekHeader.className = 'weekHeader';

        for (i = 0; i < 7; ++ i)
        {
            daysOfWeek [i] = document.createElement ('div');

            daysOfWeek [i].className = 'dayOfWeek';
            daysOfWeek [i].innerText = CalendarControl.weekDays [i];

            weekHeader.appendChild (daysOfWeek [i]);
        }

        container.appendChild (monthSelector);
        container.appendChild (weekHeader);

        for (i = 0; i < 6; ++ i)
        {
            weeks [i] = document.createElement ('div');

            weeks [i].className = 'week';
            weeks [i].id        = 'week' + (i + 1).toString ();

            container.appendChild (weeks [i]);

            for (j = 0; j < 7; ++ j)
            {
                dayOfWeek = document.createElement ('div');

                dayOfWeek.className = 'day';
                dayOfWeek.id        = 'day' + (i + 1).toString () + (j + 1).toString ();

                weeks [i].appendChild (dayOfWeek);
            }
        }

        parentElement.appendChild (container);

        return container;
        //return document.getElementById ('calendar');
    }

    function getDateProperties ()
    {
        year     = date.getFullYear ();
        month    = date.getMonth ();
        weekDay  = date.getDay ();                  // Zero-based
        monthDay = date.getDate ();
        week     = Math.floor ((date - weekDay) / 7);   // Zero-based
    }

    function isLeapYear (yearToCheck)
    {
        return ((yearToCheck - 1980) % 4) === 0;
    }

    function getMaxDay (month)
    {
        var result;

        switch (month)
        {
            case 0:
            case 2:
            case 4:
            case 6:
            case 7:
            case 9:
            case 11:
                result = 31; break;

            case 1:
                result = isLeapYear (year) ? 29 : 28; break;

            case 3:
            case 5:
            case 8:
            case 10:
                result = 30; break;

            default:
                result = 0;
        }

        return result;
    }

    function goToPrevMonth ()
    {
        var monthName = document.getElementById ('monthName');

        if (month > 0)
        {
            -- month;
        }
        else
        {
            month = 11;

            -- year;
        }

        monthName.innerText = CalendarControl.monthNames [month] + ' ' + year.toString ();

        popupateCalendar ();
    }

    function goToNextMonth ()
    {
        var monthName = document.getElementById ('monthName');

        if (month < 11)
        {
            ++ month;
        }
        else
        {
            month = 0;

            ++ year;
        }

        monthName.innerText = CalendarControl.monthNames [month] + ' ' + year.toString ();

        popupateCalendar ();
    }

    function popupateCalendar ()
    {
        var weekNo,
            dayNo,
            weekDayNo,
            beginWeekDayNo,
            endWeekDayNo,
            beginDate,
            endDate,
            maxDay,
            curDay,
            prevMonth,
            nextMonth,
            maxPrevMonthDay,
            maxNextMonthDay,
            id,
            dayElement,
            curDate;

        nextMonth       = month < 11 ? month + 1 : 0;
        prevMonth       = month > 0 ? month - 1 : 11;
        maxDay          = getMaxDay (month);
        maxPrevMonthDay = getMaxDay (prevMonth);
        maxNextMonthDay = getMaxDay (nextMonth);
        beginDate       = new Date (year, month, 1, 0, 0, 0);
        endDate         = new Date (year, month, maxDay, 0, 0, 0);
        beginWeekDayNo  = beginDate.getDay ();
        endWeekDayNo    = endDate.getDay ();

        monthName.innerText = CalendarControl.monthNames [month] + ' ' + year.toString ();

        for (weekNo = 1; weekNo <= 6; ++ weekNo)
        {
            for (weekDayNo = 0; weekDayNo < 7; ++ weekDayNo)
            {
                id         = 'day' + weekNo.toString () + (weekDayNo + 1).toString ();
                dayElement = document.getElementById (id);

                dayElement.onclick = null;
                
                dayNo = (weekNo - 1) * 7 + weekDayNo - beginWeekDayNo + 1;
                
                curDate = new Date (year, month, dayNo, 0, 0, 0);
                
                if (dayNo <= 0)
                {
                    dayNo += maxPrevMonthDay;

                    dayElement.className = 'invalidDay';
                }
                else if (dayNo > maxDay)
                {
                    dayNo -= maxDay;

                    dayElement.className = 'invalidDay';
                }
                else if (year === selectedDate.getFullYear () && month === selectedDate.getMonth () && dayNo === selectedDate.getDate ())
                {
                    dayElement.className = 'selectedDay';

                    if ('onSelect' in desc)
                        dayElement.onclick = onSelectableDayClick;
                }
                else if ((minDate === null || minDate <= curDate) && (maxDate === null || maxDate >= curDate))
                {
                    dayElement.className = 'day';

                    if ('onSelect' in desc)
                        dayElement.onclick = onSelectableDayClick;
                }
                else
                {
                    dayElement.className = 'disabledDay';
                }

                dayElement.innerText = dayNo.toString ();
        
                function onSelectableDayClick ()
                {
                    var wn = parseInt (this.id [3]);
                    var wd = parseInt (this.id [4]);
                    var dn = (wn - 1) * 7 + (wd - 1) - beginWeekDayNo + 1;

                    desc.onSelect (new Date (year, month, dn, 0, 0, 0));
                }
            }
        }
    }
}

CalendarControl.monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
                               'October', 'November', 'December' ];

CalendarControl.weekDays = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ];

CalendarControl.instance = null;