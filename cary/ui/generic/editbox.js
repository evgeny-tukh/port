Cary.ui.EditBox = function (desc, styles)
{
    if (!('className' in desc))
        desc.className = 'editBox';
    
    Cary.ui.Control.apply (this, arguments);    
};

Cary.ui.EditBox.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.EditBox.prototype.initialize = function ()
{
    this.htmlObject = document.createElement ('input');
    this.numeric    = 'numeric' in this.desc && this.desc.numeric;
    this.float      = 'float' in this.desc && this.desc.float;
    this.readOnly   = 'readOnly' in this.desc && this.desc.readOnly;

    this.htmlObject.type      = this.numeric ? 'number' : 'text';
    this.htmlObject.id        = 'id' in this.desc ? this.desc.id : null;
    this.htmlObject.className = 'editBox';
    
    if (this.readOnly)
        this.htmlObject.readOnly = true;
  
    if ('onChange' in this.desc)
    {
        this.htmlObject.onchange = this.desc.onChange;
        this.htmlObject.oninput  = this.desc.onChange;
    }
    
    if (this.float)
        this.htmlObject.value = 'value' in this.desc ? this.desc.value : 0.0;
    else if (this.numeric)
        this.htmlObject.value = 'value' in this.desc ? this.desc.value : 0;
    else
        this.htmlObject.value = 'text' in this.desc ? this.desc.text : '';

    if (this.numeric)
    {
        if ('max' in this.desc)
            this.htmlObject.max = this.desc.max;
        
        if ('min' in this.desc)
            this.htmlObject.min = this.desc.min;
        
        if ('step' in this.desc)
            this.htmlObject.step = this.desc.step;
        
        if ('maxLength' in this.desc)
            this.htmlObject.maxlength = this.desc.maxLength;
    }
    else
    {
        if ('upperCase' in this.desc && this.desc.upperCase)
            this.htmlObject.style.textTransform = 'uppercase';
    }
    
    Cary.ui.Control.prototype.initialize.apply (this, arguments);
};

Cary.ui.EditBox.prototype.getValue = function ()
{
    var value;
    
    if (this.htmlObject !== null)
    {
        value = this.htmlObject.value;

        if (this.float)
            value = value === '' ? 0.0 : parseFloat (value);
        else if (this.numeric)
            value = value === '' ? 0 : parseInt (value);
    }
    else
    {
        value = null;
    }
    
    return value;
};

Cary.ui.TimeEditBox = function ()
{
    Cary.ui.EditBox.apply (this, arguments);    
};

Cary.ui.TimeEditBox.prototype = Object.create (Cary.ui.EditBox.prototype);

Cary.ui.TimeEditBox.prototype.initialize = function ()
{
    Cary.ui.EditBox.prototype.initialize.apply (this, arguments);

    this.htmlObject.type = 'time';
    
    this.htmlObject.setAttribute ('data-inputmask', '\'alias\': \'date\'');
};

Cary.ui.TimeEditBox.prototype.getHours = function ()
{
    var text = this.htmlObject.value ? this.htmlObject.value : '00';
    
    return parseInt (text.substr (0, 2));
};

Cary.ui.TimeEditBox.prototype.getMinutes = function ()
{
    var text = this.htmlObject.value ? this.htmlObject.value : '00:00';
    
    return parseInt (text.substr (3, 2));
};

function SpinableEditBox (desc)
{
    var container   = document.createElement ('div');
    var incButton   = document.createElement ('button');
    var decButton   = document.createElement ('button');
    var value       = 'value' in desc ? desc.value : 0;
    var isFloat     = 'float' in desc ? desc.float : false;
    var parent      = 'parent' in desc ? desc.parent : document.getElementsByTagName ('body') [0];
    var onChange    = 'onChange' in desc ? desc.onChange : null;
    var contClass   = 'containerClass' in desc ? desc.containerClass : null;
    var control;
    var controlDesc = { parent: container, text: value.toString (), left: 0, /*right: 35, position: 'absolute'*/ };
    var fields      = ['max', 'min', 'step', 'maxLength', 'rightMargin', 'lineHeight', 'fontSize', 'hidden', 'toRight',
                       'top', 'left', 'height', 'width', 'right', 'bottom', 'position', 'backgroundColor', 'color', 'textAlign',
                       'marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'className'];

    fields.forEach (function (field)
                    {
                        if (field in desc)
                            controlDesc [field] = desc [field];
                    });

    if ('onLostFocus' in desc)
        controlDesc.onLostFocus = desc.onLostFocus;
    
    if ('width' in desc)
        controlDesc.width = desc.width - 38;
    
    if (onChange)
        controlDesc.onChange = onChange;
    
    controlDesc.toRight     = false;
    controlDesc.rightMargin = 0;
    controlDesc.numeric     = false;
    
    container.className = 'spinableBox';
    
    if (contClass !== null)
        container.className += ' ' + contClass;
    
    initAttachControl (this, container, desc);

    container.style.backgroundColor = 'transparent';

    this.getValue = getValue;
    this.setValue = setValue;
    this.enable   = enable;
    
    incButton.className = 'spinUpButton';
    incButton.innerText = '▲';
    incButton.onclick   = increase;
    
    decButton.className = 'spinDnButton';
    decButton.innerText = '▼';
    decButton.onclick   = decrease;
    
    container.appendChild (decButton);
    
    control = new EditBox (controlDesc);

    enable (!(('disabled' in desc) && desc.disabled));
    
    container.appendChild (incButton);
    
    control.htmlObject.style.borderStyle     = 'none';
    control.htmlObject.style.borderWidth     = '0px';
    control.htmlObject.style.marginLeft      = '0px';
    control.htmlObject.style.marginRight     = '0px';
    control.htmlObject.style.width           = int2pix (container.clientWidth - incButton.clientWidth - decButton.clientWidth - 10);
    
    function getValue ()
    {
        return control.getValue ();
    }
    
    function setValue (value)
    {
        setControlValue (value);
    }
    
    function enable (enabled)
    {
        control.enable (enabled);
        
        incButton.disabled = control.htmlObject.disabled;
        decButton.disabled = control.htmlObject.disabled;
    }
    
    function setControlValue (value)
    {
        if ('digitsAfterComma' in desc)
            control.setValue (value.toFixed (desc.digitsAfterComma));
        else
            control.setValue (value);
    }
    
    function increase ()
    {
        var text  = control.getValue ();
        var value = isFloat ? parseFloat (text) : parseInt (text);
        var max   = 'max' in desc ? desc.max : 1E10;
        var step  = 'step' in desc ? desc.step : 1;
        
        if (value + step <= max)
            setControlValue (value + step);
        
        if (onChange)
            onChange ();
    }
    
    function decrease ()
    {
        var text  = control.getValue ();
        var value = isFloat ? parseFloat (text) : parseInt (text);
        var min   = 'min' in desc ? desc.min : -1E10;
        var step  = 'step' in desc ? desc.step : 1;
        
        if (value - step >= min)
            setControlValue (value - step);
        
        if (onChange)
            onChange ();
    }
}
