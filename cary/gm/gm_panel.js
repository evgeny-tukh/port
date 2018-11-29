Cary.controls.GMPanel = function (map, location, options)
{
    var ctlOptions;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    ctlOptions = { fontSize: 12, width: 300, height: '95%', borderStyle: 'solid', borderColor: 'black', borderRadius: 4, margin: 10, padding: 3, marginRight: 10, zIndex: 10    ,
                   backgroundColor: 'lightcyan', boxShadow: '1px 1px 10px rgba(0, 0, 0, 0.5)' };

    for (var key in options)
        ctlOptions [key] = options [key];

    this.slidingMode = Cary.controls.GMPanel.slidingMode.NONE;
    this.cover       = null;
    this.options     = options;
    this.activeItem  = null;
    
    Cary.controls.GenericMapDomControl.apply (this, [map, location, ctlOptions]);
    
    this.container.style.zOrder = 500;
};

Cary.controls.GMPanel.slidingMode = { LEFT: 1, RIGHT: 2, NONE: 0 };

Cary.controls.GMPanel.prototype = Object.create (Cary.controls.GenericMapDomControl.prototype);

Cary.controls.GMPanel.prototype.setSlidingMode = function (mode, transitionTime)
{
    this.slidingMode = mode;
    
    if (Cary.tools.isNothing (transitionTime))
        transitionTime = 0.5;
    
    switch (mode)
    {
        case Cary.controls.GMPanel.slidingMode.LEFT:
            this.container.style.left        = '0px';
            this.container.style.marginRight = this.options.width;
            
            break;
            
        case Cary.controls.GMPanel.slidingMode.RIGHT:
            this.container.style.right      = '0px';
            this.container.style.marginLeft = this.options.width;
            
            break;
            
        default:
            break;
    }
    
    this.container.style.transition = transitionTime.toString () + 's';
    this.container.style.display    = null;
    
    this.slideOut ();
};

Cary.controls.GMPanel.prototype.slideIn = function (forceImmediately)
{
    var transition = null;
    
    if (forceImmediately)
    {
        transition = this.container.style.transition;
        
        this.container.style.transition = null;
    }
    
    switch (this.slidingMode)
    {
        case Cary.controls.GMPanel.slidingMode.LEFT:
            this.container.style.left       = '0px';
            this.container.style.marginLeft = '10px'; break;
        
        case Cary.controls.GMPanel.slidingMode.RIGHT:
            this.container.style.right       = '0px';
            this.container.style.marginRight = '10px'; break;
            
        default:
            return;
    }
    
    if (forceImmediately && transition !== null)
        setTimeout (function () { this.container.style.transition = transition; }, 200);
    
    if ('onOpen' in this.options)
        this.options.onOpen (this);
};

Cary.controls.GMPanel.prototype.slideOut = function (forceImmediately)
{
    var hideDistance = Cary.tools.int2pix (- parseInt (this.options.width) - 60);
    var transition   = null;
    
    if (forceImmediately)
    {
        transition = this.container.style.transition;
        
        this.container.style.transition = null;
    }
    
    switch (this.slidingMode)
    {
        case Cary.controls.GMPanel.slidingMode.LEFT:
            this.container.style.marginLeft = hideDistance; break;
        
        case Cary.controls.GMPanel.slidingMode.RIGHT:
            this.container.style.marginRight = hideDistance; break;
            
        default:
            return;
    }
    
    if (forceImmediately && transition !== null)
        setTimeout (function () { this.container.style.transition = transition; }, 200);
    
    if ('onClose' in this.options)
        this.options.onClose (this);
};

Cary.controls.GMPanel.prototype.addSubPanel = function (options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var subPanel = document.createElement ('div');
    
    Cary.controls.setStyles (subPanel, options);
    
    //subPanel.style.display = 'block';
    subPanel.style.width   = '101%';
    
    this.container.appendChild (subPanel);
    
    return subPanel;
};

