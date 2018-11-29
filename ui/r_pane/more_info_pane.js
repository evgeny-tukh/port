function MoreInfoPane (parent, callbacks, options)
{
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;

    this.callbacks.onEditSettings = showSettingsMenu;

    ConfigurablePane.apply (this, [parent, stringTable.moreInfo, { bottom: 5, left: 5, right: 5, height: 200, absolute: true }, this.callbacks]);

    function showSettingsMenu (instance)
    {
        var items = [{ text: stringTable.userInfoList, action: onEditUserInfoList }];
        var menu  = new Cary.ui.PopUpMenu ({ anchorElement: instance.settingsButton, anchorType: (Cary.ui.anchor.TOP | Cary.ui.anchor.LEFT), items: items  }, { width: 150 });
        
        menu.show (true);
    }

    function onEditUserInfoList ()
    {
        new UserInfoListWnd;
    }
}

MoreInfoPane.prototype = Object.create (ConfigurablePane.prototype);

MoreInfoPane.prototype.showInfo = function (visible, info)
{
    this.noInfo.style.display = visible ? 'none' : null;
    
    if (visible && !Cary.tools.isNothing (info))
    {
        var infoBox = this.info;
        
        this.info.clear ();
        
        info.items.forEach (function (item)
                            {
                                infoBox.addItem (item.name, item.value);
                            });
    }
    
    this.info.show (visible);
};

MoreInfoPane.prototype.onInitialize = function ()
{
    var columns  = [{ title: stringTable.category, width: 110 }, { title: stringTable.info, width: 150 }];
    
    ConfigurablePane.prototype.onInitialize.apply (this, arguments);
    //this.info = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: false}, 
    //                                  { position: 'absolute', right: 2, top: 25, left: 0, height: parseInt (this.wnd.style.height) - 60 });
    this.info = new Cary.ui.Details ({ parent: this.wnd, columns: columns, visible: false}, 
                                     { position: 'absolute', right: 2, top: 25, left: 0, height: parseInt (this.wnd.style.height) - 60 });
                                     
    this.noInfo = document.createElement ('div');
    
    this.noInfo.style.width         = '100%';
    this.noInfo.style.height        = Cary.tools.int2pix (150);
    this.noInfo.style.top           = Cary.tools.int2pix (50);
    this.noInfo.style.textAlign     = 'center';
    this.noInfo.style.padding       = Cary.tools.int2pix (0);
    this.noInfo.style.paddingTop    = Cary.tools.int2pix (5);
    this.noInfo.style.paddingBottom = Cary.tools.int2pix (5);
    this.noInfo.innerHTML           = '<div style="margin:auto;margin-top:60px;font-size:18px;font-weight:bold;">No object selected</div>';
    
    this.wnd.appendChild (this.noInfo);
    
    this.showInfo (true);
};
