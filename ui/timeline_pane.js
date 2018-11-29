function TimelinePane (parent, callbacks, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.calcRange = 'calcRange' in options && options.calcRange;
    
    Cary.ui.Window.apply (this, [{ position: { top: -2, left: -2, width: Cary.tools.int2pix (parent.clientWidth - 30), height: Cary.tools.int2pix (parent.clientHeight - 15), absolute: true }, 
                                 title: stringTable.timeline, parent: parent }]);
}

TimelinePane.prototype = Object.create (Cary.ui.Window.prototype);

TimelinePane.prototype.onInitialize = function ()
{
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var buttonStyle = { width: 'fit-content', height: 30, float: 'right', 'padding-left': 10, 'padding-right': 10 };
    var instance    = this;
    var columns     = [{ title: stringTable.date, width: 80, onItemDblClick: null }, { title: stringTable.objNameShort, width: 140, onItemDblClick: null }, { title: stringTable.actionShort, width: 50, onItemDblClick: null }];
    
    new Cary.ui.Button ({ text: stringTable.close, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.show, parent: buttonBlock.htmlObject, visible: true, onClick: onShow }, buttonStyle);

    this.updateList = new Cary.ui.ListView ({ parent: this.client, columns: columns, visible: true },
                                            { right: 2, top: 0, left: 0, height: parseInt (this.wnd.style.height) - 70 });
    
    Cary.tools.sendRequest ({ url: 'requests/upd_get_tl.php', mathod: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText, onLoad: onUpdateListLoaded,
                              resType: Cary.tools.resTypes.json });

    function onUpdateListLoaded (updateList)
    {
        updateList.forEach (function (update)
                            {
                                instance.updateList.addItem([Cary.tools.formatDate (update.timestamp * 1000), update.subjectName, ' ']);
                            });
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
    
    function onShow ()
    {
        
    }
};

