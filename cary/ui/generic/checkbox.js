Cary.ui.CheckBox = function (desc, styles)
{
    if (!('className' in desc))
        desc.className = 'checkBox';
    
    Cary.ui.Control.apply (this, arguments);    
};

Cary.ui.CheckBox.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.CheckBox.prototype.initialize = function ()
{
    var instance = this;
    
    this.htmlObject = document.createElement ('div');
    this.checkMark  = document.createElement ('div');
    this.checked    = 'checked' in this.desc && this.desc.checked;

    this.htmlObject.className = 'checkBox';
    this.htmlObject.innerText = 'text' in this.desc ? this.desc.text : '';
    this.htmlObject.onclick   = toggle;
    this.checkMark.className  = 'checkMark';
    this.checkMark.innerText  = this.checked ? Cary.symbols.checked : Cary.symbols.unchecked;
    //this.checkMark.onclick    = toggle;
  
    this.htmlObject.appendChild (this.checkMark);
    
    Cary.ui.Control.prototype.initialize.apply (this, arguments);
    
    function toggle ()
    {
        instance.checked = !instance.checked;
        
        if ('onChange' in instance.desc)
            instance.desc.onChange (instance.checked);
        
        instance.checkMark.innerText  = instance.checked ? Cary.symbols.checked : Cary.symbols.unchecked;
    }
};

Cary.ui.CheckBox.prototype.getValue = function ()
{
    return this.checked;
};

Cary.ui.CheckBox.prototype.setValue = function (value)
{
    this.checked = value;
    
    this.checkMark.innerText  = this.checked ? Cary.symbols.checked : Cary.symbols.unchecked;
};
