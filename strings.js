var strings = {};

strings.StringTable = function (fileName, maxWaitTime)
{
    Cary.StringTable.apply (this, []);
    
    if (!Cary.tools.isNothing (fileName))
        this.loadFromCsvFile (fileName, maxWaitTime);
};

strings.StringTable.prototype = Object.create (Cary.StringTable.prototype);

strings.StringTable.prototype.loadFromCsvFile = function (fileName, maxWaitTime)
{
    var instance = this;
    var time     = Cary.tools.time ();
    var loaded   = false;
    
    if (Cary.tools.isNothing (maxWaitTime))
        maxWaitTime = 0;
    
    Cary.tools.sendRequest ({ async: false, url: 'requests/get_res_file.php?fn=' + fileName, mathod: 'get', content: Cary.tools.contentTypes.plainText, onLoad: onLoad, resType: Cary.tools.resTypes.plain });
    
    if (maxWaitTime > 0)
    {
        while (!loaded && (Cary.tools.time () - time) < maxWaitTime)
        {
            loaded = false;
        };
    }
    
    loaded = true;
    
    function onLoad (content)
    {
        instance.loadFromCsv (content);

        for (var key in instance.strings)
            instance [key] = instance.strings [key];
        
        loaded = true;
    }
};

