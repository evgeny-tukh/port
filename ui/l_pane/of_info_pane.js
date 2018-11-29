function OfficialInfoPane (parent, callbacks, options)
{
    SidePane.apply (this, 
                    [{},
                     { position: { top: -2, left: -2, width: Cary.tools.int2pix (parent.clientWidth - 30), height: Cary.tools.int2pix (parent.clientHeight - 15), absolute: true }, 
                       title: stringTable.officialInfo, parent: parent, visible: true, noCloseIcon: false }]);
}

OfficialInfoPane.prototype = Object.create (SidePane.prototype);

OfficialInfoPane.prototype.onInitialize = function ()
{
    SidePane.prototype.onInitialize.apply (this, arguments);
    
    this.depthAreasPane = new DepthAreasPane (this.client);
    this.documentsPane  = new DocumentsPane (this.client, null, { height: this.parent.clientHeight - 270 });
};

OfficialInfoPane.prototype.queryClose = function ()
{
    return true;
};

OfficialInfoPane.prototype.close = function (quiet)
{
    globalInterface.hideLeftPane ();
    
    //SidePane.prototype.close.apply (this, arguments);
};
