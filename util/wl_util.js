function getWaterLevelMeterRelativeLevel (deviceID, timestamp, onLoad)
{
    var url = 'requests/wl/get_wl.php?id=' + deviceID + '&l=1';
    
    if (!Cary.tools.isNothing (timestamp))
        url += '&e=' + timestamp / 1000;
    
    Cary.tools.sendRequest ({ url: url, method: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText, resType: Cary.tools.resTypes.json, onLoad: onLoad });
}