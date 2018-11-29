function ObjectEditorPane (parent, callbacks, options)
{
    SidePane.apply (this, 
                    [{},
                     { position: { top: -2, left: -2, width: Cary.tools.int2pix (parent.clientWidth - 30), height: Cary.tools.int2pix (parent.clientHeight - 15), absolute: true }, 
                       title: stringTable.otherInfo, parent: parent, visible: true, noCloseIcon: true }]);
};

ObjectEditorPane.prototype = Object.create (SidePane.prototype);

ObjectEditorPane.prototype.onInitialize = function ()
{
    SidePane.prototype.onInitialize.apply (this, arguments);

    //this.userIconLibPane = new UserIconsPane (this.client);
    this.moreInfoPane    = new MoreInfoPane (this.client);
    this.userLayersPane  = new UserLayersPane (this.client, null, { height: this.parent.clientHeight - 270 });
};
