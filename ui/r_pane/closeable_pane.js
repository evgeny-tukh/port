function CloseablePane (title, parent, callbacks, options)
{
    var wndDesc = { position: { top: -2, left: -2, width: Cary.tools.int2pix (parent.clientWidth - 30), height: Cary.tools.int2pix (parent.clientHeight - 15), absolute: true },
                    title: title ? title : '', parent: parent, visible: true };

    if (Cary.tools.isNothing (callbacks))
        callbacks = {};
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    if ('onClose' in callbacks)
        wndDesc.onClose = callbacks.onClose;

    Cary.ui.Window.apply (this, [wndDesc]);
}

CloseablePane.prototype = Object.create (Cary.ui.Window.prototype);

CloseablePane.prototype.queryClose = function ()
{
    return true;
};

