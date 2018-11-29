function LinePlotterPane (parent, callbacks, options)
{
    var title;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    title = ('title' in options) ? options.title : stringTable.linePlotting;
    
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.calcRange = 'calcRange' in options && options.calcRange;
    
    if (Cary.tools.isNothing (title))
        title = 'Line plot';
    
    Cary.ui.Window.apply (this, [{ position: { top: -2, left: -2, width: Cary.tools.int2pix (parent.clientWidth - 30), height: Cary.tools.int2pix (parent.clientHeight - 15), absolute: true }, 
                                 title: title, parent: parent }]);
}

LinePlotterPane.CANCEL_BUTTON = 1;
LinePlotterPane.SAVE_BUTTON   = 2;
LinePlotterPane.DELETE_BUTTON = 3;
LinePlotterPane.ADD_BUTTON    = 4;

LinePlotterPane.prototype = Object.create (Cary.ui.Window.prototype);

LinePlotterPane.prototype.onInitialize = function ()
{
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var buttonStyle = { width: 60, height: 30, float: 'right' };
    var instance    = this;
    var columns     = [{title: '№', width: 22 }, { title: stringTable.lat, width: 90, onItemDblClick: editCoord }, { title: stringTable.lon, width: 98, onItemDblClick: editCoord }];
    var listOptions = { parent: this.client, columns: columns, visible: true };

    if (this.callbacks.onIndexClick)
        columns [0].onItemClick = this.callbacks.onIndexClick;
    
    if (this.callbacks.onItemHover)
        listOptions.onItemHover = this.callbacks.onItemHover;
    
    if (this.calcRange)
        columns.push ({ title: stringTable.range, width: 53 });
    
    this.cancelButton = new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    this.saveButton   = new Cary.ui.Button ({ text: stringTable.save, parent: buttonBlock.htmlObject, visible: true, onClick: doSave }, buttonStyle);
    this.deleteButton = new Cary.ui.Button ({ text: stringTable.delete, parent: buttonBlock.htmlObject, visible: true, onClick: deletePoint }, buttonStyle);
    this.addButton    = new Cary.ui.Button ({ text: stringTable.add, parent: buttonBlock.htmlObject, visible: true, onClick: addPoint }, buttonStyle);

    this.pointList = new Cary.ui.ListView (listOptions, { right: 2, top: 0, left: 0, height: parseInt (this.wnd.style.height) - 70 });
    
    function editCoord (index, column, item)
    {
        var data = {};
        
        if (column === 1)
        {
            data.mode  = Cary.ui.CoordEditWnd.modes.LAT;
            data.value = item.data.lat;
        }
        else
        {
            data.mode  = Cary.ui.CoordEditWnd.modes.LON;
            data.value = item.data.lon;
        }
        
        new Cary.ui.CoordEditWnd (null, data, { onOk: updateValue });
        
        function updateValue (value)
        {
            var strValue;
            var point = instance.pointList.getItemData (index);
            
            if (column === 1)
            {
                strValue = Cary.tools.formatLat (value);
                
                point.lat = value;
            }
            else
            {
                strValue = Cary.tools.formatLon (value);
                
                point.lon = value;
            }
            
            instance.pointList.setItemText (index, column, strValue);
            instance.pointList.setItemData (index, point);
            
            if ('onPointChanged' in instance.callbacks)
                instance.callbacks.onPointChanged (index, point);
        }
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }

    function doSave ()
    {
        if ('onSave' in instance.callbacks)
            instance.callbacks.onSave ();
    }
    
    function deletePoint ()
    {
        var selection = instance.pointList.getSelectedItem ();
        
        if (selection >= 0)
        {
            var i, count;
            
            instance.pointList.removeItem (selection);
            
            if ('calcRange' in this.options && this.options.calcRange)
                this.recalcShowLegRange (selection);
            
            for (i = 0, count = instance.pointList.getItemCount(); i < count; ++ i)
                instance.pointList.setItemText (i, 0, (i + 1).toString ());
            
            if ('onDeletePoint' in instance.callbacks)
                instance.callbacks.onDeletePoint (selection);
        }
    }
    
    function addPoint (item)
    {
        var lastData = instance.pointList.getItemData (instance.pointList.getItemCount () - 1);
        var data     = { lat: lastData.lat, lon: lastData.lon };
        
        new Cary.ui.PositionEditWnd (null, data, { onOk: addItem });
        
        function addItem (position)
        {
            instance.pointList.addItem ([(instance.pointList.getItemCount () + 1).toString (), Cary.tools.formatLat (position.lat), Cary.tools.formatLon (position.lon), ''], position);
                
            if ('calcRange' in this.options && this.options.calcRange)
                this.recalcShowLegRange (this.pointList.getItemCount () - 2);
            
            if ('onNewPoint' in instance.callbacks)
                instance.callbacks.onNewPoint (position);
        }
    }
    
    this.forceSave = doSave;
};

LinePlotterPane.prototype.showButton = function (buttonID, visible)
{
    var button;
    
    switch (buttonID)
    {
        case LinePlotterPane.ADD_BUTTON:
            button = this.addButton; break;
            
        case LinePlotterPane.CANCEL_BUTTON:
            button = this.cancelButton; break;
            
        case LinePlotterPane.SAVE_BUTTON:
            button = this.saveButton; break;
            
        case LinePlotterPane.DELETE_BUTTON:
            button = this.deleteButton; break;
            
        default:
            button = null;
    }
    
    if (button !== null)
        button.show (visible);
};

LinePlotterPane.prototype.queryClose = function ()
{
    return confirm ('Do you want to stop the plotting?');
};

LinePlotterPane.prototype.recalcShowLegRange = function (legIndex)
{
    var rangeStr;
    
    if (legIndex < 0)
    {
        rangeStr = 'N/A';
    }
    else if (legIndex < this.pointList.getItemCount ())
    {
        var origin = this.pointList.getItemData (legIndex);
        var dest   = this.pointList.getItemData (legIndex + 1);
        var result = Cary.geo.calcRLRangeAndBearing (origin.lat, origin.lon, dest.lat, dest.lon, 1);
        
        rangeStr = (result.range * 1.852).toFixed (3);
    }
    
    this.pointList.setItemText (legIndex + 1, 3, rangeStr);
};

LinePlotterPane.prototype.addPoint = function (lat, lon)
{
    this.pointList.addItem ([(this.pointList.getItemCount () + 1).toString (), Cary.tools.formatLat (lat), Cary.tools.formatLon (lon), ''], { lat: lat, lon: lon });
    
    if ('calcRange' in this.options && this.options.calcRange)
    {
        var legIndex = this.pointList.getItemCount () - 2;
        
        this.recalcShowLegRange (legIndex);
    }
};

LinePlotterPane.prototype.selectPoint = function (index)
{
    this.pointList.selectItem (index);
};

LinePlotterPane.prototype.changePoint = function (index, point)
{
    this.pointList.setItemText (index, 1, Cary.tools.formatLat (point.lat));
    this.pointList.setItemText (index, 2, Cary.tools.formatLon (point.lon));
    this.pointList.setItemData (index, point);
    
    if ('calcRange' in this.options && this.options.calcRange)
        this.recalcShowLegRange (index - 1);
};

