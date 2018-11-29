Cary.ui.TreeView = function (desc, styles)
{
    this.rootItem     = { tree: this, text: null, data: null, parent: null, subItems: [], expanded: false, itemObject: null, subItemListObject: null, level: 0 };
    this.selectedItem = null;
    this.indent       = 'indent' in desc ? desc.indent : 15;
    this.autoSelect   = 'autoSelect' in desc ? desc.autoSelect : false;
    
    Cary.ui.Control.apply (this, arguments);
};

Cary.ui.TreeView.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.TreeView.prototype.initialize = function ()
{
    this.htmlObject   = document.createElement ('div');
    this.rootItemList = document.createElement ('ul');

    this.htmlObject.className  = 'treeView';

    this.rootItem.subItemListObject = this.rootItemList;

    this.htmlObject.appendChild (this.rootItemList);

    Cary.ui.Control.prototype.initialize.apply (this);
    
    this.drawChildren (this.rootItem);
};
    
Cary.ui.TreeView.prototype.getRootItem = function ()
{
    return rootItem;
};
    
Cary.ui.TreeView.prototype.enumChildItems = function (item, callback)
{
    if ('subItems' in item && item.subItems !== null)
        item.subItems.forEach (callback);
};
    
Cary.ui.TreeView.prototype.collapseAllItems = function (item)
{
    var instance = this;
    
    if (Cary.tools.isNothing (item))
        item = this.rootItem;

    item.subItems.forEach (function (subItem)
                           {
                               instance.collapseItem (subItem);
                               instance.collapseAllItems (subItem);
                           });
};
    
Cary.ui.TreeView.prototype.setItemText = function (item, text)
{
    item.text                 = text;
    item.itemObject.innerHTML = text;
};
    
Cary.ui.TreeView.prototype.setItemData = function (item, data)
{
    item.data = data;
};
    
Cary.ui.TreeView.prototype.addItem = function (parentItem, text, data)
{
    var instance = this;
        
    if (parentItem === null)
        parentItem = this.rootItem;

    var subItemListObject = document.createElement ('ul');
    var itemObject        = document.createElement ('li');
    var item              = { tree: this.rootItem.tree, text: text, data: data, parent: parentItem, subItems: [], expanded: false, itemObject: itemObject, 
                              subItemListObject: subItemListObject, level: parentItem.level + 1 };

    itemObject.className  = 'tvItem';
    itemObject.innerHTML  = text;
    itemObject.onclick    = function (event) { Cary.ui.TreeView.prototype.onItemClick.apply (instance, [event]) };
    itemObject.ondblclick = function (event) { Cary.ui.TreeView.prototype.onItemDblClick.apply (instance, [event]); };

    if (this.autoSelect)
        itemObject.onmousemove = function (event) { Cary.ui.TreeView.prototype.onItemMouseMove.apply (instance, [event]); };
    
    subItemListObject.className        = 'tvSubItem';
    subItemListObject.style.marginLeft = Cary.tools.int2pix (this.indent);

    if (!Array.isArray (parentItem.subItems))
        parentItem.subItems = [];

    parentItem.subItems [parentItem.subItems.length] = item;

    this.collapseItem (parentItem);
    this.expandItem (parentItem);

    return item;
};
    
Cary.ui.TreeView.prototype.collapseItem = function (item)
{
    if (item.expanded)
    {
        if (item.parent !== null && item.parent.subItemListObject !== null)
            item.parent.subItemListObject.removeChild (item.subItemListObject);

        while (item.subItemListObject.children.length > 0)
            item.subItemListObject.removeChild (item.subItemListObject.children [0]);

        if (item.itemObject !== null)
            item.itemObject.style.listStyleImage = 'url(res/rgt_arr.png)';

        item.expanded = false;
    }
};
    
Cary.ui.TreeView.prototype.expandItem = function (item)
{
    if (!item.expanded && Array.isArray (item.subItems))
    {
        var subItem;
        var subItemObject;
        var subItemSubItemList;
        var i;

        if (item.parent !== null && item.parent.subItemListObject !== null)
            Cary.tools.insertChildAfter (item.parent.subItemListObject, item.subItemListObject, item.itemObject);

        for (i = 0; i < item.subItems.length; ++ i)
        {
            subItem            = item.subItems [i];
            subItemObject      = subItem.itemObject;
            subItemSubItemList = subItem.subItemListObject;

            item.subItemListObject.appendChild (subItemObject);

            if (subItem.subItems.length > 0)
            {
                subItem.expanded = subItemSubItemList.children.length > 0;

                subItemObject.style.listStyleImage = subItem.expanded ? 'url(res/dn_arr.png)' : 'url(res/rgt_arr.png)';
                subItemObject.style.listStyleType  = 'none';
            }
            else
            {
                subItemObject.style.listStyleImage = 'none';
                subItemObject.style.listStyleType  = 'none';
            }

            item.subItemListObject.appendChild (subItemSubItemList);
        }

        item.expanded = true;

        if (item.itemObject !== null)
            item.itemObject.style.listStyleImage = 'url(res/dn_arr.png)';
    }
};
    
