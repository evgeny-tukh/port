Cary.ui.Slider = function (desc, styles)
{
    if (!('className' in desc))
        desc.className = 'slider';
    
    Cary.ui.Control.apply (this, arguments);    
};

Cary.ui.Slider.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.Slider.prototype.initialize = function ()
{
    var instance = this;
    
    this.htmlObject = document.createElement ('input');

    this.htmlObject.type      = 'range';
    this.htmlObject.id        = 'id' in this.desc ? this.desc.id : null;
    this.htmlObject.className = this.desc.className;

    ['min', 'max', 'value', 'step'].forEach (function (key)
                                             {
                                                 if (key in instance.desc)
                                                     instance.htmlObject [key] = instance.desc [key];
                                             });
  
    if ('onChange' in this.desc)
    {
        this.htmlObject.onchange = this.desc.onChange;
        this.htmlObject.oninput  = this.desc.onChange;
    }
    
    Cary.ui.Control.prototype.initialize.apply (this, arguments);
};

Cary.ui.Slider.prototype.getValue = function ()
{
    return this.htmlObject === null ? null : this.htmlObject.value;
};
