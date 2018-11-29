Cary.controls.MapMenu = function (map, position, items, options)
{
    var instance      = this;
    var hasCheckBoxes = false;
    var mapDiv        = map.getDiv ();
    
    Cary.controls.MapMenu.instances.push (this);
    
    if (Cary.tools.isNothing (items))
        items = {};
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    this.items     = items;
    this.options   = options;
    this.closeIcon = null;
    
    Cary.controls.GenericDomControl.apply (this, [map, position]);
    
    this.container.className = 'mapMenu';

    if ('title' in this.options)
    {
        var title = instance.addTitle (this.options.title);

        title.style.textAlign = 'left';
        
        this.closeIcon = document.createElement ('div');

        this.closeIcon.className = 'menuCloseIcon';
        this.closeIcon.innerText = Cary.symbols.cross;
        this.closeIcon.onclick   = function ()
                                   {
                                       if (instance.isLast ())
                                           instance.close ();
                                   };
    
        title.appendChild (this.closeIcon);
    }
    
    this.items.forEach (function (item)
                        {
                            hasCheckBoxes = hasCheckBoxes || ('checked' in item);
                        });
                        
    this.items.forEach (function (item)
                        {
                            if ('separator' in item && item.separator)
                                instance.addSeparator ();
                            else
                                instance.addItem (item);
                        });
                        
    // For top-level menus only:
    // Adjust position if needed (if it is out of the map div)
    if (Cary.controls.MapMenu.instances.length === 1)
    {
        if ((this.container.offsetLeft + this.container.offsetWidth) > mapDiv.offsetWidth)
            // Change tha anchor from right-handle to left-handle (from the position)
            this.container.style.left = Cary.tools.int2pix (this.container.offsetLeft - this.container.offsetWidth);

        if ((this.container.offsetTop + this.container.offsetHeight) > mapDiv.offsetHeight)
            // Change tha anchor from right-handle to left-handle (from the position)
            this.container.style.top = Cary.tools.int2pix (this.container.offsetTop - this.container.offsetHeight);
    }
};

Cary.controls.MapMenu.instances   = [];
Cary.controls.MapMenu.prototype   = Object.create (Cary.controls.GenericDomControl.prototype);
Cary.controls.MapMenu.getLastMenu = function () 
                                    {
                                        return Cary.controls.MapMenu.instances.length > 0 ? Cary.controls.MapMenu.instances [Cary.controls.MapMenu.instances.length-1] : null;
                                    };
Cary.controls.MapMenu.keyListener = document.addEventListener ('keydown',
                                                                function (event)
                                                                {
                                                                   if (event.keyCode === 27)
                                                                   {
                                                                       var lastMenu = Cary.controls.MapMenu.getLastMenu ();
                                                                       
                                                                       if (lastMenu !== null)
                                                                           lastMenu.close ();
                                                                   }
                                                                });

Cary.controls.MapMenu.prototype.isLast = function ()
{
    return Cary.controls.MapMenu.getLastMenu () === this;
};

Cary.controls.MapMenu.prototype.addTitle = function (titleText, titleOptions)
{
    if (Cary.tools.isNothing (titleOptions))
        titleOptions = {};
    
    var title = document.createElement ('div');

    title.innerText = titleText;
    title.className = 'mapMenuTitle';

    if ('data' in titleOptions)
        title.data = titleOptions.data;
    
    this.container.appendChild (title);
    
    return title;
};

Cary.controls.MapMenu.prototype.close = function ()
{
    Cary.controls.GenericDomControl.prototype.close.apply (this);
    
    Cary.controls.MapMenu.instances.splice (Cary.controls.MapMenu.instances.length - 1, 1);
};
 
Cary.controls.MapMenu.prototype.addSeparator = function ()
{
    var separator = document.createElement ('div');
    
    separator.className = 'mapMenuSeparator';
    
    this.container.appendChild (separator);
};

Cary.controls.MapMenu.prototype.addItem = function (itemData, itemOptions, hasCheckBoxes)
{
    var instance = this;
    
    if (Cary.tools.isNothing (hasCheckBoxes))
        hasCheckBoxes = false;
    
    if (Cary.tools.isNothing (itemOptions))
        itemOptions = {};
    
    var checkMark  = document.createElement ('div');
    var item       = document.createElement ('div');
    var openButton = 'subItems' in itemData ? document.createElement ('div') : null;
    var instance   = this;
    
    if (openButton !== null)
    {
        openButton.className = 'mapMenuOpenButton';
        openButton.innerText = Cary.symbols.toRight2;
        openButton.onclick   = openSubMenu;
        item.onclick         = openSubMenu;
        openButton.subItems  = itemData.subItems;
        openButton.itemDiv   = item;
    }
    
    if (hasCheckBoxes)
    {
        checkMark.innerText = Cary.symbols.check;
        checkMark.className = ('checked' in itemOptions && itemOptions.checked) ? 'checkMarkChecked' : 'checkMarkUnchecked';
        checkMark.item      = item;
    }
    
    item.className = 'mapMenuItem';
    item.checkMark = checkMark;
    item.innerText = itemData.text;
    item.menu      = this;

    if ('data' in itemOptions)
        item.data = itemOptions.data;
    
    if ('onClick' in itemData && openButton === null)
    {
        item.onclick = function ()
                       { 
                           if (instance.isLast ())
                               itemData.onClick (this);
                       };
        
        if (hasCheckBoxes)
            checkMark.onclick = item.onclick;
    }
    
    if (hasCheckBoxes)
        item.appendChild (checkMark);
    
    if (openButton !== null)
    {
        item.appendChild (openButton);
        
        item.subItems = itemData.subItems;
    }
    
    this.container.appendChild (item);
    
    return item;
    
    function openSubMenu ()
    {
        if (instance.isLast ())
        {
            var subItems = this.subItems;
            var itemDiv  = 'itemDiv' in this ? this.itemDiv : this;
            var mapDiv   = instance.map.getDiv ();
            var y        = itemDiv.offsetTop + instance.container.offsetTop;
            var x        = itemDiv.offsetLeft + instance.container.offsetLeft + itemDiv.offsetWidth + 20;
            var subMenu  = new Cary.controls.MapMenu (instance.map, { x: x, y: y }, subItems);

            if ((subMenu.container.offsetLeft + subMenu.container.offsetWidth) > mapDiv.offsetWidth)
                subMenu.container.style.left = Cary.tools.int2pix (instance.container.offsetLeft - subMenu.container.offsetWidth);

            if ((subMenu.container.offsetTop + subMenu.container.offsetHeight) > mapDiv.offsetHeight)
                subMenu.container.style.top = Cary.tools.int2pix (mapDiv.offsetHeight - subMenu.container.offsetHeight - 10);
        }
    }
};
