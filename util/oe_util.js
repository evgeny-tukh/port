function loadIconList (onLoad)
{
    Cary.tools.sendRequest ({ url: 'requests/icn_get_list.php', mathod: 'get', content: Cary.tools.contentTypes.plainText, onLoad: onLoad, resType: Cary.tools.resTypes.json });
}

function uploadIconToServer (data, onLoad)
{
    Cary.tools.sendRequest ({ method: Cary.tools.methods.post, content: Cary.tools.contentTypes.json, url: 'requests/icn_import.php', param: data, onLoad: onLoad,
                              resType: Cary.tools.resTypes.json });
}

function removeIconFromServer (data, onDone)
{
    Cary.tools.sendRequest ({ method: Cary.tools.methods.post, content: Cary.tools.contentTypes.json, url: 'requests/icn_del.php', param: data, onLoad: onDone,
                              resType: Cary.tools.resTypes.plain });
}

function renameIconOnServer (data, onLoad)
{
    Cary.tools.sendRequest ({ method: Cary.tools.methods.post, content: Cary.tools.contentTypes.json, url: 'requests/icn_rename.php', param: data, onLoad: onLoad,
                              resType: Cary.tools.resTypes.json });
}

function loadLayerList (onLoad)
{
    loadSerializable ('ol_get_list2.php', onLoad);
}

function getRouteList (onLoad)
{
    loadSerializable ('rte_layer_init.php', onLoad);
}

function uploadLayerToServer (data, onLoad)
{
    uploadSerializableToServer (/*'ol_add.php'*/'ol_save.php', data, onLoad);
}

function loadInfoArrayList (onLoad)
{
    loadSerializable ('ia_get_list.php', onLoad);
}

function loadUserArray (id, onLoad)
{
    loadSerializable ('ia_get.php?id=' + id.toString (), onLoad);
}

function saveUserArray (data, onLoad)
{
    uploadSerializableToServer ('ia_save.php', data, onLoad);
}

function uploadBinaryToServer (id, data, onLoad)
{
    var body;
    
    if (Cary.tools.isNothing (id))
        id = 0;
    
    body = 'id=' + encodeURIComponent (id) + '&data=' + encodeURIComponent (data);
    
    Cary.tools.sendRequest ({ method: Cary.tools.methods.post, content: Cary.tools.contentTypes.urlEncoded, url: 'requests/bin_save.php', param: body, onLoad: onLoad, 
                              resType: Cary.tools.resTypes.plain });
}

function loadBinaryFromServer (id, onLoad)
{
    Cary.tools.sendRequest ({ method: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText, url: 'requests/bin_load.php?id=' + id.toString (), onLoad: onLoad, 
                              resType: Cary.tools.resTypes.plain });
}
