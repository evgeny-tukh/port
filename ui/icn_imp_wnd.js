function IconImportWnd (parent, callbacks)
{
    this.callbacks   = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.fileBrowser = null;
    
    if (Cary.tools.isNothing (parent))
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 400, height: 270, absolute: true }, 
                                 title: stringTable.userIconImport, parent: parent, visible: true }]);
}

IconImportWnd.prototype = Object.create (Cary.ui.Window.prototype);

IconImportWnd.prototype.onInitialize = function ()
{
    var ctlStyles   = { 'text-align': 'left', margin: 0, 'margin-top': 10, padding: 0, 'padding-left': 5, height: 26, 'line-height': 26 };
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var nameBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: 'Icon name' }, ctlStyles);
    var urlBlock    = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: 'Load from URL' }, ctlStyles);
    var fileBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: 'Upload image file' }, ctlStyles);
    var viewBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true }, ctlStyles);
    var buttonStyle = { width: 70, height: 30, float: 'right' };
    var instance    = this;
    var fileBrowser = new Cary.tools.FileBroswer (this.client, { onSelect: onFileSelected }, Cary.tools.FileBroswer.readAsUrl);
    var previewCont = document.createElement ('div');
    var preview     = document.createElement ('img');
    var urlCtl      = new Cary.ui.EditBox ({ parent: urlBlock.htmlObject, visible: true, onChange: onChangeUrl }, { float: 'right', width: 250, 'margin-right': 10 });
    var nameCtl     = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, visible: true }, { float: 'right', width: 250, 'margin-right': 10 });
    var browseBox   = new Cary.ui.BrowseBox ({ parent: fileBlock.htmlObject, visible: true, onBrowse: onBrowse }, { float: 'right', width: 265 });
    var actualSize  = new Cary.ui.CheckBox ({ parent: viewBlock.htmlObject, visible: true, text: 'Actual size', onChange: onSwitchPreview }, { float: 'right' });
    
    new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.ok, parent: buttonBlock.htmlObject, visible: true, onClick: onOk }, buttonStyle);
    
    viewBlock.htmlObject.style.width = '275px';
    
    viewBlock.htmlObject.appendChild (previewCont);
    
    previewCont.appendChild (preview);
    
    previewCont.className = 'imgPreviewContainer';
    preview.className     = 'imgPreview';

    function onSwitchPreview (flag)
    {
        preview.className = flag ? 'imgPreviewActualSize' : 'imgPreview';
    }
    
    function onChangeUrl ()
    {
        preview.src = this.value;
    }
    
    function onFileSelected (dataUrl, fileName)
    {
        browseBox.setValue (fileName);
        
        urlCtl.setValue (dataUrl);
        
        preview.src = dataUrl;
    }

    function onOk ()
    {
        var name = nameCtl.getValue ();
        var url  = urlCtl.getValue ();
        
        if (name === null || name === '')
        {
            alert (stringTable.plsSpecName); return;
        }
        
        if (url === null || url === '')
        {
            alert (stringTable.plsSpecUrlOrUpl); return;
        }
        
        forceClose ();
        
        if ('onOk' in instance.callbacks)
            instance.callbacks.onOk ({ name: name, url: url });
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
    
    function onBrowse ()
    {
        fileBrowser.execute ();
    }
};

