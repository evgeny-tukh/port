Cary.ui.Button = function (desc, styles)
{
    if (!('className' in desc))
        desc.className = 'button';
    
    Cary.ui.Control.apply (this, arguments);
};

Cary.ui.Button.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.Button.prototype.initialize = function ()
{
    this.htmlObject       = document.createElement ('input');
    this.htmlObject.value = this.getParam ('text');
    this.htmlObject.type  = 'button';    

    if ('onClick' in this.desc)
        this.htmlObject.onclick = this.desc.onClick;
    
    Cary.ui.Control.prototype.initialize.apply (this, arguments);
};

Cary.ui.Button.prototype.setClickHandler = function (handler)
{
    this.htmlObject.onclick = handler;
};

Cary.ui.PopUpMenu = function (desc, styles)
{
    this.popupItems = [];
    
    Cary.ui.Control.apply (this, arguments);
};

Cary.ui.PopUpMenu.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.PopUpMenu.prototype.initialize = function ()
{
    var instance = this;
    
    this.anchorElement = 'anchorElement' in this.desc ? this.desc.anchorElement : null;
    this.htmlObject    = document.createElement ('div');
    
    this.htmlObject.className = 'popUpMenu';
    
    if ('menuWidth' in this.desc && this.desc.menuWidth !== null)
        this.htmlObject.style.width = Cary.tools.int2pix (this.desc.menuWidth);
    
    this.desc.items.forEach (function (item) { instance.addMenuItem (item); });

    Cary.ui.Control.prototype.initialize.apply (this, arguments);
};

Cary.ui.PopUpMenu.prototype.addMenuItem = function (item)
{
    var itemDiv  = document.createElement ('div');
    var instance = this;

    itemDiv.innerText  = item.text;
    itemDiv.onclick    = function ()
                         {
                             instance.show (false);

                             if ('param' in item)
                                item.action (item.param);
                            else
                                item.action ();
                         };
    itemDiv.className  = 'popUpMenuItem';
    itemDiv.onmouseout = onMouseOut;

    this.htmlObject.appendChild (itemDiv);

    this.popupItems.push (itemDiv);

    function onMouseOut (event)
    {
        this.mouseIn = false;

        if (event.relatedTarget.className !== 'popUpMenuItem')
            instance.show (false);
    }
};

Cary.ui.PopUpMenu.prototype.show = function (visible)
{
    if (this.anchorElement !== null)
    {
        if (visible)
        {
            if (this.htmlObject.style.width === null || this.htmlObject.style.width === '')
                this.htmlObject.style.width  = Cary.tools.int2pix (this.anchorElement.offsetWidth);
            
            this.htmlObject.style.height = 'fit-content';
            
            if (this.desc.anchorType & Cary.ui.anchor.BOTTOM)
            {
                this.htmlObject.style.bottom  = Cary.tools.int2pix (this.anchorElement.offsetHeight + 10);
                
                if (this.desc.anchorType & Cary.ui.anchor.LEFT)
                    this.htmlObject.style.left = Cary.tools.int2pix (this.anchorElement.offsetLeft);
                else
                    this.htmlObject.style.right = Cary.tools.int2pix (this.anchorElement.offsetLeft + this.anchorElement.offsetWidth);
            }
            else if (this.desc.anchorType & Cary.ui.anchor.TOP)
            {
                this.htmlObject.style.top  = Cary.tools.int2pix (this.anchorElement.offsetTop + this.anchorElement.offsetHeight);
                
                if (this.desc.anchorType & Cary.ui.anchor.LEFT)
                    this.htmlObject.style.left = Cary.tools.int2pix (this.anchorElement.offsetLeft);
                else
                    this.htmlObject.style.right = Cary.tools.int2pix (this.anchorElement.offsetLeft + this.anchorElement.offsetWidth);
            }
            else if (this.desc.anchorType & Cary.ui.anchor.LEFT)
            {
                this.htmlObject.style.left = Cary.tools.int2pix (this.anchorElement.offsetLeft + this.anchorElement.offsetWidth);
            }
            else if (this.desc.anchorType & Cary.ui.anchor.RIGHT)
            {
                this.htmlObject.style.right = Cary.tools.int2pix (this.anchorElement.offsetLeft);
            }
                
            this.anchorElement.parentElement.appendChild (this.htmlObject);
        }
        else
        {
            this.anchorElement.parentElement.removeChild (this.htmlObject);
        }
    }
};

Cary.ui.PopUpButton = function (desc, styles)
{
    Cary.ui.Control.apply (this, arguments);
};
    
Cary.ui.PopUpButton.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.PopUpButton.prototype.initialize = function ()
{
    var instance = this;
    
    this.htmlObject  = document.createElement ('div');
    this.label       = document.createElement ('div');
    this.popupOpener = document.createElement ('div');

    this.popupOpener.className = 'popUpOpener';
    this.popupOpener.innerText = Cary.symbols.downArrow;
    this.popupOpener.onclick   = function () { instance.showPopUp (true); };

    this.htmlObject.appendChild (this.popupOpener);
    this.htmlObject.appendChild (this.label);
    
    this.htmlObject.className = 'popUpButton';
    this.htmlObject.onclick   = this.popupOpener.onclick;
    
    this.label.innerText = this.desc.text;
    this.label.className = 'popUpLabel';
    this.label.onclick   = this.popupOpener.onclick;
    
    if ('fontSize' in this.desc)
        this.label.style.fontSize = Cary.tools.int2pix (this.desc.fontSize);
    
    if ('lineHeight' in this.desc)
        this.label.style.lineHeight = Cary.tools.int2pix (this.desc.lineHeight);
    
    if ('textTop' in this.desc)
        this.label.style.marginTop = Cary.tools.int2pix (this.desc.textTop);

    Cary.ui.Control.prototype.initialize.apply (this, arguments);
    
    this.menu = new Cary.ui.PopUpMenu ({ anchorElement: this.htmlObject, anchorType: this.desc.anchorType, items: this.desc.popupMenu  }, { width: this.desc.menuWidth });
};

Cary.ui.PopUpButton.prototype.enable = function (enable)
{
    var color = enable ? null : 'gray';

    this.htmlObject.disabled     = enable ? null : 'disabled';
    this.label.style.color       = color;
    this.popupOpener.style.color = color;
};

Cary.ui.PopUpButton.prototype.center = function ()
{
    this.htmlObject.style.margin = 'auto';
};    

Cary.ui.PopUpButton.prototype.showPopUp = function (show)
{
    if (!this.htmlObject.disabled)
        this.menu.show (show);
};
