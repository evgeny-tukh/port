var modes           = { REGULAR: 1, PLOTTING: 2, WAIT_FOR_ICON: 3, WAIT_FOR_CLICK: 4 };
var plottingActions = { NEW_POLYLINE: 0, NEW_POLYGON: 1, NEW_ICON: 2, /*NEW_ICON_GROUP: 3,*/ NEW_BERTH: 4,
                        NEW_DEPTH_CONTOUR: 5, NEW_BRIDGE_CONTOUR: 6, NEW_WATERLEVEL_CONTOUR: 7, NEW_WATERLEVEL_MARKER: 7, NEW_NAV_CONTOUR: 8,
                        NEW_ROUTE: 15 };
var globalInterface = {};
var settings        = { enableAreaActivation: false };
var waterLevelPane  = null;
var routePane       = null;
var depthAreas      = null;
var waterLevelAreas = null;
var shownObjectList = [];
var passageMode    = { active: false };
var simulation     = { active: false, pane: null, time: null, acceleration: 50, timeQuant: 5, run: false, simulator: null };
var officialInfo;
var objectEditorPane;
var map;
var posInd;
var stringTable;

function init ()
{
    var settingsButton;
    var leftPaneButton;
    var waterLevelButton;
    var passageButton;
    var routesButton;
    var zoomInButton;
    var zoomOutButton;
    var settingsPane;
    var passagePane;
    var mapDiv = document.getElementById ("map");
    var mode   = modes.REGULAR;
    var officialInfoPane;
    var activeSubMenu = null;
    var aisTargetTable;
    var aisTargetLayerUpdater;
    
    new SessionWatchdog ();

    globalInterface.waitForUserIcon            = waitForUserIcon;
    globalInterface.waitForUserClick           = waitForUserClick;
    globalInterface.waitForMouseMove           = waitForMouseMove;
    globalInterface.addUserIcon                = addUserIcon;
    globalInterface.activateRegularContextMenu = activateRegularContextMenu;
    globalInterface.onSave                     = null;
    globalInterface.showLeftPane               = showLeftPane;
    globalInterface.hideLeftPane               = hideLeftPane;
    
    stringTable = new strings.StringTable ('russian.st', 2000);
    
    map = new Cary.Map ();

    initSettings ();
    initLayers (map);
    //initDepthAreas (map);
    initAbris (map);
    
    Cary.settings.activeItemClass   = 'activeItem';
    Cary.settings.selectedItemClass = 'selectedItem';
    
    Cary.tools.createCssClass (Cary.settings.activeItemClass, { color: 'black' });
    Cary.tools.createCssClass (Cary.settings.activeItemClass + ':hover', { color: 'blue' });
    Cary.tools.createCssClass (Cary.settings.selectedItemClass, { color: 'red', 'font-weight': 'bold' });
    
    map.attach (mapDiv);
    map.createMap ();
    map.setupPredefinedBaseMaps ();
    //map.enumPredefinedBaseMaps (addBaseMap);
    //map.setDefaultLeftMargin (-290);
    initDocuments ();

    if (initialPos.lat && initialPos.lon)
        map.setCenter (initialPos.lat, initialPos.lon);

    map.addEventListener ('mousemove', onMouseMove);
    map.addEventListener ('mouseover', function () { posInd.show (true); });
    map.addEventListener ('mouseout', function () { posInd.show (false); });
    
    mapDiv.addEventListener ('contextmenu',
                             function (event)
                             {
                                 switch (mode)
                                 {
                                     case modes.REGULAR:
                                         activateRegularContextMenu (event); break;
                                         
                                     case modes.PLOTTING:
                                         activatePlottingContextMenu (event); break;
                                 }
                             });
    
    settingsButton   = map.createImgButton (google.maps.ControlPosition.TOP_LEFT, 'res/settings26.png', { onClick: showSettingsPane });
    waterLevelButton = map.createImgButton (google.maps.ControlPosition.TOP_RIGHT, 'res/watermeter26.png', { onClick: showWaterLevelPane });
    passageButton    = map.createImgButton (google.maps.ControlPosition.TOP_RIGHT, 'res/tug26.png', { onClick: switchPassageMode });
    routesButton     = map.createImgButton (google.maps.ControlPosition.TOP_RIGHT, 'res/route26.png', { onClick: showRoutePane });
    leftPaneButton   = map.createImgButton (google.maps.ControlPosition.TOP_RIGHT, 'res/doc26.png', { onClick: showLeftPane });
    zoomInButton     = map.createImgButton (google.maps.ControlPosition.RIGHT_BOTTOM, 'res/zoom-in-20.png', { onClick: function () { map.zoomIn (); } });
    zoomOutButton    = map.createImgButton (google.maps.ControlPosition.RIGHT_BOTTOM, 'res/zoom-out-20.png', { onClick: function () { map.zoomOut (); } });
    settingsPane     = map.createGMPanel (google.maps.ControlPosition.TOP_LEFT, { onInit: onInitSettingsPane });
    passagePane      = map.createGMPanel (google.maps.ControlPosition.LEFT_BOTTOM, { onInit: onInitPassagePane, width: 330, height: 180 });
    simulation.pane  = map.createGMPanel (google.maps.ControlPosition.LEFT_BOTTOM, { onInit: onInitSimulationPane, width: 330, height: 200 });
    
    posInd = map.createPosIndicator (google.maps.ControlPosition.TOP_CENTER);
    
    posInd.setText ('hehehe');
    posInd.setValue (10, 20);
    
    settingsPane.setSlidingMode (Cary.controls.GMPanel.slidingMode.LEFT);
    settingsButton.show ();
    zoomInButton.show ();
    zoomOutButton.show ();
    waterLevelButton.show ();
    passageButton.show ();
    routesButton.show ();

    aisTargetTable        = new AISTargetTable (map);
    aisTargetLayerUpdater = new AISTargetLayerUpdater (map);
    
    aisTargetLayerUpdater.start (true);
    
    setTimeout (function ()
                {
                    officialInfoPane = new OfficialInfoPane (document.getElementById ('leftPane'));
                    objectEditorPane = new ObjectEditorPane (document.getElementById ('rightPane'));
                    
                    aisTargetTable.onTargetClick = function (target)
                                                   {
                                                       objectEditorPane.moreInfoPane.info.backup ();
                                                       objectEditorPane.moreInfoPane.showInfo (true, { items: AISTargetTable.getTargetInfo (target) });
                                                       
                                                       setTimeout (function () { objectEditorPane.moreInfoPane.info.restore (); }, 5000);
                                                   };
                }, 1000);
    
    function showLeftPane ()
    {
        document.getElementById ('leftPane').style.display = null;
        document.getElementById ('map').className          = 'panel map';
        
        leftPaneButton.show (false);
    }
    
    function hideLeftPane ()
    {
        document.getElementById ('leftPane').style.display = 'none';
        document.getElementById ('map').className          = 'panel mapNoLeftPanel';
        
        leftPaneButton.show ();
    }
    
    function activateRegularContextMenu (event, oeAction, objectToProcess)
    {
        var offX    = 'offsetX' in event ? event.offsetX : event.pixel.x;
        var offY    = 'offsetY' in event ? event.offsetY : event.pixel.y;
        var oeItems = [{ text: stringTable.newPolyline, onSave: globalInterface.addNewObject,
                         onClick: function (item, object) { plotPolyline (item, object, Cary.userObjects.objectTypes.POLYLINE); } }, 
                       { text: stringTable.newPolygon, onSave: globalInterface.addNewObject, 
                         onClick: function (item, object) { plotPolyline (item, object, Cary.userObjects.objectTypes.POLYGON); } }, 
                       { text: stringTable.newIcon, onClick: insertIcon },
                       //{ text: stringTable.newIconGrp, onClick: plotIconGroup },
                       { separator: true },
                       { text: stringTable.newBerth, onClick: plotBerth }, 
                       { text: stringTable.newDepthCnt, onClick: plotDepthContour, onSave: globalInterface.addNewObject /*DepthContour*/ }, 
                       { text: stringTable.newBridgeCnt, onClick: plotBridgeContour, onSave: globalInterface.addNewObject /*BridgeContour*/ }, 
                       { text: stringTable.newWLContour, onClick: plotWaterLevelContour, onSave: globalInterface.addNewObject /*BridgeContour*/ }, 
                       { text: stringTable.newNavContour, onClick: plotNavContour, onSave: globalInterface.addNewObject /*BridgeContour*/ }, 
                       { separator: true },
                       { text: stringTable.objList },
                       { separator: true }, 
                       { text: stringTable.loadUserObj, onClick: loadUserObject }, 
                       { text: stringTable.loadEditUserObj, onClick: loadEditUserObject }, 
                       { separator: true },
                       { text: stringTable.newRoute, onClick: plotRoute, onSave: globalInterface.addNewObject }, 
                       { separator: true },
                       { text: stringTable.backToPrevMenu,  onClick: function (item) { item.menu.close (); } }];
        var menu;
                
        if (Cary.tools.isNothing (oeAction))
        {
            globalInterface.getStartPos = null;
            globalInterface.onSave      = null;
            
            menu = map.createMapMenu ({ x: offX, y: offY },
                                      [{ text: stringTable.getWeatherPredHere }, { text: stringTable.objEditor, subItems: oeItems }], { title: stringTable.atThisPoint, width: '200px' });

            Cary.tools.cancelMouseEvent (event);
        }
        else
        {
            globalInterface.getStartPos = function () { return { x: offX, y: offY }; };
            globalInterface.onSave      = 'onSave' in oeItems [oeAction] ? oeItems [oeAction].onSave : null;
            
            oeItems [oeAction].onClick (null, objectToProcess);
        }
        
        function loadEditUserObject (item)
        {
            item.menu.close ();
            menu.close ();
            
            loadObject ({ silent: true, onLoad: onLoad });

            function onLoad (object)
            {
                switch (object.type)
                {
                    case Cary.userObjects.objectTypes.ICON_GROUP:
                        plotIconGroup (item, object); break;
                        
                    case Cary.userObjects.objectTypes.POLYLINE:
                    case Cary.userObjects.objectTypes.POLYGON:
                        plotPolyline (item, object, object.type, object.userType, createUserObject); break;
                }
            }
        }
        
        function loadUserObject (item)
        {
            loadObject ();

            item.menu.close ();
            menu.close ();                                                                                             
        }
        
        function plotIconGroup (item, object)
        {
            var pointsPane = new LinePlotterPane (document.getElementById ('rightPane'),
                                                  { onClose: stopPlotting, onSave: saveObject, 
                                                    onPointChanged: onPointChanged,
                                                    onDeletePoint: function (index) { interface.deletePoint (index); },
                                                    onNewPoint: function (point) { interface.newPoint (point); } },
                                                  { title: stringTable.icnGroupEdit });
            var interface;

            globalInterface.pointsPane = pointsPane;
            
            if (Cary.tools.isNothing (object))
                object = null;
            
            pointsPane.show ();

            if (object !== null)
                object.positions.forEach (function (position) { pointsPane.addPoint (position.lat, position.lon); });
            
            mode = modes.PLOTTING;

            item.menu.close ();
            menu.close ();

            interface = map.plotIconGroup (offX, offY, { onNewPoint: onNewPoint }, {}, object); 

            map.setCursor ('pointer');

            function stopPlotting ()
            {
                interface.stop ();

                mode = modes.REGULAR;
                
                globalInterface.pointsPane = null;
            }

            function saveObject ()
            {
                var object = interface.getObject ();
                
                new Cary.ui.InputBox ({ visible: true, text: stringTable.objNameEnter, title: stringTable.iconGrp, value: object.name, width: 350 }, { onOk: onOk });
                
                function onOk (name)
                {
                    object.name = name;
                    
                    interface.stop ();
                    interface.save ();
                    
                    pointsPane.close (true);

                    mode = modes.REGULAR;
                }
            }

            function onNewPoint (lat, lon)
            {
                pointsPane.addPoint (lat, lon);
            }

            function onPointChanged (index, point)
            {
                interface.changePoint (index, point);
            }
        }
        
        function plotDepthContour (item, object)
        {
            plotPolyline (item, object, Cary.userObjects.objectTypes.POLYGON, userObj.types.DEPTH_CONTOUR, createUserObject);
        }
        
        function plotNavContour (item, object)
        {
            plotPolyline (item, object, Cary.userObjects.objectTypes.POLYGON, userObj.types.NAV_CONTOUR, createUserObject);
        }
        
        function plotRoute (item, object)
        {
            var interface = plotPolyline (item, object, Cary.userObjects.objectTypes.POLYLINE, userObj.types.ROUTE, createUserObject,
                                          { onItemHover: onItemHover, onVertexHover: onVertexHover, onIndexClick: onIndexClick } );

            function onIndexClick (index)
            {
                new WaypointPropWnd (null, object.points [index], { onOk: onOk });
                
                function onOk ()
                {
                    
                }
            }
            
            function onVertexHover (point)
            {
                
            }
            
            function onItemHover (index)
            {
                if (!object)
                    object = interface.getObject ();
                
                if (object)
                {
                    object.activePoint = object.points [index];

                    object.drawer.draw (map.map);
                }
            }
        }
        
        function plotBridgeContour (item, object)
        {
            plotPolyline (item, object, Cary.userObjects.objectTypes.POLYGON, userObj.types.BRIDGE_CONTOUR, createUserObject);
        }
        
        function plotWaterLevelContour  (item, object)
        {
            plotPolyline (item, object, Cary.userObjects.objectTypes.POLYGON, userObj.types.WATERLEVEL_CONTOUR, createUserObject);
        }
        
        function plotBerth (item, object)
        {
            var pointsPane = new LinePlotterPane (document.getElementById ('rightPane'),
                                                  { onClose: stopPlotting, onSave: saveObject, 
                                                    onPointChanged: onPointChanged,
                                                    onDeletePoint: function (index) { interface.deletePoint (index); },
                                                    onNewPoint: function (point) { interface.newPoint (point); } },
                                                  { calcRange: true, title: stringTable.berth });
            var interface = null;

            globalInterface.pointsPane = pointsPane;

            if (Cary.tools.isNothing (object))
                object = null;
            
            pointsPane.show ();
            pointsPane.showButton (LinePlotterPane.ADD_BUTTON, false);
            pointsPane.showButton (LinePlotterPane.DELETE_BUTTON, false);

            if (object !== null)
                object.points.forEach (function (point) { pointsPane.addPoint (point.lat, point.lon); });
            
            mode = modes.PLOTTING;

            item.menu.close ();
            menu.close ();

            interface = map.plotPolyline (offX, offY, { onNewPoint: onNewPoint }, {}, object); 

            map.setCursor ('pointer');

            function stopPlotting ()
            {
                interface.stop ();

                globalInterface.pointsPane = null;
                
                mode = modes.REGULAR;
            }

            function saveObject ()
            {
                var object = interface.getObject ();
                
                switch (object.type)
                {
                    case Cary.userObjects.objectTypes.POLYLINE:
                        new Cary.ui.UserPolylinePropsWnd (null, object, { visible: true, onOk: onOk }); break;
                        
                    case Cary.userObjects.objectTypes.POLYGON:
                        new Cary.ui.UserPolygonPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                }
                
                function onOk ()
                {
                    interface.stop ();
                    interface.save ();
                    
                    pointsPane.close (true);

                    mode = modes.REGULAR;
                }
            }

            function onNewPoint (lat, lon)
            {
                pointsPane.addPoint (lat, lon);
                pointsPane.showButton (LinePlotterPane.ADD_BUTTON, false);
                
                if (interface !== null)
                {
                    interface.stop ();
                    interface.drawDraggable ({ onPointChanged: function (index, point) { pointsPane.changePoint (index, point); },
                                               onPointChanging: function (index, point) { posInd.setValue (point.lat, point.lon); } });
                }
            }

            function onPointChanged (index, point)
            {
                interface.changePoint (index, point);
                interface.drawDraggable ({ onPointChanged: function (index, point) { pointsPane.changePoint (index, point); },
                                           onPointChanging: function (index, point) { posInd.setValue (point.lat, point.lon); } });
            }
        }

        function getPaneTitle (object, objectType)
        {
            var title;
            var userType;

            if (!Cary.tools.isNothing (object))
            {
                objectType = object.type;
                userType   = object.userType;
            }
            else
            {
                userType = null;
            }
            
            if (userType !== null)
            {
                title = object.getUserTypeName ();
            }
            else
            {
                switch (objectType)
                {
                    case Cary.userObjects.objectTypes.POLYLINE:
                        title = stringTable.polylineEdit; break;

                    case Cary.userObjects.objectTypes.POLYGON:
                        title = stringTable.polygonEdit; break;

                    case Cary.userObjects.objectTypes.ICON_GROUP:
                        title = stringTable.icnGroupEdit; break;

                    default:
                        title = stringTable.userObj;
                }
            }
            
            return title;
        };

        function plotPolyline (item, object, objectType, userType, createUserObject, callbacks)
        {
            var onItemHover = (callbacks && callbacks.onItemHover) ? callbacks.onItemHover : null;
            var pointsPane  = new LinePlotterPane (document.getElementById ('rightPane'),
                                                  { onClose: stopPlotting, onSave: saveObject, 
                                                    onIndexClick: callbacks ? callbacks.onIndexClick : null,
                                                    onPointChanged: onPointChanged,
                                                    onItemHover: onItemHover,
                                                    onDeletePoint: function (index) { interface.deletePoint (index); },
                                                    onNewPoint: function (point) { interface.newPoint (point); } },
                                                  { title: getPaneTitle (object, objectType), calcRange: true });
            var interface;
            var drawCallbacks = { onPointChanged: function (index, point) { pointsPane.changePoint (index, point); },
                                  onPointChanging: function (index, point) { posInd.setValue (point.lat, point.lon); }, 
                                  onSelectPoint: function (index) { pointsPane.selectPoint (index); },
                                  onNewPoint: onNewPoint,
                                  pointsPane: pointsPane };

            if (Cary.tools.isNothing (offX))
                offX = globalInterface.getStartPos ().x;
            
            if (Cary.tools.isNothing (offY))
                offY = globalInterface.getStartPos ().y;
            
            globalInterface.pointsPane = pointsPane;

            if (Cary.tools.isNothing (userType))
                userType = null;
            
            if (Cary.tools.isNothing (object))
                object = null;
            
            pointsPane.show ();

            if (object !== null)
                object.points.forEach (function (point) { pointsPane.addPoint (point.lat, point.lon); });
            
            mode = modes.PLOTTING;

            if (!Cary.tools.isNothing (item))
                item.menu.close ();
            
            if (!Cary.tools.isNothing (menu))
                menu.close ();

            interface = map.plotPolyline (offX, offY, drawCallbacks, null, object, objectType, userType, createUserObject); 

            map.setCursor ('pointer');
            
            return interface;
            
            function stopPlotting ()
            {
                if (interface !== null)
                    interface.stop ();

                globalInterface.pointsPane = null;
                
                mode = modes.REGULAR;
            }

            function saveObject ()
            {                
                var object = interface.getObject ();
                
                if (Cary.tools.isNothing (userType))
                {
                    switch (object.type)
                    {
                        case Cary.userObjects.objectTypes.POLYLINE:
                            new Cary.ui.UserPolylinePropsWnd (null, object, { visible: true, onOk: onOk }); break;

                        case Cary.userObjects.objectTypes.POLYGON:
                            new Cary.ui.UserPolygonPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                    }
                }
                else
                {
                    switch (object.userType)
                    {
                        case userObj.types.DEPTH_CONTOUR:
                            new userObj.DepthContourPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                            
                        case userObj.types.NAV_CONTOUR:
                            new userObj.NavContourPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                            
                        case userObj.types.WATERLEVEL_CONTOUR:
                            new userObj.WaterLevelContourPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                            
                        case userObj.types.ROUTE:
                            new userObj.RoutePropsWnd (/*pointsPane.parent*/null, object, { visible: true, onOk: onOk }); break;
                            
                        case userObj.types.BRIDGE_CONTOUR:
                            new userObj.BridgeContourPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                            
                        case userObj.types.REDRAWABLE_CONTOUR:
                            new Cary.ui.UserPolygonPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                    }
                }
                
                function onOk ()
                {
                    if (interface !== null)
                    {
                        interface.stop ();
                        
                        if (Cary.tools.isNothing (globalInterface.onSave))
                            interface.save ();
                        else
                            globalInterface.onSave (object);
                    }
                    
                    pointsPane.close (true);

                    mode = modes.REGULAR;
                }
            }

            function onNewPoint (lat, lon)
            {
                pointsPane.addPoint (lat, lon);
            }

            function onPointChanged (index, point)
            {
                if (interface !== null)
                {
                    interface.changePoint (index, point);
                    interface.drawDraggable (drawCallbacks);
                }
            }
        }
            
        function insertIcon (item)
        {
            var position = map.clientToMap (offX, offY);
            
            item.menu.close ();
            menu.close ();

            map.insertIcon ('new icon', position.lat, position.lon, { visible: true });
        }
    }
    
    function loadObject (options)
    {
        var silent;
        var loadOptions = {};
        
        if (Cary.tools.isNothing (options))
            options = {};
        
        silent = ('silent' in options) ? options.silent : false;
        
        if (silent)
            loadOptions.onLoad = function (object) { if ('onLoad' in options) options.onLoad (object); };
        else
            loadOptions.onLoad = function (object) { map.drawUserObject (object); };
        
        loadOptions.createUserObject = userObj.createVirginUserObject;
        
        new UserObjectLoadWnd (null, loadOptions);
    }
    
    function activatePlottingContextMenu (event)
    {
        var menu = map.createMapMenu ({ x: event.offsetX, y: event.offsetY }, 
                                      [{ text: stringTable.saveObject, onClick: function () { menu.close(); globalInterface.pointsPane.forceSave (); } }, 
                                       { text: stringTable.doNothing,  onClick: function () { menu.close (); } }]);

        Cary.tools.cancelMouseEvent (event);
    }
    
    function saveObject ()
    {
    }
    
    function onMouseMove (event)
    {
        posInd.onMouseEvent (event);
    }

    function switchPassageMode ()
    {
        passageMode.active = !passageMode.active;
        
        passageButton.setImage (passageMode.active ? 'res/tug26g.png' : 'res/tug26.png');
        
        if (passageMode.active)
        {
            if (routePane)
                routePane.close ();
            
            routePane = null;
            
            if (simulation.pane)
                simulation.pane.show (false);
        }
        
        passagePane.show (passageMode.active);
        
        if (!passageMode.active)
            passageMode.removeTemporaryDrawnObjects ();
    }
    
    function showRoutePane ()
    {
        if (passageMode.active)
            switchPassageMode ();
        
        if (routePane === null)
            routePane = new RoutePane (document.getElementById ('rightPane'), { onClose: function () { routePane = null; } });
    }
    
    function showWaterLevelPane ()
    {
        if (waterLevelPane === null)
            waterLevelPane = new WaterLevelPane (document.getElementById ('rightPane'), { onClose: function () { waterLevelPane = null; } });
    }
    
    function showSettingsPane ()
    {
        map.lock (closeAllMenus);
        
        settingsButton.show (false);
        settingsPane.slideIn ();
        
        function closeAllMenus ()
        {
            if (activeSubMenu !== null)
                activeSubMenu.show (false);
            
            settingsPane.unlock ();
            settingsPane.slideOut ();
            
            map.unlock ();
            settingsButton.show (true);
        }
    }
        
    /*function hideSettingsPane ()
    {
        settingsPane.slideOut ();
        settingsButton.show (true);
        
        map.unlock ();
    }*/

    function onInitSimulationPane (panel)
    {
        var client;
        
        if (!simulation.simulator)
            simulation.simulator = new PassageSimulator ();
        
        panel.addTitle (stringTable.simulation, { width: 220 }, onClosePane);

        client = panel.addSubPanel ({ position: 'absolute', left: 10, top: 40, width: '100%', height: 'fit-content' });
        
        var dtBlock      = new Cary.ui.ControlBlock ({ parent: client, visible: true, text: stringTable.dateTime },
                                                     { position: 'absolute', top: 0, left: 0, width: 310, height: 22, 'text-align': 'left', 'line-height': 22, 'font-size': 17 });
        var stateBlock   = new Cary.ui.ControlBlock ({ parent: client, visible: true, text: stringTable.state },
                                                     { position: 'absolute', top: 30, left: 0, width: 310, height: 22, 'text-align': 'left', 'line-height': 22, 'font-size': 17 });
        var accelBlock   = new Cary.ui.ControlBlock ({ parent: client, visible: true, text: stringTable.acceleration },
                                                     { position: 'absolute', top: 60, left: 0, width: 310, height: 22, 'text-align': 'left', 'line-height': 22, 'font-size': 17 });
        var timeQntBlock = new Cary.ui.ControlBlock ({ parent: client, visible: true, text: stringTable.timeQuant },
                                                     { position: 'absolute', top: 90, left: 0, width: 310, height: 22, 'text-align': 'left', 'line-height': 22, 'font-size': 17 });
        var buttonBlock  = new Cary.ui.ControlBlock ({ parent: client, visible: true },
                                                     { position: 'absolute', top: 120, left: 0, width: 310, height: 22, 'text-align': 'left', 'line-height': 22, 'font-size': 17 });
                                                
        var dtCtl         = new Cary.ui.EditBox ({ parent: dtBlock.htmlObject, visible: true, text: Cary.tools.formatDateTime (Cary.tools.getTimestamp (), false), readOnly: true }, 
                                                 { float: 'right', width: 180, height: 22, padding: 0, 'font-size': 17 });
        var stateCtl      = new Cary.ui.EditBox ({ parent: stateBlock.htmlObject, visible: true, text: stringTable.notApplicable, readOnly: true }, 
                                                 { float: 'right', width: 180, height: 22, padding: 0, 'font-size': 17 });
        var accelCtl      = new Cary.ui.EditBox ({ parent: accelBlock.htmlObject, visible: true, value: simulation.acceleration, numeric: true, min: 1, max: 1000, onChange: onChangeAccel }, 
                                                 { float: 'right', width: 80, height: 22, padding: 0, 'font-size': 17 });
        var timeQntCtl    = new Cary.ui.EditBox ({ parent: timeQntBlock.htmlObject, visible: true, value: simulation.timeQuant, numeric: true, min: 1, max: 1000, onChange: onChangeTimeQnt }, 
                                                 { float: 'right', width: 80, height: 22, padding: 0, 'font-size': 17 });
        var startStopCtl  = new Cary.ui.Button ({ parent: buttonBlock.htmlObject, text: Cary.symbols.rightArrow, visible: true, onClick: startStopSimulation }, { fontSize: 30, height: 35, width: 40 });
        var pauseCtl      = new Cary.ui.Button ({ parent: buttonBlock.htmlObject, text: Cary.symbols.pause, visible: true, onClick: pauseResumeSimulation }, { fontSize: 30, height: 35, width: 50 });
        var slider        = new Cary.ui.Slider ({ parent: buttonBlock.htmlObject, visible: true, value: 0, min: 1, max: 3600000 * 72, step: 1, onChange: onChangeVesselPos }, 
                                                 { float: 'right', width: 190, height: 35, padding: 0, 'font-size': 17 });
        
        globalInterface.pauseResumeSimulation = pauseResumeSimulation;
        
        globalInterface.setStateText = function (stateText)
        {
            stateCtl.setValue (stateText);
        };
        
        globalInterface.setSimulationStartTime = function (dateTime)
        {
            dtCtl.setValue (Cary.tools.formatDateTime (dateTime, false));
        };
        
        simulation.simulator.setCallback (onChangePosition);
        /*simulation.adjustTimeSlider = function (time)
        {
            slider.htmlObject.min   = 0;
            slider.htmlObject.max   = simulator.getFullTime ();
            slider.htmlObject.step  = timeQntCtl.getValue ();
            slider.htmlObject.value = time;
        };
        
        simulation.setup = function (route, start, sog, draft)
        {
            var vesselIcon = { path: Cary.tools.diamondIconPath (), scale: 2, rotation: 0, fillColor: 'yellow', fillOpacity: 1.0, strokeColor: 'blue', strokeWeight: 1 };
            var latLngPos  = { lat: route.points [0].lat, lng: route.points [0].lon };
            
            simulation.route     = route;
            simulation.startTime = start;
            simulation.time      = start;
            simulation.sog       = sog;
            simulation.draft     = draft;
            simulation.legs      = route.getLegs (sog);
            simulation.timer     = null;
            simulation.timeQnt   = timeQntCtl.getValue () * 60000;
            simulation.accel     = accelCtl.getValue ();
            simulation.fullTime  = simulation.legs [simulation.legs.length-1].endTimeOffset;
            simulation.marker    = new google.maps.Marker ({ position: latLngPos, map: map.map, icon: vesselIcon });
            
            slider.htmlObject.min  = 0;
            slider.htmlObject.max  = simulation.fullTime;
            slider.htmlObject.step = timeQntCtl.getValue ();
        };
        
        simulation.start = function ()
        {
            simulation.timer      = setInterval (simulation.proc, 500/);
            simulation.simStartAt = Cary.tools.getTimestamp ();
        };
        
        simulation.stop = function ()
        {
            if (simulation.timer)
            {
                var icon;
                var position;
                
                clearInterval (simulation.timer);
                
                simulation.timer = null;
                
                icon = simulation.marker.getIcon ();
                        
                icon.path     = Cary.tools.diamondIconPath ();
                icon.rotation = 0;
                
                position = { lat: simulation.route.points [0].lat, lng: simulation.route.points [0].lon };
                
                simulation.marker.setPosition (position);
                simulation.marker.setIcon (icon);
                
                slider.htmlObject.value = 0;
            }
        };

        simulation.setTime = function (actualTime)
        {
            if (actualTime >= simulation.fullTime)
            {
                actualTime = simulation.fullTime;
                
                simulation.stop ();
            }
            else
            {
                var vesselLocation = simulation.route.getPositionOfPassage (simulation.sog, actualTime / 3600000);
                var latLngPos      = { lat: vesselLocation.position.lat, lng: vesselLocation.position.lon };
                var vesselIcon;
                
                if (simulation.marker)
                {
                    vesselIcon = simulation.marker.getIcon();
                    
                    vesselIcon.rotation = vesselLocation.stopped ? 0 : vesselLocation.course;
                    vesselIcon.path     = vesselLocation.stopped ? Cary.tools.diamondIconPath () : Cary.tools.simpleVesselIconPath ();
                    
                    simulation.marker.setPosition (latLngPos);
                    simulation.marker.setIcon (vesselIcon);
                }
                else
                {
                    vesselIcon = { path: Cary.tools.simpleVesselIconPath (), scale: 2, rotation: vesselLocation.course, fillColor: 'yellow', fillOpacity: 1.0,
                                   strokeColor: 'blue', strokeWeight: 1 };

                    simulation.marker = new google.maps.Marker ({ position: latLngPos, map: map.map, icon: vesselIcon });
                }
            }
            
            slider.htmlObject.value = actualTime;
            
            dtCtl.setValue (Cary.tools.formatDateTime (simulation.startTime + actualTime));
        };
        
        simulation.proc = function ()
        {
            var curTime = Cary.tools.getTimestamp ();
            var simTime = curTime - simulation.simStartAt;
            
            simulation.setTime (simTime * simulation.acceleration);
        };*/
        
        function onChangePosition (time, location)
        {
            var latLngPos = { lat: location.position.lat, lng: location.position.lon };
            var vesselIcon;

            routePane.updateVisualObjects (time);
            
            dtCtl.setValue (Cary.tools.formatDateTime (simulation.simulator.getStartTime () + time));
            stateCtl.setValue (location.stopped ? stringTable.moored : stringTable.onTheWay);

            slider.htmlObject.min   = 0;
            slider.htmlObject.max   = simulation.simulator.getFullTime ();
            slider.htmlObject.step  = timeQntCtl.getValue ();
            slider.htmlObject.value = time;
            
            if (simulation.marker)
            {
                vesselIcon = simulation.marker.getIcon();

                vesselIcon.rotation = location.stopped ? 0 : location.course;
                vesselIcon.path     = location.stopped ? Cary.tools.diamondIconPath () : Cary.tools.simpleVesselIconPath ();

                simulation.marker.setPosition (latLngPos);
                simulation.marker.setIcon (vesselIcon);
            }
            else
            {
                vesselIcon = { path: Cary.tools.simpleVesselIconPath (), scale: 2, rotation: location.course, fillColor: 'yellow', fillOpacity: 1.0,
                               strokeColor: 'blue', strokeWeight: 1 };

                simulation.marker = new google.maps.Marker ({ position: latLngPos, map: map.map, icon: vesselIcon });
            }
            
            map.map.setZoom (13);
            map.map.setCenter (latLngPos);
        }
        
        function onChangeVesselPos ()
        {
            var time = parseInt (slider.htmlObject.value);
            
            //simulation.setTime (time);
            simulation.simulator.setTime (time);
            
            routePane.updateVisualObjects (time);
        }

        function pauseResumeSimulation ()
        {
            if (simulation.run)
            {
                if (simulation.simulator.paused ())
                {
                    simulation.simulator.resume ();
                    
                    pauseCtl.setValue (Cary.symbols.pause);
                }
                else
                {
                    simulation.simulator.pause ();
                    
                    pauseCtl.setValue (Cary.symbols.resume);
                }
            }
        }
        
        function startStopSimulation ()
        {
            simulation.run = !simulation.run;
                
            routePane.stopAlert ();
            
            startStopCtl.setValue (simulation.run ? Cary.symbols.filledSquare : Cary.symbols.rightArrow);
            pauseCtl.setValue (Cary.symbols.pause);
            
            if (simulation.run)
            {
                simulation.simulator.setAccel (parseInt (accelCtl.getValue ()));
                simulation.simulator.start ();
            }
            else
            {
                simulation.simulator.stop ();
            }
        }
        
        function onChangeAccel ()
        {
            simulation.acceleration = parseInt (this.value);
            
            simulation.simulator.setAccel (simulation.acceleration);
        }
        
        function onChangeTimeQnt ()
        {
            simulation.timeQuant = parseInt (this.value);
            
            simulation.simulator.setTimeQuant (simulation.timeQuant);
        }
        
        function onClosePane ()
        {
            /*if (simulation.timer)
            {
                clearInterval (simulation.timer);
                
                simulation.timer = null;
            }*/
            
            simulation.simulator.stop ();
            routePane.hideObjects ();
            routePane.hideObjectList ();
            routePane.stopAlert ();
            
            if (simulation.marker)
            {
                simulation.marker.setMap (null);
            
                simulation.marker = null;
            }
            
            if (simulation.active)
                simulation.active = false;
            
            slider.htmlObject.value       = 0;
            startStopCtl.htmlObject.value = Cary.symbols.rightArrow;
        }        
    }
    
    function onInitPassagePane (panel)
    {
        var temporaryShownObjects = [];
        var areas;
        
        globalInterface.assignSelectedData = assignSelectedData;
        
        passageMode.removeTemporaryDrawnObjects = removeTemporaryDrawnObjects;
        
        panel.addTitle (stringTable.passage, { width: 250 }, onClosePane);
        
        var client = panel.addSubPanel ({ position: 'absolute', left: 10, top: 40, width: '100%', height: 'fit-content' });
        
        var time       = Cary.tools.getTimestamp ();
        var draftBlock = new Cary.ui.ControlBlock ({ parent: client, visible: true, text: stringTable.draft },
                                                   { width: 310, height: 22, 'text-align': 'left', 'line-height': 22, 'font-size': 17 });
        var dtBlock    = new Cary.ui.ControlBlock ({ parent: client, visible: true, text: stringTable.dateTime },
                                                   { position: 'absolute', top: 35, left: 0, width: 310, height: 22, 'text-align': 'left', 'line-height': 22, 'font-size': 17 });
        var layerBlock = new Cary.ui.ControlBlock ({ parent: client, visible: true, text: stringTable.layer },
                                                   { position: 'absolute', top: 70, left: 0, width: 310, height: 22, 'text-align': 'left', 'line-height': 22, 'font-size': 17 });
        var hintBlock  = new Cary.ui.ControlBlock ({ parent: client, visible: true, text: stringTable.hintMode },
                                                   { position: 'absolute', top: 100, left: 0, width: 310, height: 22, 'text-align': 'left', 'line-height': 30, 'font-size': 17 });
        var draftCtl   = new Cary.ui.EditBox ({ parent: draftBlock.htmlObject, numeric: true, float: true, min: 0.5, max: 70.0, step: 0.1, value: 10, visible: true, onChange: queryData }, 
                                              { display: 'inline', float: 'right', width: 60, height: 22, padding: 0, 'font-size': 17 });
        var timeCtl    = new Cary.ui.TimeEditBox ({ parent: dtBlock.htmlObject, visible: true, text: Cary.tools.formatTime (time, false), onChange: queryData }, 
                                                  { float: 'right', width: 80, height: 22, padding: 0, 'font-size': 17 });
        var dateCtl    = new Cary.ui.EditBox ({ parent: dtBlock.htmlObject, visible: true, text: Cary.tools.formatDate (time), onClick: selectDate }, 
                                              { float: 'right', width: 100, height: 22, padding: 0, 'font-size': 17, 'margin-right': 10 });
        var layerCtl   = new Cary.ui.ListBox ({ parent: layerBlock.htmlObject, comboBox: true, visible: true, onItemSelect: onSelectLayer }, 
                                              { display: 'inline', float: 'right', width: 195, height: 25, padding: 0, 'font-size': 17 });
        var hintCtl    = new Cary.ui.ListBox ({ parent: hintBlock.htmlObject, comboBox: true, visible: true, onItemSelect: onSelectHintMode }, 
                                              { display: 'inline', float: 'right', width: 195, height: 25, padding: 0, 'font-size': 17, 'margin-top': 5 });

        hintCtl.addItem (stringTable.off, userObj.NavContour.hintModes.OFF, true);
        hintCtl.addItem (stringTable.flash, userObj.NavContour.hintModes.FLASH, false);
        hintCtl.addItem (stringTable.onClick, userObj.NavContour.hintModes.ON_CLICK, false);
        
        panel.options.onOpen = function (panel)
                               {
                                   onSelectLayer (layerCtl.getCurSel ());
                                   queryData ();
                               };
        
        new Cary.tools.WaitForCondition (function () { return userLayerList.length > 0; }, 
                                         function ()
                                         {
                                            userLayerList.forEach (function (layer)
                                                                   {
                                                                       var found, i;
                                                                       
                                                                       for (found = false, i = 0; !found && i < layer.objects.length; ++ i)
                                                                       {
                                                                           if (layer.objects [i].userType === userObj.types.NAV_CONTOUR)
                                                                               found = true;
                                                                       }
                                                                       
                                                                       if (found)
                                                                           layerCtl.addItem (layer.name, layer, layerCtl.getCount () === 0);
                                                                   });
                                         });
        
        Cary.tools.sendRequest ({ url: 'requests/wla_get_list.php', method: 'get', content: Cary.tools.contentTypes.plainText, 
                                  onLoad: function (areaList)
                                  {
                                      areas = areaList;
                                      
                                      areas.forEach (function (area)
                                                     {
                                                         area.offset = (area.baseLevel && area.baseValue) ? area.baseLevel + area.baseValue : 0;
                                                     });
                                  }, 
                                  resType: Cary.tools.resTypes.json });

        function assignSelectedData (area, data, offset)
        {
            var layer = layerCtl.getSelectedData ();
            
            time = data.timestamp;
            
            dateCtl.setValue (Cary.tools.formatDate (time));
            timeCtl.setValue (Cary.tools.formatTime (time, false));
            
            layer.objects.forEach (function (object)
                                   {
                                       if (object.userProps.deviceID === area.device)
                                       {
                                            object.offset        = (offset ? (offset - data.level) : data.level) / 100;
                                            object.vesselDraught = draftCtl.getValue ();

                                            if (!object.tag)
                                                object.createTag ();

                                            object.drawer.setOptions ('fillColor', object.getFillColor ());
                                            object.tag.setText (object.getHintText ());
                                       }
                                   });
        }
        
        function onSelectHintMode ()
        {
            userObj.NavContour.hintMode = hintCtl.getSelectedData ();
        }
        
        function queryData ()
        {
            var dateTime = new Date (time);
            var url;

            dateTime.setHours (timeCtl.getHours());
            dateTime.setMinutes (timeCtl.getMinutes());
            dateTime.setSeconds (0);
            dateTime.setMilliseconds (0);
            
            time = dateTime.getTime ();
            
            url = 'wl/get_wl_list.php?t=' + Cary.tools.toPhpTime (time).toFixed (0) + '&n=3';

            loadSerializable (url, onLoaded);

            function onLoaded (data)
            {
                data.forEach (function (item)
                              {
                                  var layer = layerCtl.getSelectedData ();
                                  
                                  layer.objects.forEach (function (object)
                                                         {
                                                             if (object.userProps.deviceID === item.device)
                                                             {
                                                                 for (var i = 0; i < areas.length; ++ i)
                                                                 {
                                                                     if (areas [i].device && (areas [i].device === item.device))
                                                                     {
                                                                         object.offset        = (areas [i].offset ? (areas [i].offset - item.level) : item.level) / 100;
                                                                         object.vesselDraught = draftCtl.getValue ();
                                                                         
                                                                         if (!object.tag)
                                                                             object.createTag ();
                                                                         
                                                                         object.drawer.setOptions ('fillColor', object.getFillColor ());
                                                                         object.tag.setText (object.getHintText ());
                                                                         
                                                                         break;
                                                                     }
                                                                 }
                                                             }
                                                         });
                                  
                              });
            }
        }
        
        function removeTemporaryDrawnObjects ()
        {
            temporaryShownObjects.forEach (function (object)
                                           {
                                               if (object.userType === userObj.types.NAV_CONTOUR)
                                               {
                                                   object.drawer.undraw ();
                                               
                                                   object.vesselDraught = null;
                                                   object.offset        = null;
                                               }
                                           });
            
            temporaryShownObjects = [];
        }
        
        function onSelectLayer (selection)
        {
            var layer = layerCtl.getSelectedData ();
            
            removeTemporaryDrawnObjects ();
            
            layer.objects.forEach (function (object)
                                   {
                                       if (object.userType === userObj.types.NAV_CONTOUR && !object.drawn ())
                                       {
                                           object.drawer = object.createDrawer ();
                                           
                                           object.drawer.draw (map);
                                           
                                           temporaryShownObjects.push (object);
                                       }
                                   });
                                   
            queryData ();
        }
        
        function selectDate (event)
        {
            var calendarDesc = { position: { x: event.x, y: event.y - 100 },
                                 maxDate: Cary.tools.getTimestamp(),
                                 onSelect: function (date)
                                           {
                                               var newDate  = new Date (date);
                                               var dateTime = new Date (time);
                                               
                                               newDate.setHours (dateTime.getHours ());
                                               newDate.setMinutes (dateTime.getMinutes ());
                                               
                                               time = newDate.getTime ();
                                               
                                               dateCtl.setValue (Cary.tools.formatDate (date));

                                               CalendarControl.instance.close ();

                                               queryData ();
                                           } };

            new CalendarControl (calendarDesc, new Date (time));
        }
        
        function onClosePane ()
        {
            if (passageMode.active)
            {
                switchPassageMode ();
                
                removeTemporaryDrawnObjects ();
                
                gllobalInterface.assignSelectedData = null;
            }
        }
        
        function recalculate ()
        {
            var layer = layerCtl.getSelectedData ();
            
            map.showUserObjectCollection (layer, true, function (object) { return object.userType === userObj.types.NAV_CONTOUR; });
        }
    }
    
    function onInitSettingsPane (panel)
    {
        var baseMapMenu;
        var overlaysMenu;
        
        baseMapMenu  = map.createGMPanel (google.maps.ControlPosition.TOP_LEFT, { onInit: onInitBaseMapMenu, height: 'fit-content', onOpen: setActiveSubMenu, onClose: resetActiveSubMenu });
        overlaysMenu = map.createGMPanel (google.maps.ControlPosition.TOP_LEFT, { onInit: onInitOverlaysMenu, height: 'fit-content', onOpen: setActiveSubMenu, onClose: resetActiveSubMenu });
        
        baseMapMenu.container.style.marginLeft  = '330px';//'280px';
        overlaysMenu.container.style.marginLeft = '330px';// '280px';
        
        map.addEventListener ('zoom_changed', 
                              function ()
                              {
                                  // Some magic here
                                  baseMapMenu.container.style.marginLeft  = '280px';
                                  overlaysMenu.container.style.marginLeft = '280px';
                              });
        
        map.addEventListener ('maptypeid_changed', 
                              function ()
                              {
                                  // Some magic here
                                  baseMapMenu.container.style.marginLeft  = '330px';
                                  overlaysMenu.container.style.marginLeft = '330px';
                                  
                                  map.addEventListener ('tilesloaded', function () { userObj.realertAreas (); });
                              });
        
        panel.addTitle (stringTable.settings, null, function () { settingsButton.show (true); map.unlock (); });
        panel.addSubMenu ({ text: stringTable.baseMap, className: 'settingsPaneSubMenu', onClick: function () { baseMapMenu.show (); } });
        panel.addSubMenu ({ text: stringTable.overlays, className: 'settingsPaneSubMenu', onClick: function () { overlaysMenu.show (); } });
        
        function setActiveSubMenu (subMenu)
        {
            activeSubMenu = subMenu;
        }
        
        function resetActiveSubMenu (subMenu)
        {
            activeSubMenu = null;
        }
        
        function onInitBaseMapMenu (menu)
        {
            var items = [];
            
            menu.addTitle (stringTable.baseMap, null, function () { panel.unlock (); });
            
            addItem ('Roadmap', Cary.maps.baseMaps.RoadMap);
            addItem ('Terrain', Cary.maps.baseMaps.Terrain);
            addItem ('Satellite', Cary.maps.baseMaps.Satellite);
            addItem ('Hybrid', Cary.maps.baseMaps.Hybrid);
            addItem ('Navionics', Cary.maps.baseMaps.Navionics);
            addItem ('Abris', Cary.maps.baseMaps.CustomMap);
            addItem ('OpenStreet', Cary.maps.baseMaps.OpenStreet);
            addItem ('Sentinel-2', Cary.maps.baseMaps.Sentinel2);
            addItem ('Landsat 8', Cary.maps.baseMaps.Landsat8);
            addItem ('ScanEx (demo)', Cary.maps.baseMaps.ScanEx);
            
            function addItem (itemName, mapFlag)
            {
                items.push (menu.addItem (itemName, {}, function (item) { selectBaseMap (item); }, { checked: itemName === 'Roadmap', data: map.getBaseMapIndex (mapFlag) }));
            }
            
            function selectBaseMap (activeItem)
            {
                baseMapMenu.show (false);
                //hideSettingsPane ();
                panel.unlock ();
                
                items.forEach (function (item)
                               {
                                   menu.checkItem (item, item === activeItem);
                               });
                
                selectMapType (activeItem.data);
            }
        }
        
        function onInitOverlaysMenu (menu)
        {
            var items = [];
            
            menu.addTitle (stringTable.overlays, null, function () { panel.unlock (); });
            
            addItem ('OpenSea', Cary.maps.overlayMaps.Layers.OpenSea);
            addItem ('OpenWeather (Temperature)', Cary.maps.overlayMaps.Layers.OpenWeatherTemp);
            addItem ('OpenWeather (Precipitation)', Cary.maps.overlayMaps.Layers.OpenWeatherPrecipitation);
            addItem ('OpenWeather (Wind)', Cary.maps.overlayMaps.Layers.OpenWeatherWind);
            addItem ('OpenWeather (Pressure)', Cary.maps.overlayMaps.Layers.OpenWeatherPressure);
            addItem ('OpenWeather (Clouds)', Cary.maps.overlayMaps.Layers.OpenWeatherClouds);
            addItem ('ScanEx/Sentinel', Cary.maps.overlayMaps.Layers.ScanExSentinel);
            addItemCB (stringTable.aisTargets, toggleAISTargets);
            addItem (stringTable.aisTargetsMT, Cary.maps.overlayMaps.Layers.AISTargetsMT);
            
            function toggleAISTargets ()
            {
                if (aisTargetTable.started ())
                    aisTargetTable.stop ();
                else
                    aisTargetTable.start (true);
            }
            
            function addItemCB (itemName, callback)
            {
                items.push (menu.addItem (itemName, { textWidth: '240px', backgroundColor: 'yellow' },
                            function (item)
                            {
                                menu.checkItem (item, !menu.isItemChecked (item));
                                
                                if (callback)
                                    callback ();
                            }, 
                            { checked: false, data: null, textWidth: 240 }));
            }
            
            function addItem (itemName, mapFlag)
            {
                items.push (menu.addItem (itemName, { textWidth: '240px', backgroundColor: 'yellow' },
                            function (item)
                            {
                                var show = !menu.isItemChecked (item);
                                
                                map.showOverlayLayer (map.getOverlayIndex (item.data), show);
                                
                                menu.checkItem (item, show);
                            }, 
                            { checked: false, data: mapFlag, textWidth: 240 }));
            }
        }
    }
    
    function addUserIcon (iconData, callbacks)
    {
        var icon = map.insertIcon (iconData.name, iconData.position.lat, iconData.position.lon, { visible: true, path: iconData.url });
            
        if (Cary.tools.isNothing (callbacks))
            callbacks = {};
        
        if ('onObjectAdded' in callbacks)
            callbacks.onObjectAdded (icon);
        
        return icon;
    }
    
    function waitForUserIcon (iconData, callbacks)
    {
        map.addEventListener ('click', onClick, true);
        
        if (Cary.tools.isNothing (callbacks))
            callbacks = {};
        
        mode = modes.WAIT_FOR_ICON;
        
        function onClick (event)
        {
            var icon;
            var iconFactory = 'onClick' in callbacks ? callbacks.onClick : null;

            icon = map.insertIcon (iconData.name, event.latLng.lat (), event.latLng.lng (), { visible: true, path: iconData.url }, iconFactory, iconData);

            if ('onObjectAdded' in callbacks)
                callbacks.onObjectAdded (icon);
        }
    }
    
    function waitForUserClick (onClick)
    {
        if (!Cary.tools.isNothing (onClick))
        {
            map.addEventListener ('click', onClick, true);

            mode = modes.WAIT_FOR_CLICK;
        }
    }
    
    function waitForMouseMove (onMove)
    {
        if (!Cary.tools.isNothing (onMove))
        {
            map.addEventListener ('mousemove', onMove, true);

            mode = modes.WAIT_FOR_CLICK;
        }
    }
}

