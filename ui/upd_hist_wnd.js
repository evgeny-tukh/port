function UpdateHistoryWnd (object, parent)
{
    this.object = object;
    
    if (Cary.tools.isNothing (parent))
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 700, height: 300, absolute: true }, 
                                 title: stringTable.updateHistory + ': ' + object.name, parent: parent, visible: true }]);
}

UpdateHistoryWnd.prototype = Object.create (Cary.ui.Window.prototype);

UpdateHistoryWnd.prototype.onInitialize = function ()
{
    var instance   = this;
    var columns    = [{ title: stringTable.date, width: 90 }, { title: stringTable.action, width: 100 }, { title: stringTable.oldValue, width: 250 },
                      { title: stringTable.newValue, width: 250 }];
    var updateList = new Cary.ui.ListView ({ parent: this.client, columns: columns, visible: true }, { width: '100%', height: '100%' });
    
    Cary.tools.sendRequest ({ method: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText, url: 'requests/upd_get.php?t=2&s=' + this.object.id.toString (),
                              onLoad: onLoad, resType: Cary.tools.resTypes.json });
                          
    function onLoad (updates)
    {
        updates.forEach (function (update)
                         {
                             updateList.addItem ([Cary.tools.formatDate (update.timestamp * 1000), log.actionToString (update.action), update.oldValue, update.newValue]);
                         });
    }
};
