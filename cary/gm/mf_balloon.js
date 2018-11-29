Cary.controls.MFBalloon = function (map, position, options)
{
    Cary.controls.GenericMapControl.apply (this, arguments);
    
    this.text           = 'text' in options ? options.text : null;
    this.html           = 'html' in options ? options.html : null;
    this.closeable      = 'closeable' in options ? options.closeable : true;
    this.settings       = 'settings' in options ? options.settings : null;
    this.settingsParam  = 'settingsParam' in options ? options.settingsParam : null;
    this.timeout        = 'timeout' in options ? options.timeout : 0;
    this.horOffset      = 'horOffset' in options ? options.horOffset : 0;
    this.verOffset      = 'verOffset' in options ? options.verOffset : 0;
    this.linkDesc       = 'links' in options ? options.links : [];
    this.onClose        = 'onClose' in options ? options.onClose : null;
    this.getMaxWidth    = 'getMaxWidth' in options ? options.getMaxWidth : null;
    this.getMaxHeight   = 'getMaxHeight' in options ? options.getMaxHeight : null;
    this.divWidth       = 'divWidth' in options ? options.divWidth : null;
    this.links          = [];
    this.x              = null;
    this.y              = null;
    this.left           = null;
    this.top            = null;
    this.width          = null;
    this.height         = null;
    this.bounds         = null;
};

Cary.controls.MFBalloon.prototype = Object.create (Cary.controls.GenericMapControl.prototype);

Cary.controls.MFBalloon.prototype.initialize = function ()
{
    var instance = this;

    this.container.className = 'mfBalloon';

    if (this.html)
        this.container.innerHTML = this.html;
    else
        this.container.innerText = this.text;
    
    if (this.closeable)
    {
        var closeIcon = document.createElement ('div');
        
        closeIcon.className = 'closeIcon';
        closeIcon.onclick   = function (event)
                              {
                                  instance.show (false);

                                  if (onClose)
                                      onClose (event);
                              };
        closeIcon.innerText = Cary.symbols.cross; //  '✖';
        closeIcon.className = 'mfCloseIcon';
        
        this.container.appendChild (closeIcon);
    }
    
    if (this.settings)
    {
        var settingsButton = document.createElement ('img');
    
        settingsButton.src       = 'res/settings26.png';
        settingsButton.onclick   = function ()
                                   { 
                                       instance.show (false);
                                       instance.settings (this.owner.settingsParam);
                                   };
        settingsButton.className = 'mfSettingsButton';
        
        this.container.appendChild (settingsButton);
    }
    
    this.linkDesc.forEach (addLink);
    
    function addLink (desc)
    {
        var link = document.createElement ('a');
        
        if ('callback' in desc)
        {
            link.param    = 'param' in desc ? desc.param : null;
            link.callback = desc.callback;
            link.onclick  = function ()
                            {
                                instance.show (false);
                                instance.callback (this.param);
                            };
        }
        else if ('href' in desc)
        {
            link.param    = 'param' in desc ? desc.param : null;
            link.title    = desc.text;
            link.link     = desc.href;
            link.owner    = this;
            link.onclick  = function ()
                            {
                                instance.show (false);
                                
                                //openInternalBrowser ({ title: this.title, link: this.link });
                            };
        }
        else if ('callbackName' in desc && 'param' in desc)
        {
            link.href = 'javascript:MFBalloon.show(false);' + desc.callbackName + '(' + desc.param + ');';
        }
        else
        {
            link.href = null;
        }
        
        if (desc.html)
            link.innerHTML = desc.html;
        else if ('text' in desc)
            link.innerText = desc.text;
        else if ('name' in desc)
            link.innerText = desc.name;
        else
            link.innerText = '';

        link.className     = 'mfLink';
        link.target        = '_blank';
        link.style.cursor  = 'pointer';
        link.style.display = 'block';
        
        instance.container.appendChild (link);
    }
};

Cary.controls.MFBalloon.prototype.setPosition = function (position)
{
    this.position = position;
    
    this.draw ();
};

Cary.controls.MFBalloon.prototype.draw = function ()
{
    var projection = this.getProjection ();
    var northWest  = projection.fromLatLngToDivPixel (this.position);
    var screenNW   = projection.fromLatLngToContainerPixel (this.position);
    var x          = northWest.x + this.horOffset;
    var y          = northWest.y - this.verOffset;
    var southWest;
    var northEast;
    
    this.x      = x;
    this.y      = y;
    this.width  = this.container.clientWidth;
    this.height = this.container.clientHeight;

    if (screenNW.x < this.container.clientWidth)
        this.left = x;
    else
        this.left = x - this.container.clientWidth;

    this.container.style.left = int2pix (this.left);
    
    if (screenNW.y < this.container.clientHeight)
        this.top = y;
    else
        this.top = y - this.container.clientHeight;
    
    this.container.style.top = int2pix (this.top);
        
    southWest = projection.fromDivPixelToLatLng (new google.maps.Point (this.left - 10, this.top + this.height + 10));
    northEast = projection.fromDivPixelToLatLng (new google.maps.Point (this.left + this.width + 10, this.top - 10));
    
    this.bounds = new google.maps.LatLngBounds (southWest, northEast);
    
    div.onclick = function (event)
                  {
                      this.style.zIndex = 1000;

                      if (event)
                          event.cancelBubble = true;
                      else
                          window.event.cancelBubble = true;

                      if ('stopPropagation' in event)
                          event.stopPropagation ();
                  };
                       
     if (this.timeout)
     {
         var object = this;
         
         setTimeout (function () { object.hide (); }, 5000);
     }
};

Cary.controls.MFBalloon.prototype.setText = function (text)
{
    if (this.container !== null)
        this.container.innerText = text;
};

Cary.controls.MFBalloon.prototype.getClientRect = function ()
{
    return this.container === null ? null : this.containe.getBoundingClientRect ();
};

Cary.controls.MFBalloon.prototype.getEstimatedRect = function ()
{
    var overlayProjection = this.getProjection ();
    var result;
    var northWest;
    
    if (overlayProjection === null)
    {
        result = null;
    }
    else
    {
        northWest = overlayProjection.fromLatLngToDivPixel (this.position);

        result = { left: northWest.x + this.horOffset, top: northWest.y, width: 150, height: 25 };
    }
    
    return result;
};

Cary.controls.MFBalloon.prototype.containsPoint = function (x, y)
{
   return (x >=  (this.left - 10)) && (y >= (this.top - 10)) && (x <= (this.left + this.width + 10)) && (y <= (this.top + this.height + 10));
};

Cary.controls.MFBalloon.prototype.bound = function ()
{
    return this.bounds !== null;
};
    
Cary.controls.MFBalloon.prototype.containsPos = function (pos)
{
   return this.bounds && this.bounds.contains (pos);
};
