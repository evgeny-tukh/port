userObj.drawers.BridgeContourDrawer = function (userObject)
{
    this.tag = null;
    
    Cary.drawers.PolygonDrawer.apply (this, arguments);
};

userObj.drawers.BridgeContourDrawer.prototype = Object.create (Cary.drawers.PolygonDrawer.prototype);

userObj.drawers.BridgeContourDrawer.prototype.draw = function (map, options)
{
    var hint      = this.object.name + '\nУровень: ' + this.object.level.toFixed (1) + 'м';
    var bounds    = Cary.maps.getBounds (this.object.points);
    var center    = bounds.getCenter ();
    /*var ne        = bounds.getNorthEast ();
    var tagAnchor = new google.maps.LatLng (ne.lat (), center.lng ());*/
    var styles    = { color: 'black', left: '-90px', width: '180px', height: '70px', 'font-size': '11px', position: 'absolute', margin: 'auto',  'margin-left': '-90px', 'margin-top': '-35px',
                      'text-align': 'center', padding: '0px'/*, opacity: '0'*/ };
    
    if ('passLevel' in this.object.userProps)
        hint += '\nПрох.уров.: ' + this.object.userProps.passLevel + 'м';
    
    Cary.drawers.PolygonDrawer.prototype.draw.apply (this, arguments);
    
    if (this.tag === null)
        this.tag = new Cary.controls.Tag (null, /*tagAnchor*/bounds.getCenter (), hint, 14, styles, zoomToFontSize, zoomToPlacement);
    else
        this.tag.setText (hint);
    
    this.tag.setMap (map);
    
    if (this.object.flashInterval)
    {
        flashTimer = setInterval (flash, this.object)
    }
    
    function zoomToPlacement (zoom)
    {
        var result;
        
        switch (zoom)
        {
            case 14:
                result = { height: 45, width: 120, 'margin-top': -22, 'margin-left': -60 }; break;
                
            case 15:
                result = { height: 50, width: 130, 'margin-top': -25, 'margin-left': -65 }; break;
                
            case 16:
                result = { height: 50, width: 140, 'margin-top': -25, 'margin-left': -70 }; break;
                
            case 17:
                result = { height: 55, width: 150, 'margin-top': -27, 'margin-left': -75 }; break;
                
            case 18:
                result = { height: 60, width: 160, 'margin-top': -30, 'margin-left': -80 }; break;
                
            default:
                if (zoom > 18)
                    result = { height: 65, width: 180, 'margin-top': -32, 'margin-left': -90 };
                else
                    result = {};
        }
        
        return result;
    }
    
    function zoomToFontSize (zoom)
    {
        var result;
        
        switch (zoom)
        {
            case 14:
                result = 11; break;
                
            case 15:
                result = 12; break;
                
            case 16:
                result = 13; break;
                
            case 17:
                result = 14; break;
                
            case 18:
                result = 16; break;
                
            default:
                if (zoom > 18)
                    result = 18;
                else
                    result = 0;
        }
        
        return result;
    }
};

userObj.drawers.BridgeContourDrawer.prototype.undraw = function ()
{
    Cary.drawers.PolygonDrawer.prototype.undraw.apply (this, arguments);
    
    if (this.tag !== null)
    {
        this.tag.setMap (null);
        
        this.tag = null;
    }
};