Cary.controls.GMPanel.prototype.addTitle = function (titleText, options, onClose)
{
    if (Cary.tools.isNothing (options))
        options = { left: 0, right: 0, height: 30, margin: 0, border: 'none', fontSize: 20, borderBottomStyle: 'solid', borderBottomColor: 'lightgray', borderBottomWidth: 1,
                    textAlign: 'center' };
    
    var closeIcon = document.createElement ('div');
    var text      = document.createElement ('div');
    var title     = this.addSubPanel (options);
    var instance  = this;

    closeIcon.style.display         = 'inline';
    closeIcon.style.float           = 'right';
    closeIcon.style.marginRight     = '10px';
    closeIcon.style.lineHeight      = '20px';
    closeIcon.style.backgroundColor = 'transparent';
    closeIcon.style.color           = 'gray';
    closeIcon.style.fontSize        = '30px';
    closeIcon.innerText             = Cary.symbols.toLeft2;
    closeIcon.onclick               = doClose;
    closeIcon.style.cursor          = 'pointer';
    closeIcon.style.userSelection   = 'none';

    text.style.display         = 'inline';
    text.style.float           = 'left';
    text.style.marginRight     = '15px';
    text.style.lineHeight      = '24px';
    text.backgroundColor       = 'transparent';
    text.style.color           = 'black';
    text.style.fontSize        = '20px';
    text.innerText             = titleText;
    text.style.textAlign       = 'right';
    text.style.left            = '50px';
    text.style.width           = 'width' in options ? options.width : '180px';

    title.appendChild (text);
    title.appendChild (closeIcon);
    
    this.lock = function ()
                {
                    closeIcon.style.display = 'none';
                   
                    instance.activeItem.className = Cary.settings.selectedItemClass;
        
                    instance.enable (false);
                };
    
    this.unlock = function ()
                {
                    closeIcon.style.display = null;
                    
                    if (instance.activeItem !== null)
                        instance.activeItem.className = Cary.settings.activeItemClass;
        
                    instance.enable (true);
                    
                    instance.activeItem = null;
                };
    
    function doClose ()
    {
        if (instance.slidingMode === Cary.controls.GMPanel.slidingMode.NONE)
            instance.show (false);
        else
            instance.slideOut ();
        
        if (!Cary.tools.isNothing (onClose))
            onClose ();
    }
};

Cary.controls.GMPanel.prototype.show = function (visible)
{
    if (Cary.tools.isNothing (visible))
        visible = true;
    
    Cary.controls.GenericMapDomControl.prototype.show.apply (this, arguments);

    if (visible)
    {
        if ('onOpen' in this.options)
            this.options.onOpen (this);
    }
    else
    {
        if ('onClose' in this.options)
            this.options.onClose (this);
    }
};

Cary.controls.GMPanel.prototype.addSubMenu = function (options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var subMenu    = document.createElement ('div');
    var openButton = document.createElement ('div');
    var instance   = this;
    
    subMenu.style.width      = '100%';
    subMenu.style.height     = 'height' in options ? options.height : '20px';
    subMenu.style.margin     = '0px';
    subMenu.style.textAlign  = 'left';
    subMenu.style.fontSize   = '15px';
    subMenu.style.padding    = '8px';
    subMenu.style.cursor     = 'pointer';
    subMenu.style.userSelect = 'none';
    subMenu.onclick          = doClick;
    
    subMenu.className = Cary.settings.activeItemClass;
    
    openButton.style.width      = '30px';
    openButton.style.height     = '100%';
    openButton.style.margin     = '0px';
    openButton.style.float      = 'right';
    openButton.style.cursor     = 'pointer';
    openButton.style.fontSize   = '25px';
    openButton.style.lineHeight = '15px';
    openButton.innerText        = Cary.symbols.toRight2;
    openButton.doClick          = doClick;
    
    if ('text' in options)
        subMenu.innerText = options.text;
    
    Cary.controls.setStyles (subMenu, options);
    
    if ('parent' in options)
        options.parent.appendChild (subMenu);
    else
        this.container.appendChild (subMenu);
    
    subMenu.appendChild (openButton);
    
    return subMenu;
    
    function doClick ()
    {
        instance.activeItem = subMenu;
        
        instance.lock ();
        
        if ('onClick' in options)
            options.onClick ();
    }
};

