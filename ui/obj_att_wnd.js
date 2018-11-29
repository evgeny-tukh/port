function AttachmentListWnd (object, parent, callbacks)
{
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.changed   = false;
    this.object    = object;
    
    if (Cary.tools.isNothing (parent))
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 450, height: 300, absolute: true }, 
                                 title: stringTable.objAtts, parent: parent, visible: true }]);
}

AttachmentListWnd.prototype = Object.create (Cary.ui.Window.prototype);

AttachmentListWnd.prototype.onInitialize = function ()
{
    var instance    = this;
    var buttonStyle = { width: 'fit-content', height: 30, float: 'right', 'padding-left': 10, 'padding-right': 10 };
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var attsCtl     = new Cary.ui.ListBox ({ parent: this.client, comboBox: false, visible: true }, { width: '100%', height: 230, margin: 0, padding: 0, 'font-size': 17 });
                                           
    new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: onClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.ok, parent: buttonBlock.htmlObject, visible: true, onClick: onOk }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.add, parent: buttonBlock.htmlObject, visible: true, onClick: onAdd }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.rename, parent: buttonBlock.htmlObject, visible: true, onClick: onRename }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.delete, parent: buttonBlock.htmlObject, visible: true, onClick: onDelete }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.upload, parent: buttonBlock.htmlObject, visible: true, onClick: onUpload }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.view, parent: buttonBlock.htmlObject, visible: true, onClick: onView }, buttonStyle);
    
    this.object.attachments.forEach (function (attachment)
                                     {
                                         attsCtl.addItem (attachment.name, attachment.data);
                                     });
    
    function onOk ()
    {
        var i, count;
        
        instance.object.attachments = [];
        
        for (i = 0, count = attsCtl.getCount (); i < count; ++ i)
            instance.object.attachments.push ({ name: attsCtl.getItemText (i), data: attsCtl.getItemData (i) });
        
        onClose ();
    }
    
    function onClose ()
    {
        forceClose ();
    }
    
    function onRename ()
    {
        var selection = attsCtl.getCurSel ();
        
        if (selection >= 0)
            new Cary.ui.InputBox ({ title: stringTable.attachment, prompt: stringTable.name, value: attsCtl.getItemText (selection) },
                                  { onOk: function (value) { attsCtl.setItemText (selection, value); } });
    }
    
    function onAdd ()
    {
        new Cary.ui.InputBox ({ title: stringTable.attachment, prompt: stringTable.name, value: '' },
                              { onOk: function (value)
                                      { 
                                          attsCtl.addItem (value, null, true); 
                                      } });
    }
    
    function onDelete ()
    {
        var selection = attsCtl.getCurSel ();
        
        if (selection >= 0 && confirm (stringTable.deleteAttachment))
            attsCtl.removeItem (selection);
    }

    function onUpload ()
    {
        var selection = attsCtl.getCurSel ();
        
        if (selection >= 0)
        {    
            var browser = new Cary.tools.FileBroswer (instance.client, { onSelect: onFileSelected }, Cary.tools.FileBroswer.readAsUrl);
            
            browser.execute ();

            function onFileSelected (dataUrl, fileName)
            {
                //var compressed = LZString.compress (dataUrl);
                //var decompr    = LZString.decompress (compressed);
                attsCtl.setItemData (selection, dataUrl/*LZString.compress (dataUrl)*/);
            }
        }
    }
    
    function onView ()
    {
        var selection = attsCtl.getCurSel ();
        
        if (selection >= 0)
        {
            //var attach = attsCtl.getItemData (selection);
            var url = attsCtl.getItemData (selection);
            
            if (url)
                new Cary.ui.BrowserWnd (null, { link: url/*LZString.decompress (url)*/, width: 1000 });
        }
    }
    
    function onAttachmentListLoaded (attachmentList)
    {
        attachmentList.forEach (function (attachment)
                                {
                                    attsCtl.addItem (attachment.name, attachment);
                                });
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
};
