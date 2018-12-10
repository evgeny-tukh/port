function RoutePane (parent, callbacks, options)
{
    this.selectedRoute = null;
    
    CloseablePane.apply (this, [stringTable.routes, parent, callbacks, options]);
}

RoutePane.prototype = Object.create (CloseablePane.prototype);

RoutePane.prototype.queryClose = function ()
{
    this.activateContours (true);
    this.resetAnalyse ();
    
    return true;
};

RoutePane.prototype.onInitialize = function ()
{
    var dateHrStyle      = { padding: 5, 'padding-bottom': 2, margin: 0, 'margin-right': 10, 'line-height': 22, 'text-align': 'left', width: 280 };
    var dateStyle        = { float: 'right', height: 18, width: 100, 'margin-right': 10 };
    var hourStyle        = { float: 'right', height: 18, width: 40, 'margin-right': 0 };
    var startBlock       = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.begin }, dateHrStyle);
    var speedBlock       = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.speed }, dateHrStyle);
    var draftBlock       = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.draft }, dateHrStyle);
    var buttonBlock      = new Cary.ui.ControlBlock ({ parent: this.client, visible: true }, { padding: 10 });
    var routeList        = new Cary.ui.ListBox ({ parent: this.client, comboBox: false, visible: true, onItemClick: onSelectRoute },
                                                { position: 'absolute', top: 140, left: 5, width: 290, height: (this.parent.clientHeight - 185) });
    var simulColumns     = [{ title: stringTable.name, width: 200 }, { title: stringTable.maxAcceptableDraft, width: 60 }];
    var analyzeColumns   = [{ title: stringTable.name, width: 120, onItemClick: showGroundingAlert }, { title: stringTable.dateTime, width: 90, onItemClick: showGroundingAlert },
                            { title: stringTable.maxAcceptableDraft, width: 45, onItemClick: showGroundingAlert }];
    var objectList       = new Cary.ui.ListView ({ parent: this.client, comboBox: false, columns: simulColumns, visible: false },
                                                 { position: 'absolute', top: 140, left: 5, width: 290, height: (this.parent.clientHeight - 185) });
    var objectListAnal   = new Cary.ui.ListView ({ parent: this.client, comboBox: false, columns: analyzeColumns, visible: false },
                                                 { position: 'absolute', top: 140, left: 5, width: 290, height: (this.parent.clientHeight - 185) });
    var warningIcon      = new Cary.ui.FlashingImage ({ parent: this.client, source: 'res/att_small.png', visible: true },
                                                      { display: 'none', position: 'absolute', left: 100, top: 0 });
    var startHourCtl     = new Cary.ui.EditBox ({ parent: startBlock.htmlObject, visible: true, min: 0, max: 24, numeric: true }, hourStyle);
    var startDateCtl     = new Cary.ui.EditBox ({ parent: startBlock.htmlObject, visible: true, onClick: selectStartDate }, dateStyle);
    var speedCtl         = new Cary.ui.EditBox ({ parent: speedBlock.htmlObject, visible: true, numeric: true, float: true, min: 0.5, max: 30, step: 0.5, value: 9,
                                                  onChange: function ()
                                                            {
                                                                simulation.simulator.setSpeed (parseFloat (this.value));
                                                            } },
                                                { float: 'right', height: 18, width: 50 });
    var draftCtl         = new Cary.ui.EditBox ({ parent: draftBlock.htmlObject, visible: true, numeric: true, float: true, min: 0.5, max: 30, step: 0.5, value: 5,
                                                  onChange: function ()
                                                            {
                                                                simulation.simulator.setDraft (parseFloat (this.value));
                                                            } },
                                                { float: 'right', height: 18, width: 50 });
    var now               = Cary.tools.getTimestamp ();
    var start             = now;
    var instance          = this;
    var oldOnClose        = this.callbacks.onClose;
    var buttonStyle       = { width: 'fit-content', height: 30, float: 'right', 'margin-right': 15, 'padding-left': 10, 'padding-right': 10 };
    var wlMeters          = {};
    //var intersectingParts = [];
    var startMenu         = [{ text: stringTable.quickAnalyze, action: onAnalyze }, { text: stringTable.simulation, action: onSimulate }];
    var flashTimer        = setInterval (flashProc, 500);
    var affectedObjects   = [];
    var allObjects        = [];
    var flashState        = true;
    var flashingAlert     = null;
    var routeLegs;
    var waterLevelData;
    var sog;

    warningIcon.setStyle ('display', 'none');
    //warningIcon.flash ();
    /*warningIcon.src            = 'res/att_small.png';
    warningIcon.zOrder         = 1000;
    warningIcon.style.position = 'absolute';
    warningIcon.style.left     = '100px';
    warningIcon.style.top      = '0px';
    
    this.client.appendChild (warningIcon);*/
    
    this.callbacks.onClose = oldOnClose ? function () { onClosePanel (); oldOnClose (); } : onClosePanel ();

    new Cary.ui.Button ({ text: stringTable.new, parent: buttonBlock.htmlObject, visible: true, onClick: onAddRoute }, Cary.tools.updateProperty (buttonStyle, 'margin-right', 20));
    new Cary.ui.Button ({ text: stringTable.delete, parent: buttonBlock.htmlObject, visible: true, onClick: onDeleteRoute }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.edit, parent: buttonBlock.htmlObject, visible: true, onClick: onEditRoute }, buttonStyle);
    new Cary.ui.PopUpButton ({ text: stringTable.start, parent: buttonBlock.htmlObject, visible: true, popupMenu: startMenu, menuWidth: 100, 
                               anchorType: (Cary.ui.anchor.TOP | Cary.ui.anchor.LEFT) },
                               { width: 65, height: 30, float: 'right', padding: 5, 'padding-top': 0, 'padding-bottom': 0 });
                        
    startDateCtl.setValue (Cary.tools.formatDate (start));
    startHourCtl.setValue (new Date (start).getHours());

    this.undrawSelectedRoute = undrawSelectedRoute;
    this.hideObjects         = hideObjects;
    this.resetAnalyse        = resetAnalyse;
    this.updateVisualObjects = updateVisualObjects;
    this.activateContours    = activateContours;
    this.hideObjectList      = hideObjectList;
    this.stopAlert           = function () { warningIcon.flash (false); };

    simulation.simulator.setStateCallback (function (data)
                                           {
                                               var i;
                                               
                                               allObjects      = data.allObjects;
                                               affectedObjects = data.affectedObjects;
                                               
                                               allObjects.forEach (function (object)
                                                                   {
                                                                        var meter  = wlMeters [object.userProps.deviceID];
                                                                        var level  = getObjectDepthAt (object, simulation.simulator.getStartTime () + data.time);
                                                                        var offset = meter.baseLevel + meter.baseValue - level;
                                                                        var i;

                                                                        object.offset = offset * 0.01;

                                                                        object.vesselDraught = simulation.draft;

                                                                        if (affectedObjects.indexOf (object) >= 0)
                                                                        {
                                                                            if (!object.tag)
                                                                                object.createTag ();

                                                                            object.tag.setText (object.getHintText ());
                                                                            object.tag.setMap (map.map);
                                                                        }
                                                                   });
                                                                        
                                               for (i = 0; i < objectList.getItemCount(); ++ i)
                                               {
                                                   var object   = objectList.getItemData (i);
                                                   var affected = affectedObjects.indexOf (object) >= 0;
                                                   var curDepth = parseInt (object.userProps.limitationType) === userObj.NavContour.limitationType.LIMITED_DRAFT ?  object.getCurrentMaxDraft () :  object.getCurrentDepth ();
                                                   
                                                   objectList.setItemText (i, 1, curDepth.toFixed (2));
                                                   
                                                   if (affected)
                                                   {
                                                       objectList.selectItem (i);
                                                       
                                                       if (curDepth < simulation.simulator.getDraft ())
                                                       {
                                                           globalInterface.pauseResumeSimulation ();
                                                           globalInterface.setStateText (stringTable.groundingAlert);

                                                           indicateAlert ();
                                                           
                                                           showGrounding (object);
                                                       }
                                                   }
                                               }
                                           });
    
    routesLayer.enumerate (function (route)
                           {
                               routeList.addItem (route.name, route);
                           });
    
    Cary.tools.sendRequest ({ url: 'requests/wla_get_list.php', method: 'get', content: Cary.tools.contentTypes.plainText, onLoad: onLoadWaterLevelAreaList, 
                              resType: Cary.tools.resTypes.json });

    function showGrounding (groundingAlert)
    {
        var bounds = groundingAlert.getBounds ();
        
        map.map.fitBounds ({ east: bounds.maxLon, west: bounds.minLon, north: bounds.maxLat, south: bounds.minLat });
        
        if (flashingAlert)
            flashingAlert.stopFlashing ();
        
        flashingAlert = groundingAlert;
        
        groundingAlert.startFlashing (500);
        
        setTimeout (function ()
                    {
                        groundingAlert.stopFlashing ();
                        
                        flashingAlert = null;
                    }, 5000);
    }
    
    function showGroundingAlert (item)
    {
        showGrounding (objectListAnal.getItemData (item));
    }
    
    function indicateAlert ()
    {
        warningIcon.flash ();
        
        setTimeout (function () { warningIcon.flash (false); }, 5000);
    }
    
    function flashProc ()
    {
        var mapObj = flashState ? null : map.map;
        
        flashState = !flashState;
        
        if (allObjects.length === 0)
            allObjects = simulation.simulator.getCrossedObjects ();
        
        allObjects.forEach (function (object)
                            {
                                var flashing = affectedObjects.indexOf (object) >= 0;
                                
                                object.drawObjects.forEach (function (drawObject)
                                                            {
                                                                if (flashing)
                                                                    drawObject.setMap (mapObj);
                                                                else if (!drawObject.getMap ())
                                                                    drawObject.setMap (map.map);
                                                            });
                            });
    }
    
    function activateContours (activate)
    {
        shownObjectList.forEach (function (object)
                                 {
                                     object.drawObjects.forEach (function (drawObject)
                                                                 {
                                                                     drawObject.setOptions ({ clickable: activate });
                                                                 });
                                 });
    }
    
    function updateVisualObjects (timeOffset)
    {
        /*var selectedRoute     = routeList.getSelectedData ();
        var intersectingParts = simulation.simulator.getIntersects ();
        var vesselLocation    = selectedRoute.getPositionOfPassage (sog, timeOffset / 3600000);
        var routeLegs         = simulation.simulator.getLegs ();
        var activeLeg;
        var activeLegIndex;
        var i;
    
        for (i = 0, activeLegIndex = -1; i < routeLegs.length && activeLegIndex < 0; ++ i)
        {
            if (timeOffset >= routeLegs [i].beginTimeOffset && timeOffset <= routeLegs [i].endTimeOffset)
            {
                activeLegIndex = i;
                activeLeg      = routeLegs [i];
            }
        }
        
        if (activeLegIndex < 0)
            return;
        
        for (i = 0; i < intersectingParts.length; ++ i)
        {
            var intersection = intersectingParts [i];

            if (intersection.leg === activeLegIndex)
            {
                if (vesselLocation.legRange >= intersection.begRange && vesselLocation.legRange <= intersection.endRange && affectedObjects.indexOf (intersection.object) < 0)
                    affectedObjects.push (intersection.object);
            }
        }*/
    }
    
    function onLoadWaterLevelAreaList (data)
    {
        data.forEach (function (deviceInfo)
                      {
                          wlMeters [deviceInfo.device] = deviceInfo;
                      });
    }
    
    function hideObjectList ()
    {
        objectListAnal.show (false);
        objectList.show (false);
        routeList.show ();
    }
    
    function hideObjects ()
    {
        simulation.simulator.enumIntersects (function (part)
                                             {
                                                if (part.object.drawer)
                                                    part.object.drawer.undraw ();
                                             });
        /*intersectingParts.forEach (function (part)
                                   {
                                       if (part.object.drawer)
                                           part.object.drawer.undraw ();
                                   });*/
    }
    
    function analyze (route, start, draft)
    {
        routeLegs      = route.getLegs (sog);
        waterLevelData = {};
        
        if (!start)
            start = Cary.tools.getTimestamp ();
        
        if (!sog)
            sog = 10.0;
        
        for (var i = 0, beginTime = 0; i < routeLegs.length; ++ i)
        {
            var distance = Cary.geo.calcSphericalRange (routeLegs [i][0], routeLegs [i][1]);
            var passTime = distance / sog;
            
            routeLegs [i].beginTimeOffset = beginTime;
            routeLegs [i].passTime        = passTime * 3600000;
            routeLegs [i].endTimeOffset   = beginTime + routeLegs [i].passTime;
            beginTime                     = routeLegs [i].endTimeOffset;
        }

        hideObjects ();
        
        Cary.tools.sendRequest ({ url: 'requests/ol_get_obj_list.php?ut=' + userObj.types.NAV_CONTOUR.toString (), method: Cary.tools.methods.get,
                                  content: Cary.tools.contentTypes.plainText, onLoad: onObjectListLoaded, resType: Cary.tools.resTypes.json });
                              
        function onObjectListLoaded (data)
        {
            var url;
            
            data.forEach (processContour);
            
            intersectingParts.forEach (processIntersection);

            url = 'wl/get_wls.php?b=' + Cary.tools.toPhpTime (start) + '&e=' + Cary.tools.toPhpTime (start + routeLegs [routeLegs.length-1].endTimeOffset + 3600000) + '&ids=' + Cary.tools.keys (waterLevelData).join (';');

            loadSerializable (url, onDataLoaded);
            
            function onDataLoaded (data)
            {
                var objects = [];
                
                waterLevelData = data;
                
                intersectingParts.forEach (assignIntersectionData);
                
                objects.forEach (function (object)
                                 {
                                     if (!object.drawer)
                                         object.drawer = object.createDrawer ();
                                     
                                     object.drawer.draw (map.map);
                                 });
                
                function assignIntersectionData (intersection)
                {
                    var meter  = wlMeters [intersection.object.userProps.deviceID];
                    var level  = getObjectDepthAt (intersection.object, intersection.enterTime);
                    var offset = meter.baseLevel + meter.baseValue - level;
                    var i, found;
                    
                    if (intersection.object.offset === null || offset > intersection.object.offset)
                        intersection.object.offset = offset;
                    
                    intersection.object.vesselDraught = draft;
                    
                    for (i = 0, found = false; i < objects.length && !found; ++ i)
                    {
                        if (objects [i] === intersection.object)
                            found = true;
                    }
                    
                    if (!found)
                        objects.push (intersection.object);
                }
            }
        }
    }

    function getObjectDepthAt (object, time)
    {
        var waterLevelData = simulation.simulator.getWaterLevelData ();
        var data           = object.userProps.deviceID in waterLevelData ? waterLevelData [object.userProps.deviceID] : [];
        var result         = null;

        for (var i = 0; i < data.length; ++ i)
        {
            if (data [i].ts * 1000 <= time)
            {
                result = data [i].level; break;
            }
        }

        return result;
    }
        
    function processIntersection (intersection)
    {
        var i;
        var leg             = routeLegs [intersection.leg];
        //var legApproachTime = start + leg.beginTimeOffset;
        var beginRange      = Cary.geo.calcSphericalRange (leg [0], intersection.begin);
        var endRange        = Cary.geo.calcSphericalRange (leg [0], intersection.end);
        var crossEnterOffs  = (beginRange / sog) * 3600000;
        var crossExitOffs   = (endRange / sog) * 3600000;
        
        if (beginRange > endRange)
        {
            var temp = endRange;
            
            endRange   = beginRange;
            beginRange = temp;
            
            temp           = crossEnterOffs;
            crossEnterOffs = crossExitOffs;
            crossExitOffs  = temp;
        }

        intersection.begRange  = beginRange;
        intersection.endRange  = endRange;
        intersection.enterOffs = leg.beginTimeOffset + crossEnterOffs;
        intersection.exitOffs  = leg.beginTimeOffset + crossExitOffs;
        intersection.enterTime = start + intersection.enterOffs;
        intersection.exitTime  = start + intersection.exitOffs;

        waterLevelData [intersection.object.userProps.deviceID] = [];
    }
        
    function processContour (contour)
    {
        if (contour.type === Cary.userObjects.objectTypes.POLYGON)
        {
            var newObject = Cary.userObjects.createFromArray (contour, userObj.createVirginUserObject);

            newObject.offset = null;

            for (var i = 0; i < routeLegs.length; ++ i)
            {
                var parts = Cary.geo.intersectContourByLeg (newObject.points, routeLegs [i]);

                parts.forEach (function (part)
                               {
                                   intersectingParts.push ({ leg: i, begin: part.begin, end: part.end, object: newObject });
                               });
            }
        }
    }
    
    function resetAnalyse ()
    {
        undrawSelectedRoute ();
        hideObjects ();
    
        //intersectingParts = [];
        simulation.simulator.reset ();
    }
    
    function onClosePanel ()
    {
        activateContours (true);
        
        if (flashTimer)
            clearInterval (flashTimer);
        
        resetAnalyse ();
    }
    
    function onSelectRoute (index)
    {
        resetAnalyse ();
        
        instance.selectedRoute = routeList.getItemData (index);
        
        if (!instance.selectedRoute.drawer)
            instance.selectedRoute.drawer = instance.selectedRoute.createDrawer ();
        
        instance.selectedRoute.drawer.draw (map.map);
    }
    
    function undrawSelectedRoute ()
    {
        if (instance.selectedRoute && instance.selectedRoute.drawer)
            instance.selectedRoute.drawer.undraw ();
        
        instance.selectedRoute = null;
    }
    
    function onAddRoute ()
    {
        activateContours (false);    
        resetAnalyse ();
        
        globalInterface.waitForUserClick (start);
        
        function start (event)
        {
            globalInterface.addNewObject = addObjectToLayer;
            
            globalInterface.activateRegularContextMenu (event, plottingActions.NEW_ROUTE);
        }
    }
    
    function addObjectToLayer (object)
    {
        var i, found;
        
        object.drawer.undraw ();
        
        userObj.addObjectToLayer (object, routesLayer, null, false);

        for (i = 0, found = false; i < routeList.getCount (); ++ i)
        {
            if (routeList.getItemData (i) === object)
            {
                found = true;
                
                routeList.setItemText (i, object.name); break;
            }
        }
        
        if (!found)
            routeList.addItem (object.name, object, false);
        
        activateContours (true);
    }
    
    function onDeleteRoute ()
    {
        var selection = routeList.getCurSel ();
        
        if (selection >= 0 && window.confirm (stringTable.routeRemoveConf))
        {
            var route = routeList.getSelectedData ();

            Cary.tools.sendRequest ({ url: 'requests/uo_delete.php?o=' + route.id, mathod: Cary.tools.methods.post, content: Cary.tools.contentTypes.plainText, onLoad: onDeleted,
                          resType: Cary.tools.resTypes.plain });

            function onDeleted ()
            {
                resetAnalyse ();

                routeList.removeItem (selection);

                routesLayer.objects.splice (selection, 1);
            }
        }
    }
    
    function onEditRoute ()
    {
        var route = routeList.getSelectedData ();
        
        if (route)
        {
            activateContours (false);
            resetAnalyse ();
        
            globalInterface.addNewObject = addObjectToLayer;

            globalInterface.waitForMouseMove (start);

            function start (event)
            {
                globalInterface.activateRegularContextMenu (event, plottingActions.NEW_ROUTE, route);
            }
        }
    }
    
    function onSimulate ()
    {
        var selectedRoute = routeList.getSelectedData ();
        var draft         = draftCtl.getValue ();
        var startDateTime = Cary.tools.getGermanDate (startDateCtl.getValue ());

        sog = speedCtl.getValue ();
        
        startDateTime.setHours (parseInt (startHourCtl.getValue ()));
        
        if (selectedRoute)
            simulate (selectedRoute, startDateTime.getTime (), draft);
        else
            new Cary.ui.MessageBox ({ title: stringTable.error, text: stringTable.selectRouteMsg, width: 300 });
    }

    function simulate (route, start, draft)
    {
        var objects;
        
        hideObjects ();
        
        simulation.simulator.setup ({ route: route, sog: sog, draft: draft, startTime: start });
        simulation.simulator.checkContours ();
        simulation.simulator.analyzePassage ();
        simulation.simulator.setTime (0);
        
        /*analyze (route, start, draft);
            
        simulation.setup (route, start, sog, draft);*/
        routeList.show (false);
        objectList.show ();
        objectListAnal.show (false);
        simulation.pane.show ();
        
        globalInterface.setSimulationStartTime (start);
        
        objects = simulation.simulator.getCrossedObjects ();
        
        objects.forEach (function (object)
                         {
                             objectList.addItem ([object.name, ''], object);
                         });
    }
    
    function onAnalyze ()
    {
        var selectedRoute = routeList.getSelectedData ();
        var draft         = draftCtl.getValue ();
        var startDateTime = Cary.tools.getGermanDate (startDateCtl.getValue ());

        sog = speedCtl.getValue ();
        
        startDateTime.setHours (parseInt (startHourCtl.getValue ()));
        
        if (selectedRoute)
        {
            var simulator = simulation.simulator;
            var dateTime  = startDateTime.getTime ();
            var alerts    = [];
            
            hideObjects ();
            
            simulator.setup ({ route: selectedRoute, sog: sog, draft: draft, startTime: dateTime });
            simulator.checkContours ();
            simulator.analyzePassage (onCompleted);
            
            routeList.show (false);
            objectList.show (false);
            objectListAnal.show ();
            
            function onCompleted (objects)
            {
                //objects.forEach (function (object)
                //                 {
                //                     objectListAnal.addItem ([object.name, ''], object);
                //                 });
                                 
                simulator.enumIntersects (checkIntersection);

                objectListAnal.removeAllItems ();

                if (alerts.length > 0)
                {
                    alerts.forEach (function (alert)
                                    {
                                        objectListAnal.addItem ([alert.object.name, Cary.tools.formatDateTime (alert.time), alert.depth.toFixed (2)], alert.object);
                                        
                                        if (alert.object.createrTag)
                                            alert.object.createTag ();
                                    });
                                    
                    userObj.NavContour.hintMode = userObj.NavContour.hintModes.ON_CLICK;
                }
                else
                {
                    objectListAnal.addItem ([stringTable.noDanger, '', ''], null);
                }
                
                if (alerts.length > 0)
                    indicateAlert ();
            }
            
            function checkIntersection (intersection)
            {
                var enterTime = intersection.enterTime;
                var exitTime  = intersection.exitTime;
                var object    = intersection.object;
                var meter     = wlMeters [object.userProps.deviceID];
                var draft     = simulator.getDraft ();
                var criticalTime;
                var criticalDepth;
                var alert;
                var curTime;
                var draftMode = parseInt (object.userProps.limitationType) === userObj.NavContour.limitationType.LIMITED_DRAFT;

                object.vesselDraught = draft;
                
                for (curTime = enterTime, alert = false; !alert && curTime <= exitTime; curTime += 600000)
                {
                    var level  = getObjectDepthAt (object, curTime);
                    var offset = meter.baseLevel + meter.baseValue - level;
                    var curValue;

                    object.offset = offset * 0.01;
                    
                    curValue = draftMode ? object.getCurrentMaxDraft () : object.getCurrentDepth ();
                    
                    if (curValue <= draft)
                    {
                        alert         = true;
                        criticalTime  = curTime;
                        criticalDepth = curValue;
                    }
                }
                
                if (alert)
                    alerts.push ({ object: object, time: criticalTime, depth: criticalDepth });
            }
        }
        else
        {
            new Cary.ui.MessageBox ({ title: stringTable.error, text: stringTable.selectRouteMsg, width: 300 });
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
            
        new CalendarControl (calendarDesc, new Date (start));
    }
    
    function selectStartDate ()
    {
        selectDate (this, 100, 100, function (date) { start = date.getTime (); });
    }    
};