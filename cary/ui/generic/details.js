Cary.ui.Details = function (desc, styles)
{
    this.backupContent = null;
    
    if (!('className' in desc))
        desc.className = 'details';
    
    Cary.ui.Control.apply (this, arguments);
};

Cary.ui.Details.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.Details.prototype.initialize = function ()
{
    this.htmlObject = document.createElement ('div');
    
    this.htmlObject.className = this.desc.className;

    Cary.ui.Control.prototype.initialize.apply (this, arguments);
};

Cary.ui.Details.prototype.addItem = function (name, details)
{
    var itemName    = document.createElement ('span');
    var itemDetails = document.createElement ('span');
    var paragraph   = document.createElement ('p');
    
    itemName.style.fontWeight = 'bold';
    itemName.innerText        = name + ': ';
    
    itemDetails.style.fontWeight = 'regular';
    itemDetails.innerText        = details;
    
    this.htmlObject.appendChild (itemName);
    this.htmlObject.appendChild (itemDetails);
    this.htmlObject.appendChild (paragraph);
};

Cary.ui.Details.prototype.clear = function ()
{
    this.htmlObject.innerHTML = null;
};

Cary.ui.Details.prototype.backup = function (enableMultiLevel)
{
    if (Cary.tools.isNothing (enableMultiLevel))
        enableMultiLevel = false;
    
    if (enableMultiLevel)
    {
        // Stack-like mode
        if (this.backupContent === null)
            this.backupContent = [];
        
        this.backupContent.push (this.htmlObject.innerHTML);
    }
    else if (this.backupContent === null)
    {
        // Scalar mode
        this.backupContent = this.htmlObject.innerHTML;
    }
};

Cary.ui.Details.prototype.restore = function ()
{
    if (Array.isArray (this.backupContent))
    {
        // Stack-like mode
        if (this.backupContent.length > 0)
            this.htmlObject.innerHTML = this.backupContent.splice (this.backupContent.length - 1, 1);
    }
    else if (this.backupContent)
    {
        // Scalar mode
        this.htmlObject.innerHTML = this.backupContent;
        
        this.backupContent = null;
    }
};
