Number.prototype.inRange = function (val1, val2)
{
    return this >= val1 && this <= val2 || this >= val2 && this <= val1;
};

Cary.tools.isNothing = function (value)
{
    return typeof  (value) === 'undefined' || value === null;
};

Cary.tools.int2pix = function (value)
{
    return value === null ? null : value.toFixed (0) + 'px';
};

Cary.tools.int2perc = function (value)
{
    return value === null ? null : value.toFixed (0) + '%';
};

Cary.tools.round = function (value, precision)
{
    return parseFloat (value.toFixed (precision));
};

Cary.tools.formatNumberWithLZ = function (value, maxDigits)
{
    var stringValue = value.toString ();
    
    while (stringValue.length < maxDigits)
        stringValue = '0' + stringValue;
    
    return stringValue;
};

Cary.tools.formatNumberWithThousandSep = function (value)
{
    var result;
    
    if (Math.abs (value) >= 1000)
    {
        var thousands = Math.trunc (value / 1000);
        var units     = Math.abs (value) - Math.abs (thousands) * 1000;
        
        result = thousands.toString () + ' ' + units.toFixed (0);
    }
    else
    {
        result = value.toFixed (0);
    }
    
    return result;
};

Cary.tools.formatFloatWithLZ = function (value, maxDigits, digitsAfterPoint)
{
    var stringValue = value.toFixed (digitsAfterPoint);
    
    while (stringValue.length < maxDigits)
        stringValue = '0' + stringValue;
    
    return stringValue;
};

Cary.tools.formatTimeInterval = function (interval, showSeconds)
{
    var days, hours, minutes, seconds, result;
    
    if (Cary.tools.isNothing (showSeconds))
        showSeconds = false;
    
    days     = Math.floor (interval / Cary.tools.DAY_INTERVAL);
    interval = interval % Cary.tools.DAY_INTERVAL;
    hours    = Math.floor (interval / 3600000);
    interval = interval % 3600000;
    minutes  = Math.floor (interval / 60000);
    seconds  = interval % 60000;
    
    if (days > 0)
        days = days.toString () + 'd ';
    else
        days = '';
    
    if (hours > 0)
        hours = hours.toString () + 'h ';
    else
        hours = '';
    
    if (minutes > 0)
        minutes = minutes.toString () + 'm ';
    else
        minutes = '';
    
    result = days + hours + minutes;
    
    if (showSeconds)
        result += seconds + 's';
    
    return result;
};

Cary.tools.formatLat = function (lat, degChar)
{
    var absLat   = Math.abs (lat);
    var latDeg   = Math.floor (absLat);
    var minLat   = (absLat - latDeg) * 60.0;
    var latHS    = lat >= 0 ? 'N' : 'S';
    
    if (Cary.tools.isNothing (degChar))
        degChar = ' ';
    
    return Cary.tools.formatNumberWithLZ (latDeg, 2) + degChar + Cary.tools.formatFloatWithLZ (minLat, 6, 3) + ' ' + latHS;
};

Cary.tools.formatLon = function (lon, degChar)
{
    var absLon   = Math.abs (lon);
    var lonDeg   = Math.floor (absLon);
    var minLon   = (absLon - lonDeg) * 60.0;
    var lonHS    = lon >= 0 ? 'E' : 'W';
    
    if (Cary.tools.isNothing (degChar))
        degChar = ' ';
    
    return Cary.tools.formatNumberWithLZ (lonDeg, 3) + degChar + Cary.tools.formatFloatWithLZ (minLon, 6, 3) + ' ' + lonHS;
};

Cary.tools.createCssClass = function (className, styles)
{
    var head         = document.getElementsByTagName ('head') [0];
    var styleElement = document.createElement ('style');
    var rules;
    var styleLines = '';
    
    for (var key in styles)
        styleLines += key + ': ' + styles [key] + ';';
    
    
    rules = document.createTextNode ('.' + className + '{' + styleLines + '}');
    
    styleElement.type = 'text/css';
    
    if (styleElement.styleSheet)
        styleElement.styleSheet.cssText = rules.nodeValue;
    else
        styleElement.appendChild (rules);
    
    head.appendChild (styleElement);
    
    return styleElement;
};

