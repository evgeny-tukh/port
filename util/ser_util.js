function loadSerializable (request, onLoad)
{
    Cary.tools.sendRequest ({ url: 'requests/' + request, method: 'get', content: Cary.tools.contentTypes.plainText, onLoad: onLoad, resType: Cary.tools.resTypes.json });
}

function uploadSerializableToServer (request, data, onLoad, responseType)
{
    if (Cary.tools.isNothing (responseType))
        responseType = Cary.tools.resTypes.json;
    
    Cary.tools.sendRequest ({ method: Cary.tools.methods.post, content: Cary.tools.contentTypes.json, url: 'requests/' + request, param: data, onLoad: onLoad, resType: responseType });
}
