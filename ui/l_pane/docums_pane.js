function DocumentsPane (parent, callbacks, options)
{
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    ConfigurablePane.apply (this, [parent, stringTable.docums, { top: 5, left: 5, right: 5, height: options.height, absolute: true }, this.callbacks]);
    //Cary.ui.Window.apply (this, 
    //                     [{ position: { top: 5, left: 5, right: 5, height: options.height, absolute: true }, 
    //                      parent: parent, paneMode: true, title: 'Documents', parent: parent, visible: true }]);
}

//DocumentsPane.prototype = Object.create (Cary.ui.Window.prototype);
DocumentsPane.prototype = Object.create (ConfigurablePane.prototype);

DocumentsPane.prototype.onInitialize = function ()
{
    ConfigurablePane.prototype.onInitialize.apply (this, arguments);
    
    var instance = this;
    var docums   = new Cary.ui.TreeView ({ parent: this.wnd, left: 5, top: 5, width: 200, height: '100%', visible: true, autoSelect: true, onItemClick: onItemClick });
    /*var buttons  = new Cary.ui.ControlBlock ({ parent: this.wnd, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var addMenu  = [{ text: 'Group', action: onAddGroup }, { text: 'Document', action: onAddDocument }];
    var butStyle = { width: 'fit-content', height: 25, padding: 5, float: 'right', 'padding-left': 5, 'padding-right': 5 };

    new Cary.ui.PopUpButton ({ text: 'New', parent: buttons.htmlObject, visible: true, popupMenu: addMenu, menuWidth: 100, anchorType: (Cary.ui.anchor.BOTTOM | Cary.ui.anchor.LEFT) },
                             { width: 60, height: 25, float: 'right', padding: 0, 'padding-top': 0, 'padding-bottom': 0, 'line-height': 5 });
    new Cary.ui.Button ({ text: 'Remove', parent: buttons.htmlObject, visible: true, onClick: onRemove }, butStyle);
    new Cary.ui.Button ({ text: 'Save', parent: buttons.htmlObject, visible: true, onClick: onSave }, butStyle);*/
    
    officialInfo.item = null;
    
    officialInfo.enumSubGroups (addSubGroup, officialInfo);
    officialInfo.enumDocuments (addDocument, officialInfo);
    
    /*docums.addItem (null, 'Общая информация', 'http://www.pasp.ru/passazhirskiy_port1');
    docums.addItem (null, 'Bylaws of the seaport "Passenger port of St.Petersburg"', 'http://www.pasp.ru/bylaws_of_the_seaport_of_passeng');
    docums.addItem (null, 'Соответствие морского терминала требованиям главы XI-2 МК СОЛАС-74 и Международного кодекса по охране судов и портовых средств', 'http://www.pasp.ru/d/26909/d/pp_spb_informaciya_o_morskih_terminalah_imeyuschih_dokumenty_v_sootvetstvii_s_trebovaniyami_mk_osps.doc');
    docums.addItem (null, 'Об утверждении обязательных постановлений в морском порту "Пассажирский порт Санкт-Петербург"', 'http://www.pasp.ru/obyazatelnye_postanovleniya2#P28');
    
    var orders = docums.addItem (null, 'Port capain orders');
    
    docums.addItem (orders, 'О плавании судов по акватории морского порта "Пассажирский порт Санкт-Петербург"', 'http://www.pasp.ru/d/26909/d/1932-2016_ot_23_11_2016_inf__pass__port_zapret_zabr__petrovskiy.pdf');
    docums.addItem (orders, 'Об установлении допустимых осадок судов на каналах, фарватерах и у причалов на акватории морского порта "Большой порт Санкт-Петербург"', 'http://www.pasp.ru/d/26909/d/38-kp_ot_07.05.2018_osadki_uch.3_nab._1.pdf');*/
    
    function addSubGroup (group)
    {
        group.item = docums.addItem (this.item, group.name);
        
        group.enumSubGroups (addSubGroup, group);
        group.enumDocuments (addDocument, group);
    }
    
    function addDocument (document)
    {
        docums.addItem (this.item, document.name, document.link);
    }
    
    function onSave ()
    {
        
    }
    
    function onRemove ()
    {
        
    }
    
    function onAddDocument ()
    {
    }
    
    function onAddGroup ()
    {
    }
    function onItemClick (item)
    {
        if (item.data !== null)
            new Cary.ui.BrowserWnd (null, { link: item.data, width: 1000 });
    }
};
