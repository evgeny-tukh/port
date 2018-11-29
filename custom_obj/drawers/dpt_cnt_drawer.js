userObj.drawers.DepthContourDrawer = function (userObject)
{
    this.tag = null;
    
    userObj.drawers.AlertableContourDrawer.apply (this, arguments);
};

userObj.drawers.DepthContourDrawer.prototype = Object.create (userObj.drawers.AlertableContourDrawer.prototype);

userObj.drawers.DepthContourDrawer.prototype.draw = function (map, options)
{
    var hint   = this.object.userProps.maxDraught.toFixed (1) + 'm';
    var bounds = Cary.maps.getBounds (this.object.points);
    var styles = { color: 'black', left: '-30px', width: '60px', height: '25px', 'font-size': '13px', position: 'absolute', margin: 'auto',  'margin-left': '-30px',
                   'text-align': 'center', padding: '0px'/*, opacity: '0'*/ };
    
    userObj.drawers.AlertableContourDrawer.prototype.draw.apply (this, arguments);
    
    if (this.tag === null)
        this.tag = new Cary.controls.Tag (null, bounds.getCenter (), hint, 16, styles, zoomToFontSize);
    else
        this.tag.setText (hint);
    
    this.tag.setMap (map);
    
    function zoomToFontSize (zoom)
    {
        var result;
        
        switch (zoom)
        {
            case 14:
                result = 13; break;
                
            case 15:
                result = 14; break;
                
            case 16:
                result = 15; break;
                
            case 17:
                result = 16; break;
                
            case 18:
                result = 18; break;
                
            default:
                if (zoom > 18)
                    result = 20;
                else
                    result = 0;
        }
        
        return result;
    }
};

userObj.drawers.DepthContourDrawer.prototype.undraw = function ()
{
    userObj.drawers.AlertableContourDrawer.prototype.undraw.apply (this, arguments);
    
    if (this.tag !== null)
    {
        this.tag.setMap (null);
        
        this.tag = null;
    }
};
