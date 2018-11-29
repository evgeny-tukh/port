userObj.drawers.NavContourDrawer = function (userObject)
{
    Cary.drawers.PolygonDrawer.apply (this, arguments);
    
    if (userObject.type == Cary.userObjects.objectTypes.CIRCLE)
        this.circleDriver = new Cary.drawers.CircleDrawer (userObject);
    else
        this.circleDriver = null;
};

userObj.drawers.NavContourDrawer.prototype = Object.create (Cary.drawers.PolygonDrawer.prototype);

userObj.drawers.NavContourDrawer.prototype.draw = function (map, options)
{
    var tagVisible = false;
    var object     = this.object;
    
    if (!options)
        options = {};
    
    options.noBalloon = true;
    options.clickable = true;
    
    if (!object.tag)
        object.createTag ();
    
    if (object.tag)
        object.tag.setText (object.getHintText ());
    
    switch (object.type)
    {
        case Cary.userObjects.objectTypes.POLYGON:
            Cary.drawers.PolygonDrawer.prototype.draw.apply (this, [map, options]); break;
            
        case Cary.userObjects.objectTypes.CIRCLE:
            this.circleDriver.draw (map, options);
            
            this.setOptions ('fillColor', object.getFillColor ()); 
    }    
    
    this.setOptions ('clickable', true);
    //object.drawObjects [0].setOptions ({ clickable: true });
    object.drawObjects [0].addListener ('click', 
                                        function ()
                                        { 
                                            if (userObj.NavContour.hintMode === userObj.NavContour.hintModes.ON_CLICK)
                                            {
                                                object.clicked = true;
                                                
                                                showHint (true);
                                                
                                                setTimeout (function ()
                                                            {
                                                                object.tag.container.addEventListener ('click',
                                                                                                        function (event)
                                                                                                        {
                                                                                                            event.stopPropagation ();
                                                                                                            
                                                                                                            object.clicked = false;

                                                                                                            showHint (false); 
                                                                                                        });
                                                            }, 500);
                                            }
                                        });
    /*object.drawObjects [0].addListener ('mouseout',
                                        function ()
                                        {
                                            if (userObj.NavContour.hintMode === userObj.NavContour.hintModes.ON_CLICK)
                                            {
                                                object.clicked = false;
                                                
                                                showHint (false); 
                                            }
                                        });*/
    
    object.tagFlasher = setInterval (function ()
                                     {
                                         tagVisible = !tagVisible;

                                         if (object.tag)
                                         {
                                             if (userObj.NavContour.hintMode === userObj.NavContour.hintModes.FLASH)
                                                 showHint (tagVisible);
                                             else if (!object.clicked)
                                                 showHint (false);
                                         }
                                     }, 1000);
                                     
    function showHint (show)
    {
        object.tag.setMap (show ? Cary.checkMap (map) : null);
    }
};

userObj.drawers.NavContourDrawer.prototype.undraw = function ()
{
    if (this.object)
    {
        if (this.object.tagFlasher)
            clearInterval (this.object.tagFlasher);

        if (this.object.tag)
            this.object.tag.setMap (null);
    }
    
    switch (this.object.type)
    {
        case Cary.userObjects.objectTypes.POLYGON:
            Cary.drawers.PolygonDrawer.prototype.undraw.apply (this, arguments); break;
            
        case Cary.userObjects.objectTypes.CIRCLE:
            if (this.circleDriver)
                this.circleDriver.undraw (); break;
    }
};
