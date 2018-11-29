Cary.ui.BrowseBox = function (desc)
{
    Cary.ui.Control.apply (this, arguments);
};

Cary.ui.BrowseBox.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.BrowseBox.prototype.initialize = function ()
{
    this.htmlObject   = document.createElement ('div');
    this.editBox      = document.createElement ('input');
    this.browseButton = document.createElement ('button');

    this.editBox.type           = 'text';
    this.editBox.className      = 'editBox';
    this.browseButton.className = 'browseButton';
    this.browseButton.innerText = Cary.symbols.magnifier1;

    this.editBox.style.display = 'inline';
    this.editBox.style.height  = '100%';
    
    if ('width' in this.styles && typeof (this.styles.width) === 'number')
        this.editBox.style.width = Cary.tools.int2pix (this.styles.width - 50);
    
    if ('onBrowse' in this.desc)
        this.browseButton.onclick = this.desc.onBrowse;

    this.htmlObject.appendChild (this.editBox);
    this.htmlObject.appendChild (this.browseButton);
    
    Cary.ui.Control.prototype.initialize.apply (this, arguments);
};

Cary.ui.BrowseBox.prototype.getValue = function ()
{
    return this.editBox.value;
};
    
Cary.ui.BrowseBox.prototype.setValue = function (value)
{
    this.editBox.value = value;
};
