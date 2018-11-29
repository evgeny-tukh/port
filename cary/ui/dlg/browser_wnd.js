Cary.ui.BrowserWnd = function (parent, options)
{
    var width;
    var height;
    var title;
    var parent;
    
    this.options = Cary.tools.isNothing (options) ? {} : options;
    this.link    = 'link' in options ? options.link : null;
    
    width  = 'width' in options ? options.width : 600;
    height = 'height' in options ? options.height : 500;
    title  = 'title' in options ? options.title : 'Browse document';

    if (Cary.tools.isNothing (parent))
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: width, height: height, visible: true, absolute: true }, title: title, parent: parent, visible: true }]);
};

Cary.ui.BrowserWnd.prototype = Object.create (Cary.ui.Window.prototype);

Cary.ui.BrowserWnd.prototype.onInitialize = function ()
{
    new Cary.ui.Browser ({ source: this.link, parent: this.client, scrollable: true, visible: true }, { left: 0, top: 0, width: '100%', height: '100%', position: 'absolute' });
};
