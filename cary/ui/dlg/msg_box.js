Cary.ui.MessageBox = function (options, callbacks)
{
    var width;
    var height;
    var title;
    var parent;
    
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    
    width  = 'width' in options ? options.width : 300;
    height = 'height' in options ? options.height : 100;
    title  = 'title' in options ? options.title : 'Information';
    parent = 'parent' in options ? options.parent : document.getElementsByTagName ('body') [0];

    this.text = 'text' in options ? options.text : '';
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: width, height: height, absolute: true }, title: title, parent: parent, visible: true }]);
};

Cary.ui.MessageBox.prototype = Object.create (Cary.ui.Window.prototype);

Cary.ui.MessageBox.prototype.onInitialize = function ()
{
    var instance = this;
    
    this.buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    this.dataBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: this.text }, { width: '100%', padding: 10, height: 'fit-content', 'text-align': 'center', 'line-height': 20, 'font-size': 17 });
    this.buttonStyle = { width: 70, height: 30, float: 'right' };
    this.okButton    = new Cary.ui.Button ({ text: 'OK', parent: this.buttonBlock.htmlObject, visible: true, onClick: function () { instance.close (true); } }, this.buttonStyle);
};

Cary.ui.InputBox = function (options, callbacks)
{
    Cary.ui.MessageBox.apply (this, arguments);
};

Cary.ui.InputBox.prototype = Object.create (Cary.ui.MessageBox.prototype);

Cary.ui.InputBox.prototype.onInitialize = function ()
{
    var instance = this;
    var editBox;
    var editWidth = 'editWidth' in this.options ? this.options.editWidth : 200;
    
    Cary.ui.MessageBox.prototype.onInitialize.apply (this, arguments);

    this.dataBlock.htmlObject.style.textAlign = 'left';
    this.dataBlock.htmlObject.innerText       = this.options.prompt;
    
    this.cancelButton = new Cary.ui.Button ({ text: 'Cancel', parent: this.buttonBlock.htmlObject, visible: true, onClick: function () { instance.close (true); } }, this.buttonStyle);

    editBox = new Cary.ui.EditBox ({ parent: this.dataBlock.htmlObject, text: this.options.value, visible: true }, { display: 'inline', float: 'right', width: editWidth, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    
    this.okButton.setClickHandler (onOk);
    
    function onOk ()
    {
        if ('onOk' in instance.callbacks)
            instance.callbacks.onOk (editBox.getValue ());
        
        instance.close (true);
    }
};

