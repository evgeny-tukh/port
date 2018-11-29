var userLayerList  = [];
var routesLayer    = null;

function initAbris (map)
{
    map.addCustomBaseMap ('Abris', getAbrisTile, Cary.maps.baseMaps.CustomMap);
    
    function getAbrisTile (coord, zoom)
    {
        var X   = coord.x % (1 << zoom);  // wrap
        var url = 'http://jecat.ru/port/tiles/get_abris_tiles.php?z=' + zoom.toString () + '&x=' + coord.x.toString () + '&y=' + coord.y.toString ();
        //var url = 'http://localhost:8080/port/tiles/get_abris_tiles.php?z=' + zoom.toString () + '&x=' + coord.x.toString () + '&y=' + coord.y.toString ();

        return url;
    }
}

function initLayers (map)
{
    loadLayerList (onLayerListLoaded);
    getRouteList (onRouteListLoaded);

    function onRouteListLoaded (routeLayerData)
    {
        routesLayer = new Cary.userObjects.ObjectCollection;

        routesLayer.deserialize (routeLayerData, userObj.createVirginUserObject);
    }

    function onLayerListLoaded (layerList)
    {
        layerList.forEach (function (layerData)
                           {
                               var layer = new Cary.userObjects.ObjectCollection;

                               layer.deserialize (layerData, userObj.createVirginUserObject);

                               if (layer.name !== 'routes')
                                   userLayerList.push (layer);
                           });
           
        initDepthAreas (map);
    }
}

function initDepthAreas (map)
{
    depthAreas = null;
    
    userLayerList.forEach (checkLayer);
    
    function checkLayer (layer)
    {
        if (layer.id === settings.depthAreas/*layer.name === 'Depth areas' || layer.name === 'Контуры глубины'*/)
        {
            depthAreas = new userObj.AlertableObjectCollection (map);
            
            depthAreas.deserialize (layer.serialize (), userObj.createVirginUserObject);
        }
        else if (layer.id === settings.waterLevels/*layer.name === 'Water level areas' || layer.name === 'Уровни воды'*/)
        {
            waterLevelAreas = new Cary.userObjects.ObjectCollection (map);
            
            waterLevelAreas.deserialize (layer.serialize (), userObj.createVirginUserObject);
            
            Cary.tools.sendRequest ({ url: 'requests/wla_get_list.php', method: 'get', content: Cary.tools.contentTypes.plainText, onLoad: onLoadWaterLevelAreaList, 
                                      resType: Cary.tools.resTypes.json });
                                  
            function onLoadWaterLevelAreaList (data)
            {
                for (var i = 0; i < data.length; ++ i)
                {
                    for (var j = 0; j < waterLevelAreas.objects.length; ++ j)
                    {
                        var area = waterLevelAreas.objects [j];
                        
                        if (data [i].device === area.userProps.deviceID)
                        {
                            area.baseValue = data [i].baseValue;
                            area.baseLevel = data [i].baseLevel;
                            
                            break;
                        }
                    }
                }
            }
            
            // Need to set up depth areas connected to waterleve meters
            depthAreas.enumerate (function (area)
                                  {
                                      area.getLevel ();
                                  });
        }
    }
}

function hideWaterLevelAreas ()
{
    userLayerList.forEach (checkLayer);
    
    function checkLayer (layer)
    {
        if (layer.name === 'Water level areas' || layer.name === 'Уровни воды')
            map.showUserObjectCollection (layer, false);
    }
}

function initDocuments ()
{
    loadSerializable ('dg_get.php?id=1526771890',
                      function (groupInfo)
                      {
                          officialInfo = new doc.DocumentGroup ();
                          
                          officialInfo.deserialize (groupInfo);
                      });
    /*var fleetAgencyOrders;
    var ministryOrders;
    var captainOrders;
    
    officialInfo = new doc.DocumentGroup ('Official information');
    
    fleetAgencyOrders = officialInfo.addGroup ('Распоряжения Росморречфлота');
    ministryOrders    = officialInfo.addGroup ('Распоряжения министерства транспорта РФ');
    captainOrders     = officialInfo.addGroup ('Распоряжения капитана порта');
    
    ministryOrders.addDocument ('Об утверждении Обязательных постановлений в морском порту "Большой порт Санкт-Петербург"', 'http://jecat.ru/vlad_demo7/docs/temp/about_mandatories_applying.pdf', new Date (2016, 12, 19));
    fleetAgencyOrders.addDocument ('Морской порт "Большой порт Санкт-Петербург"', 'http://jecat.ru/vlad_demo7/docs/temp/port_info.pdf', new Date (2017, 09, 28));
    captainOrders.addDocument ('Об установлении допустимых осадок судов на каналах, фарватерах и у причалов на акватории морского порта "Большой порт Санкт-Петербург"', 'http://jecat.ru/vlad_demo7/docs/temp/capt_order_depths.pdf', new Date (2018, 04, 5));
    
    uploadSerializableToServer ('dg_add.php', officialInfo.serialize (), function (group) {});*/
}