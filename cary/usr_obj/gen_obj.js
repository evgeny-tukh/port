Cary.userObjects.objectTypes = {};
Cary.userObjects.lineStyles  = { SOLID: 1, DASH: 2, DOT: 4, ARROW: 8 };

Cary.userObjects.objectTypes.GENERIC_TYPE = 1;

Cary.userObjects.GenericUserObject = function (name)
{
    this.type        = Cary.userObjects.objectTypes.GENERIC_TYPE;
    this.userType    = null;
    this.name        = name;
    this.id          = 0;
    this.properties  = {};
    this.drawObjects = [];
    this.userProps   = {};
    this.attachments = [];
    this.userInfo    = null;    // Read-only
    this.userInfoID  = null;
};

Cary.userObjects.GenericUserObject.prototype.beforeShowHide = function (show) {};

Cary.userObjects.GenericUserObject.prototype.startFlashing = function (interval)
{
    if (this.drawer)
        this.drawer.startFlashing (interval);
};

Cary.userObjects.GenericUserObject.prototype.stopFlashing = function ()
{
    if (this.drawer)
        this.drawer.stopFlashing ();
};

Cary.userObjects.GenericUserObject.prototype.serialize = function ()
{
    return { type: this.type, id: this.id, name: this.name, properties: this.properties, userProps: this.userProps, userType: this.userType, userInfo: this.userInfo,
             userInfoID: this.userInfoID, attachments: this.attachments };
};

Cary.userObjects.GenericUserObject.prototype.getTypeName = function ()
{
    return (this.type === Cary.userObjects.objectTypes.GENERIC_TYPE) ? 'Generic' : '';
};

Cary.userObjects.GenericUserObject.prototype.getUserTypeName = function ()
{
    return null;
};

Cary.userObjects.GenericUserObject.prototype.getPropertyStringValue = function (propName, propValue)
{
    return propValue;
};

Cary.userObjects.GenericUserObject.prototype.getInfo = function ()
{
    var info = { type: this.getTypeName (), name: this.name, userProps: {} };
    
    for (var propName in this.properties)
        info [propName] = this.getPropertyStringValue (propName, this.properties [propName]);
    
    for (var key in this.userProps)
        info.userProps [key] = this.userProps [key];
    
    return info;
};

Cary.userObjects.GenericUserObject.prototype.deserialize = function (source)
{
    var instance = this;
    
    this.type        = source.type;
    this.name        = Cary.tools.unicode2char (source.name);
    this.id          = source.id;
    this.properties  = {};
    this.userProps   = {};
    this.attachments = [];
    
    Cary.tools.copyObjectProp (this, source, 'userInfo');
    Cary.tools.copyObjectProp (this, source, 'userInfoID');
    
    if ('userProps' in source)
    {
        for (var key in source.userProps)
            this.userProps [key] = Cary.tools.checkDecode (source.userProps [key]);
    }
    
    if ('properties' in source)
    {
        for (var key in source.properties)
            this.properties [key] = Cary.tools.checkDecode (source.properties [key]);
    }
    
    if ('attachments' in source)
    {
        source.attachments.forEach (function (attachment)
                                    {
                                        instance.attachments.push ({ name: attachment.name, data: attachment.data });
                                    });
    }
};

Cary.userObjects.GenericUserObject.prototype.toJSON = function ()
{
    return JSON.stringify (this.serialize ());
};

Cary.userObjects.GenericUserObject.prototype.fromJSON = function (source)
{
    this.deserialize (JSON.parse (source));
};

Cary.userObjects.GenericUserObject.prototype.save = function (fileName)
{
    if (Cary.tools.isNothing (fileName))
        fileName = this.name + '.uo';
    
    Cary.tools.saveFile (this.toJSON (), fileName);
};

Cary.userObjects.GenericUserObject.prototype.load = function (file)
{
    this.fromJSON (Cary.tools.loadFile (file));
};

Cary.userObjects.GenericUserObject.prototype.addProperty = function (name, value)
{
    this.properties [name] = value;
};

Cary.userObjects.GenericUserObject.prototype.createDrawer = function ()
{
    return new Cary.drawers.GenericDrawer (this);
};

Cary.userObjects.GenericUserObject.prototype.drawn = function ()
{
    return this.drawObjects.length > 0;
}

Cary.userObjects.attachmentActions = { ADDED: 1, DELETED: 2, UPLOADED: 3 };