Cary.ui.TreeView.prototype.deleteItem = function (item)
{
    var i;

    // Remove html elements
    if (item.itemObject !== null)
        item.parent.subItemListObject.removeChild (item.itemObject);

    if (item.subItemListObject !== null)
        item.parent.subItemListObject.removeChild (item.subItemListObject);

    for (i = 0; i < item.parent.subItems.length; ++ i)
    {
       if (item.parent.subItems [i] === item)
       {
           item.parent.subItems.splice (i, 1); break;
       }
    }
};

Cary.ui.TreeView.prototype.deleteAllItems = function ()
{
    while (this.rootItem.subItems.length > 0)
        this.deleteItem (this.rootItem.subItems [0]);
};
    
Cary.ui.TreeView.prototype.drawChildren = function (item)
{
    var list;

    if (item.subItemListObject === null)
    {
        list = document.createElement ('ul');

        item.parent.subItemListObject.appendChild (list);
    }
    else
    {
        list = item.subItemListObject;
    }

    list.className        = 'tvItem';
    list.style.marginLeft = Cary.tools.int2pix (this.indent);

    if (Array.isArray (item.subItems))
    {
        var subItem;
        var itemObject;
        var i;

        for (i = 0; i < item.subItems.length; ++ i)
        {
            subItem    = item.subItems [i];
            itemObject = document.createElement ('li');

            if (!isArray (subItem.subItems))
            {
                itemObject.style.listStyleImage = 'none';
            }
            else if (subItem.expanded)
            {
                itemObject.style.listStyleImage = 'url(res/dn_arr.png)';

                this.drawChildren (subItem, list);
            }
            else
            {
                itemObject.style.listStyleImage = 'url(res/rgt_arr.png)';
            }

            itemObject.style.textAlign = 'left';
            itemObject.innerHTML       = subItem.text;

            subItem.itemObject = itemObject;

            list.appendChild (itemObject);
        }
    }
};
    
Cary.ui.TreeView.prototype.findItemByObject = function (parentItem, object)
{
    var item,
        i;

    for (i = 0; i < parentItem.subItems.length; ++ i)
    {
        if (parentItem.subItems [i].itemObject === object)
            return parentItem.subItems [i];

        item = this.findItemByObject (parentItem.subItems [i], object);

        if (item !== null)
            return item;
    }

    return null;
};

Cary.ui.TreeView.prototype.getSelectedItem = function ()
{
    return this.selectedItem;
};

Cary.ui.TreeView.prototype.selectItem = function (item)
{
    if (this.selectedItem !== null)
        this.selectedItem.itemObject.className = 'tvItem';

    this.selectedItem = item;

    if (item !== null)
        item.itemObject.className = 'tvSelectedItem';
};
    
Cary.ui.TreeView.prototype.onItemMouseMove = function (event)
{
    var item;
    
    if (Cary.tools.isNothing (event))
        event = window.event;

    item = this.findItemByObject (this.rootItem, event.target);

    item.tree.selectItem (item);            
};
    
Cary.ui.TreeView.prototype.onItemClick = function (event)
{
    var item;
    
    if (Cary.tools.isNothing (event))
        event = window.event;

    item = this.findItemByObject (this.rootItem, event.target);

    if (event.offsetX > 0)
    {
        item.tree.selectItem (item);

        if ('onItemClick' in this.desc && this.desc.onItemClick)
            this.desc.onItemClick (item);
    }
    else
    {
        if (item !== null && item.subItems.length > 0)
        {
            if (item.expanded)
                item.tree.collapseItem (item);
            else
                item.tree.expandItem (item);
        }
    }
};
    
Cary.ui.TreeView.prototype.onItemDblClick = function (event)
{
    var item;
    
    if (Cary.tools.isNothing (event))
        event = window.event;

    item = this.findItemByObject (this.rootItem, event.target);

    if (item !== null && 'onDblClick' in item)
        item.onDblClick (item);
}    ;
