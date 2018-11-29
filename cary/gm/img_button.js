Cary.controls.ImgButton = function (map, location, imgSource, options)
{
    var ctlOptions;
    
    this.imgSource = imgSource;
    this.img       = null;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    ctlOptions = { width: 'fit-content', height: 'fit-content', borderStyle: 'solid', borderColor: '#666666', borderRadius: 6, margin: 5, padding: 3, paddingBottom: 1,
                   backgroundColor: '#ccff99', cursor: 'pointer', userSelect: 'none', hiliteColor: '#99aa66', boxShadow: '1px 1px 10px rgba(0, 0, 0, 0.5)' };

    for (var key in options)
        ctlOptions [key] = options [key];
    
    Cary.controls.GenericMapDomControl.apply (this, [map, location, ctlOptions]);
    
    if ('hiliteColor' in ctlOptions)
    {
        var instance = this;
        
        this.hiliteColor           = ctlOptions.hiliteColor;
        this.normalColor           = 'backgroundColor' in ctlOptions ? ctlOptions.backgroundColor : null;
        this.container.onmouseover = function () { instance.container.style.backgroundColor = instance.hiliteColor; };
        this.container.onmouseout  = function () { instance.container.style.backgroundColor = instance.normalColor; };
    }
};

Cary.controls.ImgButton.prototype = Object.create (Cary.controls.GenericMapDomControl.prototype);

Cary.controls.ImgButton.prototype.initialize = function ()
{
    this.img = document.createElement ('img');
    
    Cary.controls.PosIndicator.prototype.initialize.apply (this, arguments);
    
    this.img.src       = this.imgSource;
    this.img.className = 'imgButton';
    this.img.draggable = false;
    
    if ('onClick' in this.options)
        this.img.onclick = this.options.onClick;
    
    this.container.appendChild (this.img);
};

Cary.controls.ImgButton.prototype.setImage = function (imgSource)
{
    this.imgSource = imgSource;
    this.img.src   = imgSource;
};
