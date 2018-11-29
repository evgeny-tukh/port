var log = { actions: {} };

log.actions.NEW_LAYER      = 1;
log.actions.DEL_LAYER      = 2;
log.actions.NEW_OBJECT     = 3;
log.actions.DEL_OBJECT     = 4;
log.actions.NEW_ATTACHMENT = 5;
log.actions.DEL_ATTACHMENT = 6;
log.actions.UPL_ATTACHMENT = 7;
log.actions.UI_CHANGED     = 8;

// Custop actions
log.actions.DRAFT_CHANGED  = 100;

log.actionToString = function (action)
{
    var result;
    
    switch (action)
    {
        case log.actions.NEW_LAYER:
            result = stringTable.newLayer; break;
        
        case log.actions.DEL_LAYER:
            result = stringTable.delLayer; break;
        
        case log.actions.NEW_OBJECT:
            result = stringTable.newObject; break;
        
        case log.actions.DEL_OBJECT:
            result = stringTable.delObject; break;
        
        case log.actions.NEW_ATTACHMENT:
            result = stringTable.newAttachment; break;
        
        case log.actions.DEL_ATTACHMENT:
            result = stringTable.delAttachment; break;
        
        case log.actions.UI_CHANGED:
            result = stringTable.userInfoChanged; break;
            
        case log.actions.DRAFT_CHANGED:
            result = stringTable.draftChanged; break;
            
        default:
            result = '';
    }
    
    return result;
};

log.Update = function (desc)
{
    this.action    = desc.action;
    this.id        = 'id' in desc ? desc.id : 0;
    this.timestamp = Cary.tools.time ();
    this.subject   = desc.subject;
    this.oldValue  = 'oldValue' in desc ? desc.oldValue : null;
    this.newValue  = desc.newValue;
};

log.Update.prototype.serialize = function ()
{
    return { action: this.action, id: this.id, timestamp: Math.floor (this.timestamp / 1000), subject: this.subject, oldValue: this.oldValue, newValue: this.newValue };
};

log.Update.prototype.deserialize = function (source)
{
    this.action    = source.action;
    this.id        = source.id;
    this.timestamp = source.timestamp * 1000;
    this.subject   = source.subject;
    this.oldValue  = source.oldValue;
    this.newValue  = source.newValue;
};

log.UpdateList = function ()
{
    this.updates = [];
};

log.UpdateList.prototype.serialize = function ()
{
    var result = [];
    
    this.updates.forEach (function (update)
                          {
                              result.push (update.serialize ());
                          });
    
    return result;
};

log.UpdateList.prototype.deserialize = function (source)
{
    var instance = this;
    
    this.updates = [];
    
    source.forEach (function (sourceItem)
                    {
                        var update = new Update ();
                        
                        update.deserialize (sourceItem);
                        
                        instance.updates.push (update);
                    });
};

log.UpdateList.prototype.add = function (desc)
{
    this.updates.push (new log.Update (desc));
};
