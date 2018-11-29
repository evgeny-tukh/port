Cary.ui.Browser = function (desc, styles)
{
    if (!('className' in desc))
        desc.className = 'static';
    
    Cary.ui.Control.apply (this, arguments);    
};

Cary.ui.Browser.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.Browser.prototype.initialize = function ()
{
    this.htmlObject               = document.createElement ('iframe');
    this.htmlObject.src           = 'source' in this.desc ? this.desc.source : 'about:blank';
    //this.htmlObject.sandbox       = '';
    this.htmlObject.innerHtml     = 'Your browser does not support IFRAME tag';
    this.htmlObject.style.padding = '0px';
    this.htmlObject.style.margin  = '0px';
    this.htmlObject.style.borderWidth = '0px';
        
    if ('scrollable' in this.desc && this.desc.scrollable)
    {
        this.htmlObject.style.overflowX = 'auto';
        this.htmlObject.style.overflowY = 'auto';
    }

    Cary.ui.Control.prototype.initialize.apply (this, arguments);
};