Cary.controls.GMPanel.prototype.initialize = function ()
{
    //this.container.className = 'sliding';
    
    if ('onInit' in this.options)
        this.options.onInit (this);
};

Cary.controls.GMPanel.prototype.enable = function (flag)
{
    if (flag)
    {
        if (this.cover !== null)
        {
            this.container.removeChild (this.cover);
            
            this.cover = null;
        }
    }
    else
    {
        this.cover = document.createElement ('div');

        this.cover.style.position = 'absolute';
        this.cover.style.left     = '0px';
        this.cover.style.top      = '0px';
        this.cover.style.width    = '100%';
        this.cover.style.height   = '100%';
        this.cover.style.margin   = '0px';
        this.cover.style.zOrder   = 500;
        //this.cover.style.backgroundColor='yellow';
        this.cover.disabled       = true;
        
        this.container.appendChild (this.cover);
    }
};

Cary.controls.GMPanel.prototype.addItem = function (itemText, divOptions, onClick, itemOptions)
{
    if (Cary.tools.isNothing (itemOptions))
        itemOptions = {};
    
    if (Cary.tools.isNothing (divOptions))
        divOptions = { left: 0, right: 0, width: '100%', height: 30, margin: 0, border: 'none', fontSize: 20, borderBottomStyle: 'solid', borderBottomColor: 'lightgray', borderBottomWidth: 1,
                       textAlign: 'center' };
    
    var checkMark = document.createElement ('div');
    var text      = document.createElement ('div');
    var item      = this.addSubPanel ({ display: 'block' });

    checkMark.style.width         = '20px';
    checkMark.style.height        = '100%';
    checkMark.style.textAlign     = 'left';
    checkMark.style.fontSize      = '18px';
    checkMark.style.lineHeight    = '5px';
    checkMark.style.display       = 'inline';
    checkMark.style.padding       = '8px';
    checkMark.style.margin        = '0px';
    checkMark.style.float         = 'left';
    checkMark.style.color         = ('checked' in itemOptions && itemOptions.checked) ? null : 'transparent';
    checkMark.style.cursor        = 'pointer';
    checkMark.style.userSelection = 'none';
    checkMark.innerText           = Cary.symbols.check;
    checkMark.item                = item;
    
    text.style.display         = 'inline';
    text.style.float           = 'left';
    text.style.marginRight     = '15px';
    text.style.cursor          = 'pointer';
    text.style.userSelection   = 'none';
    text.backgroundColor       = 'transparent';
    text.style.fontSize        = '15px';
    text.style.textAlign       = 'left';
    text.style.left            = '50px';
    text.style.width           = 'textWidth' in itemOptions ? Cary.tools.int2pix (itemOptions.textWidth) : '220px';
    text.style.padding         = '8px';
    text.style.paddingLeft     = '0px';
    text.innerText             = itemText;
    text.item                  = item;

    item.className = Cary.settings.activeItemClass;
    item.checkMark = checkMark;
    
    if ('data' in itemOptions)
        item.data = itemOptions.data;
    
    Cary.controls.setStyles (item, divOptions);
    
    if (!Cary.tools.isNothing (onClick))
    {
        text.onclick      = function () { onClick (this.item); };
        checkMark.onclick = text.onclick;
    }
    
    text.appendChild (checkMark);
    item.appendChild (text);
    
    return item;
};

Cary.controls.GMPanel.prototype.checkItem = function (item, check)
{
    item.checkMark.style.color = check ? null : 'transparent';
};

Cary.controls.GMPanel.prototype.isItemChecked = function (item)
{
    return item.checkMark.style.color !== 'transparent';
};