Cary.userObjects.GenericUserObject.prototype.buildAttachmentUpdateList = function (oldAttachmentList)
{
    var updates = [];
    var i;
    var j;
    var found;
    
    // First check for removed attachments
    for (i = 0; i < oldAttachmentList.length; ++ i)
    {
        for (j = 0, found = false; j < this.attachments.length; ++ j)
        {
            if (oldAttachmentList [i].name === this.attachments [j].name)
            {
                // We found the attachment with same name in new lisr; so it was not deleted
                found = true;
                
                // Make sure that attached data is the same, if not mark as uploaded
                if (oldAttachmentList [i].data !== this.attachments [j].data)
                    updates.push ({ name: oldAttachmentList [i].name, action: Cary.userObjects.attachmentActions.UPLOADED });
                
                break;
            }
        }
        
        if (!found)
            // It seems this attachment has been removed
            updates.push ({ name: oldAttachmentList [i].name, action: Cary.userObjects.attachmentActions.DELETED });
    }
    
    // Now check for newly added attachments (does not matter was something uploaded or not)
    for (i = 0; i < this.attachments.length; ++ i)
    {
        for (j = 0, found = false; j < oldAttachmentList.length; ++ j)
        {
            if (oldAttachmentList [j].name === this.attachments [i].name)
            {
                // We found the attachment with same name in both lists; so it was not added
                found = true; break;
            }
        }
        
        if (!found)
            // We found a new attachment (just added)
            updates.push ({ name: this.attachments [i].name, action: Cary.userObjects.attachmentActions.ADDED });
    }
    
    return updates;
};

Cary.userObjects.createFromArray = function (data, createUserObject)
{
    var object;
    
    if ('userType' in data && !Cary.tools.isNothing (createUserObject))
        object = createUserObject (data.userType);
    else
        object = null;
    
    if (object === null)
    {
        switch (data.type)
        {
            case Cary.userObjects.objectTypes.GENERIC_TYPE:
                object = new Cary.userObjects.GenericUserObject (); break;

            case Cary.userObjects.objectTypes.POLYLINE:
                object = new Cary.userObjects.UserPolyline (); break;

            case Cary.userObjects.objectTypes.POLYGON:
                object = new Cary.userObjects.UserPolygon (); break;

            case Cary.userObjects.objectTypes.ICON:
                object = new Cary.userObjects.UserIcon (); break;

            case Cary.userObjects.objectTypes.ICON_GROUP:
                object = new Cary.userObjects.UserIconGroup (); break;

            case Cary.userObjects.objectTypes.CIRCLE:
                object = new Cary.userObjects.UserCircle (); break;

            default:
                object = null;
        }
    }
    
    if (object !== null)
        object.deserialize (data);
    
    return object;
};

Cary.userObjects.createFromJSON = function (text, createUserObject)
{
    return Cary.userObjects.createFromArray (JSON.parse (text), createUserObject);
};

Cary.userObjects.ObjectCollection = function (name)
{
    this.objects    = [];
    this.name       = Cary.tools.isNothing (name) ? 'Objects' : name;
    this.drawn      = false;
    this.userInfo   = null; // Read-only
    this.userInfoID = null;
};

Cary.userObjects.ObjectCollection.prototype.serialize = function ()
{
    var result = { name: this.name, objects: [], userInfoID: this.userInfoID };
    
    if (!Cary.tools.isNothing (this.id))
        result.id = this.id;
    
    this.objects.forEach (function (object) { result.objects.push (object.serialize ()); });
    
    return result;
};

Cary.userObjects.ObjectCollection.prototype.deserialize = function (source, createUserObject)
{
    var instance = this;
    
    this.name    = source.name;
    this.id      = source.id;
    this.objects = [];
    
    Cary.tools.copyObjectProp (this, source, 'userInfo');
    Cary.tools.copyObjectProp (this, source, 'userInfoID');
    
    source.objects.forEach (function (objectDesc)
                            {
                                instance.objects.push (Cary.userObjects.createFromArray (objectDesc, createUserObject));
                            });
};

Cary.userObjects.ObjectCollection.prototype.findByProp = function (propName, propValue)
{
    var i;
    var result;
    
    for (i = 0, result = null; i < this.objects.length; ++ i)
    {
        if (this.objects [i].userProps [propName] === propValue)
        {
            result = this.objects [i]; break;
        }
    }
    
    return result;
};

Cary.userObjects.ObjectCollection.prototype.enumerate = function (callback)
{
    this.objects.forEach (callback);
};

Cary.userObjects.ObjectCollection.prototype.addFromJSON = function (text, createUserObject)
{
    var object = Cary.userObjects.createFromJSON (text, createUserObject);
    
    this.objects.push (object);
};

Cary.userObjects.ObjectCollection.prototype.findIndex = function (instance)
{
    var i;
    var result;
    
    for (i = 0, result = -1; i < this.objects.length; ++ i)
    {
        if (this.objects [i] === instance)
        {
            result = i; break;
        }
    }
    
    return result;
};

