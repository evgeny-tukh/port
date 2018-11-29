userObj.DepthCntPropsWnd = function (parent, object, callbacks)
{
    var instance = this;
    
    // Preserve the initial attachment state; while saving, we should generate update list based on the difference
    this.oldAttachments = [];
    
    object.attachments.forEach (function (attachment)
                                {
                                    instance.oldAttachments.push ({ name: attachment.name, data: attachment.data });
                                });
    
    this.callbacks   = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.object      = object;
    this.ctlBlkStyle = { padding: 0, 'padding-left': 10, 'margin-bottom': 8, 'margin-top': 8, height: 25, 'text-align': 'left', 'line-height': 25, 'font-size': 17 };
    
    if (parent === null)
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 400, height: 240, absolute: true }, title: stringTable.depthAreaProps, parent: parent, visible: true }]);
};

userObj.DepthCntPropsWnd.prototype = Object.create (Cary.ui.Window.prototype);

userObj.DepthCntPropsWnd.prototype.onInitialize = function ()
{
    var buttonBlock     = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var nameBlock       = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.name }, this.ctlBlkStyle);
    var maxDraughtBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.maxDraught }, this.ctlBlkStyle);
    var idBlock         = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.id }, this.ctlBlkStyle);
    var deviceBlock     = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.wlMarker }, this.ctlBlkStyle);
    var userInfoBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.correction }, this.ctlBlkStyle);
    var buttonStyle     = { width: 'fit-content', height: 30, float: 'right', 'padding-left': 15, 'padding-right': 15 };
    var instance        = this;
    var nameCtl         = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, text: this.object.name, visible: true }, { display: 'inline', float: 'right', width: 320, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var maxDraughtCtl   = new Cary.ui.EditBox ({ parent: maxDraughtBlock.htmlObject, numeric: true, float: true, min: 0.5, max: 100.0, step: 0.1, value: this.object.userProps.maxDraught, visible: true }, { display: 'inline', float: 'right', width: 50, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var idCtl           = new Cary.ui.EditBox ({ parent: idBlock.htmlObject, text: this.object.userProps ['id'], visible: true }, { display: 'inline', float: 'right', width: 50, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var deviceCtl       = new Cary.ui.ListBox ({ parent: deviceBlock.htmlObject, comboBox: true, visible: true }, { display: 'inline', float: 'right', width: 200, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var userInfoCtl     = new Cary.ui.ListBox ({ parent: userInfoBlock.htmlObject, comboBox: true, visible: true }, { display: 'inline', float: 'right', width: 200, height: 25, 'margin-right': 20, padding: 0, 'font-size': 17 });
    
    loadInfoArrayList (onUserInfoListLoaded);
    
    deviceCtl.addItem (stringTable.notLinked, null, true);
    
    waterLevelAreas.enumerate (function (area)
                               {
                                  deviceCtl.addItem (area.name, area, area.userProps.deviceID === instance.object.userProps.deviceID);
                               });
    
    new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.ok, parent: buttonBlock.htmlObject, visible: true, onClick: onOk }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.userInfoList, parent: buttonBlock.htmlObject, visible: true, onClick: onEditUserInfoList }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.attachments, parent: buttonBlock.htmlObject, visible: true, onClick: onEditAttachmentList }, buttonStyle);
    
    
    function onEditAttachmentList ()
    {
        new AttachmentListWnd (instance.object, null, {});
    }
    
    function onEditUserInfoList ()
    {
        new UserInfoListWnd (null, { onChange: onChange });
        
        function onChange ()
        {
            
        }
    }
    
    function onUserInfoListLoaded (userInfoList)
    {
        userInfoCtl.addItem (stringTable.noUserInfo, null);

        userInfoList.forEach (function (item)
                              {
                                  userInfoCtl.addItem (item.name, item.id);
                              });
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
    
    function onOk ()
    {
        var updates = instance.object.buildAttachmentUpdateList (instance.oldAttachments);
        
        if (updates.length > 0)
        {
            var updateList = new log.UpdateList ();
            
            updates.forEach (function (updateItem)
                             {
                                 var desc = { subject: instance.object.id, oldValue: null, newValue: updateItem.name };
                                 
                                 switch (updateItem.action)
                                 {
                                     case Cary.userObjects.attachmentActions.ADDED:
                                         desc.action = log.actions.NEW_ATTACHMENT; break;
                                         
                                     case Cary.userObjects.attachmentActions.DELETED:
                                         desc.action = log.actions.DEL_ATTACHMENT; break;
                                         
                                     case Cary.userObjects.attachmentActions.UPLOADED:
                                         desc.action = log.actions.UPL_ATTACHMENT; break;
                                         
                                     default:
                                         desc.action = null;
                                 }
                                 
                                 updateList.add (desc);
                             });
                             
            Cary.tools.sendRequest ({ url: 'requests/upd_reg.php', mathod: Cary.tools.methods.post, content: Cary.tools.contentTypes.json, onLoad: onUpdateRegistered,
                                      resType: Cary.tools.resTypes.json, param: updateList.serialize () });
            
            function onUpdateRegistered (result)
            {
            }
        }
        
        instance.object.userProps.maxDraught = maxDraughtCtl.getValue ();
        instance.object.userProps.id         = idCtl.getValue ();
        instance.object.userProps.deviceID   = deviceCtl.getCurSel () > 0 ? deviceCtl.getSelectedData ().userProps.deviceID : null;
        
        instance.object.userInfoID = userInfoCtl.getSelectedData ();
        instance.object.name       = nameCtl.getValue ();
        
        instance.close (true);
        
        if ('onOk' in instance.callbacks)
            instance.callbacks.onOk (instance.object);
    }
};

userObj.DepthContourPropsWnd = function (parent, object, callbacks)
{
    var instance = this;
    
    // Preserve the initial attachment state; while saving, we should generate update list based on the difference
    this.oldAttachments = [];
    
    object.attachments.forEach (function (attachment)
                                {
                                    instance.oldAttachments.push ({ name: attachment.name, data: attachment.data });
                                });
    
    Cary.ui.UserPolygonPropsWnd.apply (this, arguments);
};

userObj.DepthContourPropsWnd.prototype = Object.create (Cary.ui.UserPolygonPropsWnd.prototype);

userObj.DepthContourPropsWnd.prototype.onInitialize = function ()
{
    Cary.ui.UserPolygonPropsWnd.prototype.onInitialize.apply (this);
    
    this.setTitle (stringTable.depthCntProp);
    this.setHeight (400);
    
    var maxDraughtBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.maxDraught }, this.ctlBlkStyle);
    var idBlock         = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.id }, this.ctlBlkStyle);
    var userInfoBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.correction }, this.ctlBlkStyle);
    var userInfoBlock2  = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: '' }, this.ctlBlkStyle);
    var maxDraughtCtl   = new Cary.ui.EditBox ({ parent: maxDraughtBlock.htmlObject, numeric: true, float: true, min: 0.5, max: 100.0, step: 0.1, value: this.object.userProps ['maxDraught'], visible: true }, { display: 'inline', float: 'right', width: 50, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var idCtl           = new Cary.ui.EditBox ({ parent: idBlock.htmlObject, text: this.object.userProps ['id'], visible: true }, { display: 'inline', float: 'right', width: 50, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var userInfoCtl     = new Cary.ui.ListBox ({ parent: userInfoBlock.htmlObject, comboBox: true, visible: true }, { display: 'inline', float: 'right', width: 150, height: 25, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var instance        = this;
    var parentOkHandler = this.okButton.htmlObject.onclick;
    
    new Cary.ui.Button ({ text: stringTable.userInfoList, parent: userInfoBlock2.htmlObject, visible: true, onClick: onEditUserInfoList },
                        { width: 150, height: 30, float: 'right', 'margin-right': 20 });
    new Cary.ui.Button ({ text: stringTable.attachments, parent: this.okButton.parent, visible: true, onClick: onEditAttachmentList },
                        { width: 'fit-content', height: 30, float: 'left', 'margin-left': 10, 'padding-right': 20, 'padding-left': 20 });
    
    loadInfoArrayList (onUserInfoListLoaded);
    
    this.okButton.htmlObject.onclick = onOk;
    
    function onEditAttachmentList ()
    {
        new AttachmentListWnd (instance.object, null, {});
    }
    
    function onEditUserInfoList ()
    {
        new UserInfoListWnd (null, { onChange: onChange });
        
        function onChange ()
        {
            
        }
    }
    
    function onUserInfoListLoaded (userInfoList)
    {
        userInfoCtl.addItem (stringTable.noUserInfo, null);

        userInfoList.forEach (function (item)
                              {
                                  userInfoCtl.addItem (item.name, item.id);
                              });
    }
    
    function onOk ()
    {
        var updates = instance.object.buildAttachmentUpdateList (instance.oldAttachments);
        
        if (updates.length > 0)
        {
            var updateList = new log.UpdateList ();
            
            updates.forEach (function (updateItem)
                             {
                                 var desc = { subject: instance.object.id, oldValue: null, newValue: updateItem.name };
                                 
                                 switch (updateItem.action)
                                 {
                                     case Cary.userObjects.attachmentActions.ADDED:
                                         desc.action = log.actions.NEW_ATTACHMENT; break;
                                         
                                     case Cary.userObjects.attachmentActions.DELETED:
                                         desc.action = log.actions.DEL_ATTACHMENT; break;
                                         
                                     case Cary.userObjects.attachmentActions.UPLOADED:
                                         desc.action = log.actions.UPL_ATTACHMENT; break;
                                         
                                     default:
                                         desc.action = null;
                                 }
                                 
                                 updateList.add (desc);
                             });
                             
            Cary.tools.sendRequest ({ url: 'requests/upd_reg.php', mathod: Cary.tools.methods.post, content: Cary.tools.contentTypes.json, onLoad: onUpdateRegistered,
                                      resType: Cary.tools.resTypes.json, param: updateList.serialize () });
            
            function onUpdateRegistered (result)
            {
            }
        }
        
        instance.object.userProps ['maxDraught'] = maxDraughtCtl.getValue ();
        instance.object.userProps ['id']         = idCtl.getValue ();
        
        instance.object.userInfoID = userInfoCtl.getSelectedData ();
        
        parentOkHandler ();
    }
};

//////////////////////////////////

userObj.WaterLevelContourPropsWnd = function (parent, object, callbacks)
{
    this.callbacks   = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.object      = object;
    this.ctlBlkStyle = { padding: 0, 'padding-left': 10, 'margin-bottom': 8, 'margin-top': 8, height: 25, 'text-align': 'left', 'line-height': 25, 'font-size': 17 };
    
    if (parent === null)
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 500, height: 300, absolute: true }, title: stringTable.wlCntProp, parent: parent, visible: true }]);
};

userObj.WaterLevelContourPropsWnd.prototype = Object.create (Cary.ui.Window.prototype);

userObj.WaterLevelContourPropsWnd.prototype.onInitialize = function ()
{
    var deviceID = this.object.userProps.deviceID ? this.object.userProps.deviceID : 'new';
    
    Cary.ui.Window.prototype.onInitialize.apply (this);
    
    Cary.tools.findChildByID (this.client, Cary.ui.UserPolygonPropsWnd.FILL_COLOR_ID).style.display = 'none';
    
    var nameBlock       = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.name }, this.ctlBlkStyle);
    var idBlock         = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.id }, this.ctlBlkStyle);
    var deviceIDBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.wmID }, this.ctlBlkStyle);
    var scaleBlock      = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, id: 'scaleBlock'/*, text: 'Scale'*/ }, this.ctlBlkStyle);
    var nameCtl         = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, text: this.object.name, visible: true }, { display: 'inline', float: 'right', width: 320, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var idCtl           = new Cary.ui.EditBox ({ parent: idBlock.htmlObject, text: this.object.userProps.id, visible: true }, { display: 'inline', float: 'right', width: 50, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var deviceIDCtl     = new Cary.ui.EditBox ({ parent: deviceIDBlock.htmlObject, text: deviceID, visible: true }, { display: 'inline', float: 'right', width: 190, height: 22, 'margin-right': 20, padding: 0, top: 30, 'font-size': 17 });
    var instance        = this;
    var columns         = [{ title: stringTable.le, width: 80, onItemClick: editItem }, { title: stringTable.color, width: 90, onItemClick: editItem }];
    var levelList       = new Cary.ui.ListView ({ parent: scaleBlock.htmlObject, columns: columns, visible: true },
                                                { position: 'absolute', left: 10, top: 240/*40*/, width: 200, height: 250 });
    
    this.addButton = new Cary.ui.Button ({ text: stringTable.add, parent: scaleBlock.htmlObject, visible: true, onClick: onAddScale },
                                         { width: 90, height: 30, top: 240, position: 'absolute', left: 230 });
    this.delButton = new Cary.ui.Button ({ text: stringTable.delete, parent: scaleBlock.htmlObject, visible: true, onClick: onDeleteScale },
                                         { width: 90, height: 30, top: 280, position: 'absolute', left: 230 });
    
    levelList.itemOffset = 30;
    
    this.levelList = levelList;
    
    this.object.userProps.scale.forEach (function (scaleItem)
                                         {
                                            levelList.addItem ([scaleItem.level.toFixed (1), scaleItem.color], scaleItem);
                                         });
    
    this.okButton.htmlObject.onclick = onOk;
    
    function editItem (row, column)
    {
        var text = levelList.getItemText (row, column);
        
        new Cary.ui.InputBox ({ title: columns [column].title, prompt: stringTable.newValue, value: text, editWidth: 100 }, { onOk: setNewValue });
        
        function setNewValue (value)
        {
            levelList.setItemText (row, column, value);
        }
    }
    
    function onAddScale ()
    {
        levelList.addItem (['10000', 'green']);
    }
    
    function onDeleteScale ()
    {
        var selection = levelList.getSelectedItem ();
        
        if (selection >= 0)
            levelList.removeItem (selection);
    }
    
    function onOk ()
    {
        var scale, i, count;
        
        for (i = 0, count = levelList.getItemCount (), scale = []; i < count; ++ i)
            scale.push ({ level: parseInt (levelList.getItemText (i, 0)), color: levelList.getItemText (i, 1) });
        
        instance.object.userProps.scale    = scale;
        instance.object.userProps.id       = idCtl.getValue ();
        instance.object.userProps.deviceID = deviceIDCtl.getValue ();
        instance.object.name               = nameCtl.getValue ();
        
        instance.close (true);
        
        if ('onOk' in instance.callbacks)
            instance.callbacks.onOk (instance.object);
    }
};

