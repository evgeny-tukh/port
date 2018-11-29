Cary.ui.ListBox = function (desc, styles)
{
    this.items       = [];
    this.comboBox    = 'comboBox' in desc && desc.comboBox;
    this.onItemClick = 'onItemClick' in desc ? desc.onItemClick : null;
    
    if (!('className' in desc))
        desc.className = 'listBox';
    
    Cary.ui.Control.apply (this, arguments);    
};

Cary.ui.ListBox.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.ListBox.prototype.initialize = function ()
{
    this.htmlObject           = document.createElement ('select');
    this.htmlObject.className = 'listBox wpListBox';
    this.htmlObject.size      = this.comboBox ? 1 : 2;
    
    if ('onItemSelect' in this.desc)
        this.htmlObject.onchange = this.desc.onItemSelect;
    
    Cary.ui.Control.prototype.initialize.apply (this, arguments);
    
    if ('items' in this.desc)
    {
        var instance = this;
        
        this.desc.items.forEach (function (item) { instance.addItem (item.text, item.data); });
    }
};

Cary.ui.ListBox.prototype.getCount = function ()
{
    return this.items.length;
};

Cary.ui.ListBox.prototype.getSelectedData = function ()
{
    var result;
    var selection = this.getCurSel ();

    if (selection >= 0)
        result = this.getItemData (selection);
    else
        result = null;

    return result;
};

Cary.ui.ListBox.prototype.addItem = function (text, data, selectNewItem)
{
    var itemObject = document.createElement ('option');
    var instance   = this;

    if (Cary.tools.isNothing (selectNewItem))
        selectNewItem = false;
    
    itemObject.className = 'listBoxItem';
    itemObject.onselect  = function ()
                           {
                                var i, selection;

                                for (i = 0, selection = -1; i < instance.htmlObject.options.length; ++ i)
                                {
                                   if (this === this.parentElement.options [i])
                                   {
                                       selection = i; break;
                                   }
                                }

                                if (selection >= 0)
                                {
                                    instance.setCurSel (selection);

                                    if (instance.onItemClick !== null)
                                        instance.onItemClick (selection);
                                }
                           };
    itemObject.onclick   = itemObject.onselect;

    if (this.htmlObject.style.color)
        itemObject.style.color = this.htmlObject.style.color;

    this.htmlObject.appendChild (itemObject);

    if (!this.comboBox)
        this.htmlObject.size = this.items.length > 0 ? this.items.length + 1 : 2;

    itemObject.innerText = text;

    this.items.push ({ itemObject: itemObject, data: data });

    if (selectNewItem)
        this.setCurSel (this.items.length - 1);
    
    return this.items.length - 1;
};

Cary.ui.ListBox.prototype.removeItem = function (index)
{
    this.items.splice (index, 1);

    this.htmlObject.options.remove (index);
};

Cary.ui.ListBox.prototype.setCurSel = function (selection)
{
    this.htmlObject.selectedIndex = selection;
};

Cary.ui.ListBox.prototype.getCurSel = function ()
{
    return this.htmlObject.selectedIndex;
};

Cary.ui.ListBox.prototype.getItemData = function (index)
{
    return (index >= 0 && index < this.items.length) ? this.items [index].data : null;
};

Cary.ui.ListBox.prototype.setItemData = function (index, data)
{
    if (index >= 0 && index < this.items.length)
        this.items [index].data = data;
};

Cary.ui.ListBox.prototype.getItemText = function (index)
{
    return (index >= 0 && index < this.items.length) ? this.items [index].itemObject.innerText : null;
};

Cary.ui.ListBox.prototype.getSelectedText = function ()
{
    return this.htmlObject.selectedIndex >= 0 ? this.items [this.htmlObject.selectedIndex].itemObject.innerText : null;
};

Cary.ui.ListBox.prototype.setItemText = function (index, text)
{
    if (index >= 0 && index < this.items.length)
        this.items [index].itemObject.innerText = text;
};

Cary.ui.ListBox.prototype.resetContent = function ()
{
    while (this.htmlObject.options.length > 0)
        this.htmlObject.options.remove (0);
};

Cary.ui.ListBox.prototype.selectByData = function (data)
{
    var i;
    
    for (i = 0; i < this.items.length; ++ i)
    {
        if (this.items [i].data === data)
        {
            this.setCurSel (i); break;
        }
    }
};