Cary.tools.openLink = function (href, newTab)
{
    var link = document.createElement ('a');
    
    if (Cary.tools.isNothing (newTab))
        newTab = false;
    
    link.href = href;
    
    if (newTab)
        link.target = '_blank';

    document.body.appendChild (link);

    setTimeout (function ()
                {
                    var event = document.createEvent ("MouseEvents");

                    event.initMouseEvent ("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

                    link.dispatchEvent (event);

                    document.body.removeChild (link);
                }, 66);
};

Cary.tools.saveFile = function (content, fileName, encoding, escapeContent)
{
    var link = document.createElement ('a');
    var href;
    
    if (Cary.tools.isNothing (encoding))
        encoding = 'utf-8';
    
    if (Cary.tools.isNothing (escapeContent))
        escapeContent = true;
    
    href = "data:'text/plain;' charset="+ encoding + "," + (escapeContent ? escape (content) : content);
    
    link.href = href;

    // For MS Edge
    if (window.navigator.userAgent.indexOf ('Edge') >= 0)
    {
        var blob = new Blob ([content], { type: "application/json" });

        return window.navigator.msSaveBlob (blob, fileName);
    }
        
    // For IE v10
    if (window.MSBlobBuilder)
    {
        var blobBuilder = new MSBlobBuilder ();
        
        blobBuilder.append (content);
        
        return navigator.msSaveBlob (blobBuilder, fileName);
    }
    
    // FireFox v20, Chrome v19
    if ('download' in link)
    {
        link.setAttribute ("download", fileName);
        
        link.innerHTML = "downloading...";
        
        document.body.appendChild (link);
        
        setTimeout (function ()
                    {
                        var event = document.createEvent ("MouseEvents");
            
                        event.initMouseEvent ("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            
                        link.dispatchEvent (event);
            
                        document.body.removeChild (link);
                    }, 66);
                    
        return;
    }
    else
    {
        // Other browsers
        var frame = document.createElement ("iframe");
    
        document.body.appendChild (frame);
    
        frame.src = "data:text/plain" + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape) (content);
    
        setTimeout (function () { document.body.removeChild (frame); }, 333);
    }
};


Cary.tools.loadFile = function (file, onLoad)
{
    if (window.FileReader)
    {
        var reader = new FileReader ();

        reader.onload = function (event)
                        {
                            onLoad (event.target.result);
                        };

        reader.readAsText (file);
    }
};

Cary.tools.cancelMouseEvent = function (event)
{
    if (window.event.stopPropagation)
        window.event.stopPropagation ();

    if (window.event.preventDefault)
        window.event.preventDefault ();
};

Cary.tools.FileBroswer = function (parent, callbacks, mode)
{
    var instance = this;
    var fileName = null;
    
    if (Cary.tools.isNothing (mode))
        mode = Cary.tools.FileBroswer.readAsText;
    
    this.browser   = document.createElement ('input');
    this.reader    = new FileReader ();
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;

    parent.appendChild (this.browser);
    
    this.browser.type          = 'file';
    this.browser.style.display = 'none';
                            
    this.execute = function ()
    {
        instance = this;
        
        this.cbCalled         = false;
        this.browser.value    = null;
        this.browser.onchange = onBrowserChange;
        this.reader.onload    = onReaderDone;
        this.reader.onloadend = onReaderDone;
        
        this.browser.click ();
    };
    
    function onReaderDone (event)
    {
        if (!instance.cbCalled)
        {
            instance.cbCalled = true;
            
            if ('onSelect' in instance.callbacks)
            {
                instance.callbacks.onSelect (event.target.result, fileName);
            }
        }
    }
    
    function onBrowserChange ()
    {
        var file = instance.browser.files [0];
        
        fileName = file.name;
        
        switch (mode)
        {
            case Cary.tools.FileBroswer.readAsText:
                instance.reader.readAsText (file); break;
                
            case Cary.tools.FileBroswer.readAsBuffer:
                instance.reader.readAsArrayBuffer (file); break;
                
            case Cary.tools.FileBroswer.readAsBinStr:
                instance.reader.readAsBinaryString (file); break;
                
            default:
                instance.reader.readAsDataURL (file);
        }
    }
};

Cary.tools.FileBroswer.readAsText   = 1;
Cary.tools.FileBroswer.readAsBuffer = 2;
Cary.tools.FileBroswer.readAsBinStr = 3;
Cary.tools.FileBroswer.readAsUrl    = 4;

Cary.tools.updateProperty = function (object, name, value)
{
    var result = {};
    
    for (var key in object)
        result [key] = object [key];
    
    result [name] = value;
    
    return result;
};

Cary.tools.unicode2char = function (source)
{
    var regExp = /\\u([\d\w]{4})/gi;
    var result = source.replace (regExp, function (match, group) { return String.fromCharCode (parseInt (group, 16)); } );

    return unescape (result);
};

Cary.tools.checkDecode = function (value)
{
    return (typeof (value) === 'string') ? Cary.tools.unicode2char (value) : value;
};

Cary.tools.insertChildAfter = function (parentObject, newObject, existingObject)
{
    var i;
    
    for (i = 0; i < parentObject.children.length; ++ i)
    {
        if (parentObject.children [i] === existingObject)
        {
            if (i < (parentObject.children.length - 1))
            {
                parentObject.insertBefore (newObject, parentObject.children [i+1]); return;
            }
        }
    }
    
    parentObject.appendChild (newObject);
};

Cary.tools.contentTypes = { json: 'application/json; charset=UTF-8', xml: 'text/xml', plainText: 'text/plain', formData: 'multipart/form-data', urlEncoded: 'application/x-www-form-urlencoded' };
Cary.tools.methods      = { get: 'GET', post: 'POST' };
Cary.tools.resTypes     = { plain: 1, json: 2, xml: 3 };

Cary.tools.sendRequest = function (options)
{
    var request = new XMLHttpRequest ();
    var method  = 'method' in options ? options.method : Cary.tools.methods.post;
    var content = 'content' in options ? options.content : Cary.tools.contentTypes.plainText;
    var resType = 'resType' in options ? options.resType : Cary.tools.resTypes.plain;
    var async   = 'async' in options ? options.async : true;

    request.open (method, options.url, async);
    request.setRequestHeader ('Content-Type', content);

    if ('onLoad' in options)
        request.onload = function ()
                         {
                             var result = (resType === Cary.tools.resTypes.json) ? JSON.parse (this.responseText) : this.responseText;
                                 
                             options.onLoad (result);
                         };

    if ('onError' in options)
        request.onerror = options.onError;

    if (method === Cary.tools.methods.get)
        request.send ();
    else if (content === Cary.tools.contentTypes.json)
        request.send (JSON.stringify (options.param));
    else
        request.send (options.param);
};

Cary.tools.time = function ()
{
    return new Date ().getTime ();
};

Cary.tools.pathRemoveFileName = function (path)
{
    var elements = path.split ('/');
    
    if (elements.length > 1)
        elements.splice (elements.length - 1);
    
    return elements.join ('/');
};

Cary.tools.copyObjectProp = function (dest, source, propName, defValue)
{
    if (Cary.tools.isNothing (defValue))
        defValue = null;
    
    if (propName in source)
        dest [propName] = source [propName];
    else
        dest [propName] = defValue;
};

function circlePath (centerX, centerY, radius)
{
    var diameter = radius + radius;
    
    return 'M ' + centerX + ' ' + centerY + ' m -' + radius + ', 0 a ' + radius + ',' + radius + ' 0 1,0 ' + diameter + ',0 a ' +
           radius + ',' + radius + ' 0 1,0 -' + diameter + ',0';
}

Cary.tools.simpleVesselIconPath = function ()
{
    //return circlePath (0, 0, 5) + ' M 0 -5 L 0 -20 L -5 -15 M 0 -20 L 5 -15';
    //return 'M 0 10 L 5 10 L 5 -5 L 0 -10 L -5 -5 L -5 10 L 0 10';
    return 'M 0 5 L 2 5 L 2 -2 L 0 -5 L -2 -2 L -2 5 L 0 5';
};

Cary.tools.vesselIconPath = function ()
{
    return 'M -4 -3 L -4 6 L -1 10 L 1 10 L 4 6 L 4 -3 L 0 -10 L -4 -3';
    //return circlePath (0, 0, 5) + ' M 0 -5 L 0 -20 L -5 -15 M 0 -20 L 5 -15';
};

Cary.tools.diamondIconPath = function ()
{
    return 'M -7 0 L 0 7 L 7 0 L 0 -7 L -7 0';
};

Cary.tools.smallDiamondIconPath = function ()
{
    return 'M -2 0 L 0 2 L 2 0 L 0 -2 L -2 0';
};

Cary.tools.getHtmlBody = function ()
{
    return document.getElementsByTagName ('body') [0];
};

Cary.tools.findChildByID = function (element, id, fullSearch)
{
    var i, count, result = null, children;
    
    if (!Cary.tools.isNothing (fullSearch))
        fullSearch = false;
    
    if (!Cary.tools.isNothing (element))
    {
        for (i = 0, children = element.children, count = children.length; i < count; ++ i)
        {
            if ('id' in children [i] && children [i].id === id)
            {
                result = children [i]; break;
            }
            
            if (fullSearch && 'children' in fullSearch)
            {
                var subResult = Cary.tools.findChildByID (children [i], id, fullSearch);
                
                if (subResult)
                {
                    result = subResult; break;
                }
            }
        }
    }
    
    return result;
};

Cary.tools.WaitForCondition = function (condition, onElapsed, interval, param)
{
    if (Cary.tools.isNothing (param))
        param = null;
    
    if (condition ())
    {
        if (!Cary.tools.isNothing (onElapsed))
            onElapsed (param);
    }
    else
    {
        var timer = setInterval (checkCondition, Cary.tools.isNothing (interval) ? 500 : interval);

        function checkCondition ()
        {
            if (condition ())
            {
                clearInterval (timer);

                if (!Cary.tools.isNothing (onElapsed))
                    onElapsed (param);
            }
        }
    }
};

Cary.tools.utf8ToAnsi = function (source)
{
    var result;
    var i;
    var byte0, byte1, byte2;

    for (i = 0, result = ''; i < source.length; )
    {
        byte0 = source.charCodeAt (i);

        if (byte0 < 128)
        {
            result += String.fromCharCode (byte0);
            
            i ++;
        }
        else if ((byte0 > 191) && (byte0 < 224))
        {
            byte1   = source.charCodeAt (i+1);
            result += String.fromCharCode(((byte0 & 31) << 6) | (byte1 & 63));
            
            i += 2;
        }
        else 
        {
            byte1   = source.charCodeAt (i+1);
            byte2   = source.charCodeAt (i+2);
            result += String.fromCharCode (((byte0 & 15) << 12) | ((byte1 & 63) << 6) | (byte2 & 63));
            
            i += 3;
        }
    }

    return result;
};

Cary.tools.toPhpTime = function (timestamp)
{
    return Math.ceil (timestamp / 1000);
};

Cary.tools.keys = function (hash)
{
    var keys = [];
    
    for (var key in hash)
        keys.push (key);
    
    return keys;
};

Cary.tools.getGermanDate = function (source)
{
    var components = source.split ('.');
    
    return new Date (parseInt (components [2]), parseInt (components [1]) - 1, parseInt (components [0]));
};
