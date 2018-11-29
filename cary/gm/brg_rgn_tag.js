Cary.controls.Balloon = function (map, options)
{
    var point = {};
    
    if ('text' in options)
    {
        this.text = options.text;
        this.html = null;
    }
    else if ('html' in options)
    {
        this.html = options.html;
        this.text = null;
    }
    else
    {
        this.text = null;
        this.html = null;
    }
        
    this.options   = options;
    this.map       = Cary.checkMap (map);
    this.horOffset = 'horOffset' in options ? options.horOffset : 0;
    this.verOffset = 'verOffset' in options ? options.verOffset : 0;
    
    if ('lat' in options && 'lon' in options)
    {
        var projection = this.map.getProjection ();
        var northWest  = projection.fromLatLngToDivPixel (new google.maps.LatLng (options.lat, options.lon));
        
        point.x = northWest.x + this.horOffset;
        point.y = northWest.y - this.verOffset;
    }
    else if ('x' in options && 'y' in options)
    {
        point.x = options.x + this.horOffset;
        point.y = options.y - this.verOffset;
    }
    
    Cary.controls.GenericDomControl.apply (this, [map, point]);
    
    this.container.className = 'balloon';
    
    if (this.text !== null)
        this.container.innerText = this.text;
    else if (this.html !== null)
        this.container.innerHtml = this.html;
};

Cary.controls.Balloon.prototype = Object.create (Cary.controls.GenericDomControl.prototype);

Cary.controls.Balloon.prototype.setPosition = function (lat, lon)
{
    var position = Cary.maps.geoToClient (this.map, new google.maps.LatLng (lat, lon));
    
    this.container.style.left = Cary.tools.int2pix (position.x + this.horOffset);
    this.container.style.top  = Cary.tools.int2pix (position.y - this.verOffset);
    
    this.checkPosition ();
};

Cary.controls.Balloon.prototype.setDomPosition = function (x, y)
{
    this.container.style.left = Cary.tools.int2pix (x + this.horOffset);
    this.container.style.top  = Cary.tools.int2pix (y - this.verOffset);
    
    this.checkPosition ();
};

Cary.controls.Balloon.prototype.setText = function (text)
{
    this.text = text;
    
    this.container.innerText = text;
    
    this.checkPosition ();
};

Cary.controls.Balloon.prototype.setHtml = function (html)
{
    this.html = html;
    
    this.container.innerHtml = html;
    
    this.checkPosition ();
};

Cary.controls.Balloon.prototype.checkPosition = function (x, y)
{
    var mapDiv = this.map.getDiv ();

    if (Cary.tools.isNothing (x))
        x = parseInt (this.container.style.left);
    
    if (Cary.tools.isNothing (y))
        y = parseInt (this.container.style.top);
    
    if ((x + this.container.clientWidth) > mapDiv.clientWidth)
        this.container.style.left = Cary.tools.int2pix (x - this.horOffset - this.container.clientWidth);
    
    if ((y + this.container.clientHeight) > mapDiv.clientHeight)
        this.container.style.top = Cary.tools.int2pix (y - this.verOffset - this.container.clientHeight);
};