function addBaseMap (baseMap)
{
    var select = document.getElementById ('baseMap');
    var option = document.createElement ('option');

    option.text = baseMap.getName ();

    select.add (option);
}

function selectMapType (index)
{
    map.selectBaseMap (index);
}

function showOverlay (index, show)
{
    map.showOverlayLayer (index, show);
}

function createUserObject (name, points, properties, objectType, userType)
{
    var object;
    
    switch (userType)
    {
        case userObj.types.DEPTH_CONTOUR:
            object = new userObj.DepthContour (name, points, 10.0); break;

        case userObj.types.NAV_CONTOUR:
            object = new userObj.NavContour (name, points, 10.0); break;

        case userObj.types.BRIDGE_CONTOUR:
            object = new userObj.BridgeContour (name, points); break;

        case userObj.types.WATERLEVEL_CONTOUR:
            object = new userObj.WaterLevelContour (name, points); break;

        case userObj.types.ROUTE:
            object = new userObj.RouteObject (name, points); break;

        case userObj.types.REDRAWABLE_CONTOUR:
            object = new userObj.RedrawableContour (name, points); break;

        case userObj.types.BERTH:
            object = new userObj.Berth; break;

        case userObj.types.WL_MARKER:
            object = new userObj.WaterLevelMarker; break;

        default:
            object = null;
    }  
    
    return object;
}

function initSettings ()
{
    Cary.tools.sendRequest ({ mathod: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText, resType: Cary.tools.resTypes.json, url: 'requests/set_load.php', onLoad: onLoad });
    
    function onLoad (data)
    {
        data.forEach (function (dataItem)
                      {
                          settings [dataItem.name] = dataItem.value;
                      });

        ['depthAreas', 'waterLevels'].forEach (function (key)
                                               {
                                                    if (key in settings)
                                                        settings [key] = parseInt (settings [key]);
                                                    else
                                                        settings [key] = null;
                                               });
    }
}

function setSetting (name, value)
{
    settings [name] = value;
    
    Cary.tools.sendRequest ({ mathod: Cary.tools.methods.put, content: Cary.tools.contentTypes.json, resType: Cary.tools.resTypes.plain, url: 'requests/set_set.php',
                              param: { name: name, value: value } });
}
