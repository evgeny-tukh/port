function WaterLevelPane (parent, callbacks, options)
{
    CloseablePane.apply (this, [stringTable.waterLevels, parent, callbacks, options]);

    hideWaterLevelAreas ();
}

WaterLevelPane.prototype = Object.create (CloseablePane.prototype);

WaterLevelPane.prototype.onInitialize = function ()
{
    var dateHrStyle = { padding: 5, 'padding-bottom': 2, margin: 0, 'margin-right': 10, 'line-height': 22, 'text-align': 'left', width: 280 };
    var dateStyle   = { float: 'right', height: 18, width: 100, 'margin-right': 10 };
    var hourStyle   = { float: 'right', height: 18, width: 40, 'margin-right': 0 };
    var fromBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.begin }, dateHrStyle);
    var toBlock     = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.end }, dateHrStyle);
    var areaBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.area }, dateHrStyle);
    var queryBlock  = new Cary.ui.ControlBlock ({ parent: this.client, visible: true }, { padding: 10 });
    var columns     = [{ title: stringTable.time, width: 155, onItemClick: onSelectTime },
                       { title: stringTable.levelShort, width: 55, onItemClick: onSelectTime },
                       { title: stringTable.battery, width: 40, onItemClick: onSelectTime }];
    var levelList   = new Cary.ui.ListView ({ parent: this.client, columns: columns, visible: true }, { position: 'absolute', top: 140, left: 5, width: 290, height: (this.parent.clientHeight - 185) });
    var fromHourCtl = new Cary.ui.EditBox ({ parent: fromBlock.htmlObject, visible: true, min: 0, max: 24, numeric: true, onChange: queryData }, hourStyle);
    var fromDateCtl = new Cary.ui.EditBox ({ parent: fromBlock.htmlObject, visible: true, onClick: selectFromDate }, dateStyle);
    var toHourCtl   = new Cary.ui.EditBox ({ parent: toBlock.htmlObject, visible: true, min: 0, max: 24, numeric: true, onChange: queryData }, hourStyle);
    var toDateCtl   = new Cary.ui.EditBox ({ parent: toBlock.htmlObject, visible: true, onClick: selectToDate }, dateStyle);
    var areaCtl     = new Cary.ui.ListBox ({ parent: areaBlock.htmlObject, visible: true, comboBox: true, onItemSelect: onChangeArea }, { float: 'right', height: 25, width: 220 });
    var now         = Cary.tools.getTimestamp ();
    var from        = now - 24 * 3600000 * 2 - 60000;
    var to          = now;
    var dataSet     = null;
    var objectList  = [];
    
    new Cary.ui.Button ({ text: stringTable.graph, parent: queryBlock.htmlObject, visible: true, onClick: showGraph },
                        { width: 80, height: 25, float: 'right', 'margin-right': 30 });
    new Cary.ui.Button ({ text: stringTable.query, parent: queryBlock.htmlObject, visible: true, onClick: queryData },
                        { width: 80, height: 25, float: 'right', 'margin-right': 15 });
    new Cary.ui.Button ({ text: stringTable.export, parent: queryBlock.htmlObject, visible: true, onClick: exportData },
                        { width: 80, height: 25, float: 'right', 'margin-right': 15 });

    fromDateCtl.setValue (Cary.tools.formatDate (from));
    fromHourCtl.setValue (new Date (from).getHours());
    toDateCtl.setValue (Cary.tools.formatDate (to));
    toHourCtl.setValue (new Date (to).getHours());

    this.hideObjects = hideObjects;
    
    Cary.tools.sendRequest ({ url: 'requests/wla_get_list.php', method: 'get', content: Cary.tools.contentTypes.plainText, onLoad: onLoadWaterLevelAreaList, 
                              resType: Cary.tools.resTypes.json });
    //if (waterLevelAreas)
    //    waterLevelAreas.enumerate (function (area) { areaCtl.addItem (area.name, area); });
    
    //localizeObject ();
    //queryData ();
    
    function onChangeArea ()
    {
        var area = areaCtl.getSelectedData ();
        
        hideObjects ();
        
        if (area)
        {
            populateObjectList (area.device);
            
            if (!passageMode.active)
                localizeObjects ();
            
            queryData ();
        }
    }
    
    function onLoadWaterLevelAreaList (areaList)
    {
        areaList.forEach (function (area) { areaCtl.addItem (area.name, area); });
        
        if (areaList.length > 0)
        {
            populateObjectList (areaList [0].device);
            
            if (!passageMode.active)
                localizeObjects ();
            
            queryData ();
        }
    }
    
    function populateObjectList (deviceID)
    {
        objectList = [];
        
        if (waterLevelAreas)
            waterLevelAreas.enumerate (function (area)
                                       {
                                           if (area.userProps.deviceID === deviceID)
                                               objectList.push (area);
                                       });
    }
    
    function showGraph ()
    {
        var area   = areaCtl.getSelectedData ();
        var offset = (area.baseLevel && area.baseValue) ? area.baseLevel + area.baseValue : 0;
        
        if (area)
        {
            var labels = [], 
                values = [];
        
            dataSet.forEach (function (item)
                             {
                                labels.push (item.time.substr (0, 19));
                                values.push (offset ? (offset - item.level) : item.level);
                             });
            
            labels.reverse ();
            values.reverse ();
            
            new GraphWnd (null, labels, values,
                          { xLabel: stringTable.time, yLabel: stringTable.level,
                            title: stringTable.wlChangeFor + ' ' + fromDateCtl.getValue () + ' ' + fromHourCtl.getValue () + ' - ' +  toDateCtl.getValue () + ' ' + toHourCtl.getValue () });
        }
    }
    
    function hideObjects ()
    {
        objectList.forEach (function (object)
                            {
                                if (object.drawer)
                                    object.drawer.undraw ();
                            });
    }
    
    function localizeObjects ()
    {
        var points = [];
        
        objectList.forEach (function (object)
                            {
                                if ('position' in object)
                                {
                                    // Single-point objects are to be drawn at any case
                                    points.push (object.position);
                                    
                                    if (!('drawer' in object))
                                        object.drawer = object.createDrawer ();
                                    
                                    object.drawer.undraw ();
                                    object.drawer.draw (map);
                                }
                                else
                                {
                                    object.points.forEach (function (point) { points.push (point); });
                                }
                            });
        
        if (points.length > 0)
            map.localizePolyline (points);
    }
    
    function exportData ()
    {
        var lines = [];
        var data;
        var blob;
        var url;
        
        lines.push ([stringTable.time, stringTable.level]);
        
        levelList.enumItems (function (item)
                             {
                                 lines.push ([item.itemColumns [0].innerText, item.itemColumns [1].innerText]);
                                 //addLine ([item.itemColumns [0].innerText, item.itemColumns [1].innerText]);
                             });
        
        //Cary.tools.saveFile (lines.join ('\r\n'), areaCtl.getSelectedText () + '.csv', /*'CP-1251'*/'utf-8', false);
        //data = { fileName: areaCtl.getSelectedText () + '.csv', separator: ';', lines: lines, encoding: 'cp-1251' };
        //blob = new Blob ([JSON.stringify (data)], {type: 'application/json'});
        //url  = URL.createObjectURL (blob);
        //
        //Cary.tools.openLink (url, true);
        
        uploadSerializableToServer ('tools/to_excel.php', { title: areaCtl.getSelectedText (), fileName: areaCtl.getSelectedText () + '.xls', separator: ';', lines: lines, encoding: 'cp-1251' },
                                    function (response)
                                    {
                                        Cary.tools.openLink (response);
                                    },
                                    Cary.tools.resTypes.plain);
        //Cary.tools.sendRequest ({ url: 'requests/tools/to_csv.php', method: Cary.tools.methods.post, resType: Cary.tools.resTypes.plain, content: Cary.tools.contentTypes.json,
        //                          param: { fileName: areaCtl.getSelectedText () + '.csv', separator: ';', lines: lines, encoding: 'cp-1251' } });
        
        function addLine (line)
        {
            lines.push (line.join (';'));
        }
    }
    
    function queryData ()
    {
        var area  = areaCtl.getSelectedData ();
        var begin = fromDateCtl.getValue ();
        var end   = toDateCtl.getValue ();
        var url;
        var offset = (area.baseLevel && area.baseValue) ? area.baseLevel + area.baseValue : 0;
        
        begin = new Date (from /*begin + ' 00:00:00'*/);
        end   = new Date (to /*end + ' 23:59:59'*/);
        
        levelList.removeAllItems ();
        levelList.addItem ([stringTable.loading, '']);
        
        url = 'wl/get_wl.php?b=' + toPhpTime (begin.getTime ()) + '&e=' + toPhpTime (end.getTime ()) + '&id=' + area.device;
        
        loadSerializable (url, onLoaded);
        
        function toPhpTime (timestamp)
        {
            return Math.ceil (timestamp / 1000);
        }
        
        function onLoaded (data)
        {
            if (data.length > 0)
                dataSet = data;
            else
                dataSet = null;
            
            levelList.removeAllItems ();
        
            data.forEach (function (item)
                                   {
                                       var date = new Date (item.time);
                                       
                                       if (isNaN (date.getTime ()))
                                       {
                                           var parts     = item.time.split (' ');
                                           var dateParts = parts [0].split ('-');
                                           var timeParts = parts [1].split (':');
                                           
                                           date = new Date (parseInt (dateParts [0]), parseInt (dateParts [1]), parseInt (dateParts [2]),
                                                            parseInt (timeParts [0]), parseInt (timeParts [1]), parseInt (timeParts [2]));
                                       }

                                       item.timestamp = date.getTime ();
                                       
                                       levelList.addItem ([Cary.tools.formatDateTime (item.timestamp), 
                                                           (offset ? (offset - item.level) : item.level).toFixed (2),
                                                           item.battery.toFixed (1)],
                                                          item);
                                   });
                                   
            if (levelList.getItemCount () > 0)
            {
                levelList.selectItem (0);
                
                showSelection ();
            }
            else
            {
                levelList.addItem ([stringTable.noData, ''], null);
            }
        }
    }
    
    function showSelection (selection)
    {
        var area   = areaCtl.getSelectedData ();
        var offset = (area.baseLevel && area.baseValue) ? area.baseLevel + area.baseValue : 0;
        
        if (Cary.tools.isNothing (selection))
            selection = levelList.getSelectedItem ();
        
        if (selection >= 0)
        {
            var data = levelList.getItemData (selection);
            
            objectList.forEach (function (area)
                                {
                                    if (!area.drawer)
                                        area.drawer = area.createDrawer ();

                                    area.level = offset ? (offset - data.level) : data.level;

                                    area.drawer.undraw ();
                                    area.drawer.draw (map.map);
                                });
                                
            if (passageMode.active && globalInterface.assignSelectedData)
                globalInterface.assignSelectedData (area, data, offset);
        }
    }
    
    function selectDate (htmlObject, x, y, onSelect)
    {
        var calendarDesc = { position: { x: x, y: y },
                             maxDate: now,
                             onSelect: function (date)
                                       {
                                           htmlObject.value = Cary.tools.formatDate (date);

                                           CalendarControl.instance.close ();
                                           
                                           onSelect (date);
                                       } };
            
        new CalendarControl (calendarDesc, new Date (from));
    }
    
    function selectFromDate ()
    {
        selectDate (this, 100, 100,
                    function (date)
                    {
                        from = date.getTime ();
                        
                        queryData ();
                    });
    }
    
    function selectToDate ()
    {
        selectDate (this, 100, 100,
                    function (date)
                    {
                        to = date.getTime ();
                        
                        queryData ();
                    });
    }
    
    function onSelectTime (row)
    {
        showSelection (row);
    }
    
};

WaterLevelPane.prototype.queryClose = function ()
{
    this.hideObjects ();
    
    return CloseablePane.prototype.queryClose.apply (this, arguments);
};
