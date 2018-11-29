Cary.ui.FlashingImage = function (/*desc, styles*/)
{
    this.timer = null;
    
    Cary.ui.Control.apply (this, arguments);    
};

Cary.ui.FlashingImage.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.FlashingImage.prototype.initialize = function ()
{
    this.htmlObject = document.createElement ('img');

    this.htmlObject.src       = this.desc.source;
    this.htmlObject.zOrder    = 'zOrder' in this.desc ? this.desc.zOrder : 1000;
    this.htmlObject.className = this.desc.className;

    Cary.ui.Control.prototype.initialize.apply (this, arguments);
};

Cary.ui.FlashingImage.prototype.flash = function (start)
{
    var htmlObject = this.htmlObject;
    
    if (Cary.tools.isNothing (start))
        start = true;
    
    if (start)
    {
        if (!this.timer)
            this.timer = setInterval (flashProc, this.desc.interval ? this.desc.interval : 500);
    }
    else if (this.timer)
    {
        clearInterval (this.timer);
        
        this.timer = null;
        
        htmlObject.style.display = 'none';
    }
    
    function flashProc ()
    {
        if (htmlObject.style.display === 'none')
            htmlObject.style.display = null;
        else
            htmlObject.style.display = 'none';
    }
};
