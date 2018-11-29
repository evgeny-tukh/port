Cary.drawers.GenericDrawer = function (userObject)
{
    this.object     = userObject;
    this.flashTimer =  null;
    
    this.object.drawObjects = [];
};

Cary.drawers.GenericDrawer.prototype.startFlashing = function (period)
{
    var instance   = this;
    var flashState = true;
    
    if (!period)
        period = 300;
    
    if (this.flashTimer)
        clearInterval (this.flashTimer);
    
    this.flashTimer = setInterval (flash, period);
    
    function flash ()
    {
        instance.object.drawObjects.forEach (function (drawObject)
                                             {
                                                 drawObject.setMap (flashState ? map.map : null);
                                             });
                                             
        flashState = !flashState;
    }
};

Cary.drawers.GenericDrawer.prototype.stopFlashing = function ()
{
    if (this.flashTimer)
    {
        clearInterval (this.flashTimer);
    
        this.flashTimer = null;
    }
    
    this.object.drawObjects.forEach (function (drawObject)
                                     {
                                         drawObject.setMap (map.map);
                                     });
};

Cary.drawers.GenericDrawer.prototype.draw = function ()
{
    return null;
};

Cary.drawers.GenericDrawer.prototype.undraw = function ()
{
    if (this.object.drawObjects && this.object.drawObjects.length > 0)
    {
        var i;
        
        for (i = 0; i < this.object.drawObjects.length; ++ i)
            this.object.drawObjects [i].setMap (null);
        
        this.object.drawObjects = [];
    }
};

Cary.drawers.GenericDrawer.prototype.setOptions = function (optionName, optionValue)
{
    this.object.drawObjects.forEach (function (drawObject)
                                     {
                                         var options = {};
                                         
                                         options [optionName] = optionValue;
                                         
                                         drawObject.setOptions (options);
                                     });
};

Cary.drawers.GenericDrawer.prototype.setCallback = function (eventName, callback)
{
    if (this.object.drawObjects && this.object.drawObjects.length > 0)
    {
        for (var i = 0; i < this.object.drawObjects.length; ++ i)
        {
            var object     = this.object;
            var drawObject = this.object.drawObjects [i];
            
            drawObject.setOptions ({ clickable: true });
            
            google.maps.event.addListener (drawObject, 'mouseover', runCallback);
                                                     
            function runCallback ()
            {
                if (callback)
                    callback (object);
            }
        }
    }
};

Cary.drawers.undrawLastDrawings = function (object)
{
    if (!Cary.tools.isNothing (object))
    {
        var i;
        
        for (i = 0; i < object.drawObjects.length; ++ i)
            object.drawObjects [i].setMap (null);
        
        object.drawObjects = [];
    }
};
