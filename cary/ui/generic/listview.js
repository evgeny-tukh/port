Cary.ui.ListView = function (desc, styles)
{
    this.items         = [];
    this.columnHeaders = [];
    this.selection     = -1;
    this.itemOffset    = 'itemOffset' in desc ? desc.itemOffset : null;
    
    Cary.ui.Control.apply (this, arguments);
};

Cary.ui.ListView.prototype = Object.create (Cary.ui.Control.prototype);

Cary.ui.ListView.prototype.initialize = function ()
{
    var columnHeader;
    var i;
    var x;
    
    //Cary.ui.ListView.prototype.initialize.apply (this);
    
    this.htmlObject = document.createElement ('div');
    this.header     = document.createElement ('div');
    this.client     = document.createElement ('div');

    this.htmlObject.className = 'listView';
    this.header.className     = 'listViewHeader';
    this.client.className     = 'listViewClient';
    
    this.htmlObject.appendChild (this.header);
    this.htmlObject.appendChild (this.client);

    Cary.ui.Control.prototype.initialize.apply (this, arguments);

    for (i = 0, x = 1; i < this.desc.columns.length; ++ i)
    {
        var columnDesc = this.desc.columns [i];
        
        columnHeader = document.createElement ('div');
        
        columnHeader.className   = 'listViewColumnHeader';
        columnHeader.style.width = Cary.tools.int2pix (columnDesc.width);
        
        if ('headerLineHeight' in this.desc)
            columnHeader.style.lineHeight = Cary.tools.int2pix (this.desc.headerLineHeight);
        
        if ('htmlTitle' in columnDesc)
            columnHeader.innerHTML = columnDesc.htmlTitle;
        else if ('title' in columnDesc)
            columnHeader.innerText = columnDesc.title;
        //columnHeader.style.left  = Cary.tools.int2pix (x);
        
        if ('align' in columnDesc)
            columnHeader.style.textAlign = columnDesc.align;
        
        if ('onHeaderClick' in columnDesc)
            columnHeader.onclick = columnDesc.onHeaderClick;
        
        x += (columnDesc.width + 8);
        
        this.header.appendChild (columnHeader);
        
        this.columnHeaders.push (this.columnHeaders);
    }
    
    //this.client.style.top = Cary.tools.int2pix (this.header.offsetHeight);
};

Cary.ui.ListView.prototype.reverseItems = function ()
{
    var i;

    for (i = this.items.length - 1; i >= 0; -- i)
        this.client.removeChild (this.items [i].itemDiv);

    this.items.reverse ();

    for (i = 0; i < this.items.length; ++ i)
    {
        this.items [i].itemDiv.style.top = int2pix (i * 23 - 2);

        this.client.appendChild (this.items [i].itemDiv);
    }

    if (this.selection >= 0)
        this.selectItem (items.length - this.selection - 1);
};

Cary.ui.ListView.prototype.removeAllFrom = function (startIndex)
{
    var i;

    for (i = startIndex; i < this.items.length; ++ i)
        this.client.removeChild (this.items [i].itemDiv);

    this.items.splice (startIndex, 0xffffffff);
};
    
Cary.ui.ListView.prototype.addItem = function (columnText, data)
{
    return this.insertItem (columnText, data);
};

Cary.ui.ListView.prototype.setItemImage = function (item, column, imageSource, maxWidth, maxHeight)
{
    var image = document.createElement ('img');
    var i;
    
    image.src             = imageSource;
    image.style.overflowX = 'hidden';
    image.style.overflowY = 'hidden';
    image.style.margin    = '0px';
    image.style.padding   = '0px';
    
    if (Cary.tools.isNothing (maxWidth))
        maxWidth = this.desc.columns [column].width;
    
    if (Cary.tools.isNothing (maxHeight))
        maxHeight = item.itemColumns [column].offsetHeight;
    
    // Zoom out when needed
    if (image.naturalWidth > maxWidth || image.naturalHeight > maxHeight)
    {
        var ratioX = maxWidth / image.naturalWidth;
        var ratioY = maxHeight / image.naturalHeight;
        var ratio  = Math.min (ratioX, ratioY);
        
        image.style.width  = Cary.tools.int2pix (Math.round (image.naturalWidth * ratio));
        image.style.height = Cary.tools.int2pix (Math.round (image.naturalHeight * ratio));
    }
    
    item.itemColumns [column].appendChild (image);
};

Cary.ui.ListView.prototype.insertItem = function (columnText, data, index)
{
    var itemDiv;
    var itemColumns = [];
    var itemColumnDiv;
    var item;
    var i;
    var instance = this;
    var maxHeight;

    if (this.client.style.top === null || this.client.style.top === '')
    {
        var headerHeight = this.itemOffset ? this.itemOffset : (this.header.offsetHeight ? this.header.offsetHeight : 25);
        
        this.client.style.top = Cary.tools.int2pix (headerHeight);
        
        if ('height' in this.styles && typeof (this.styles.height) === 'number')
            this.client.style.height = Cary.tools.int2pix (this.styles.height - headerHeight);
    }
    
    itemDiv = document.createElement ('div');

    if (!Cary.tools.isNothing (this.desc.onItemHover))
        itemDiv.onmouseover = function (event)
                              {
                                  var i, index;
                                  
                                  for (i = 0, index = -1; i < instance.items.length; ++ i)
                                  {
                                      if (instance.items [i].itemDiv === this)
                                      {
                                          index = i; break;
                                      }
                                  }
                                  
                                  if (index >= 0)
                                      instance.desc.onItemHover (index, instance.items [index], event);
                              };
    
    itemDiv.className = 'listViewItem';

    if (Cary.tools.isNothing (index) || index < 0 || index >= this.items.length)
    {
        this.client.appendChild (itemDiv);
    }
    else
    {
        this.client.insertBefore (itemDiv, this.items [index].itemDiv);
    }

    for (i = maxHeight = 0, x = 3; i < this.desc.columns.length; ++ i)
    {
        itemColumnDiv = document.createElement ('div');

        itemColumnDiv.className   = 'listViewItemColumn';
        itemColumnDiv.style.width = Cary.tools.int2pix (this.desc.columns [i].width);
        itemColumnDiv.innerText   = i < columnText.length ? columnText [i] : '';
        itemColumnDiv.onclick     = function (event) { instance.onClickItem (event, this); };
        itemColumnDiv.ondblclick  = function (event) { instance.onDblClickItem (event, this); };

        if ('align' in this.desc.columns [i])
            itemColumnDiv.style.textAlign = this.desc.columns [i].align;
        
        // Prevent "empty" subitem
        if (itemColumnDiv.innerText === '' || itemColumnDiv.innerText === null)
        {
            itemColumnDiv.innerText   = '*';
            itemColumnDiv.style.color = 'transparent';
        }
        
        x += (this.desc.columns [i].width + 8);

        itemDiv.appendChild (itemColumnDiv);

        itemColumns.push (itemColumnDiv);
        
        if (itemColumnDiv.clientHeight > maxHeight)
            maxHeight = itemColumnDiv.clientHeight;
    }

    // Extend height of subitems that are less high than maxHeight
    itemColumns.forEach (function (itemColumn)
                         {
                             //if (itemColumn.clientHeight < maxHeight)
                                 itemColumn.style.height = Cary.tools.int2pix (maxHeight - 4);
                         });
    
    item = { itemDiv: itemDiv, itemColumns: itemColumns, data: data };

    if (Cary.tools.isNothing (index) || index < 0 || index >= this.items.length)
        this.items.push (item);
    else
        this.items.splice (index, 0, item);

    return item;
};

Cary.ui.ListView.prototype.selectItem = function (index)
{
    if (index < 0)
    {
        var i, j;

        this.selection = -1;

        for (i = 0; i < this.items.length; ++ i)
        {
            for (j = 0; j < this.items [i].itemColumns.length; ++ j)
                this.items [i].itemColumns [j].className = 'listViewItemColumn';
        }
    }
    else if (index < this.items.length)
    {
        var i, j;

        this.selection = index;

        if (this.items [index].itemDiv.offsetTop < this.client.scrollTop)
            this.client.scrollTop = this.items [index].itemDiv.offsetTop;
        else if (this.items [index].itemDiv.offsetTop > (this.client.scrollTop + this.client.offsetHeight))
            this.client.scrollTop = this.items [index].itemDiv.offsetTop;

        for (i = 0; i < this.items.length; ++ i)
        {
            for (j = 0; j < this.items [i].itemColumns.length; ++ j)
                this.items [i].itemColumns [j].className = (i === index) ? 'listViewItemColumnSelected' : 'listViewItemColumn';
        }

        if (!Cary.tools.isNothing (this.desc.onSelect))
            this.desc.onSelect (index, this.items [index].data);
    }
};

Cary.ui.ListView.prototype.onClickItem = function (event, itemDiv)
{
    var i, j;

    for (i = 0; i < this.items.length; ++ i)
    {
        for (j = 0; j < this.items [i].itemColumns.length; ++ j)
        {
            if (this.items [i].itemColumns [j] === itemDiv)
            {
                this.selectItem (i);

                if (!Cary.tools.isNothing (this.desc.columns [j].onItemClick))
                    this.desc.columns [j].onItemClick (i, j, this.items [i]);

                return;
            }
        }
    }
};

Cary.ui.ListView.prototype.onDblClickItem = function (event, itemDiv)
{
    var i, j;

    for (i = 0; i < this.items.length; ++ i)
    {
        for (j = 0; j < this.items [i].itemColumns.length; ++ j)
        {
            if (this.items [i].itemColumns [j] === itemDiv)
            {
                this.selectItem (i);

                if (!Cary.tools.isNothing (this.desc.columns [j].onItemDblClick))
                    this.desc.columns [j].onItemDblClick (i, j, this.items [i]);

                return;
            }
        }
    }
};

Cary.ui.ListView.prototype.scrollToBottom = function ()
{
    this.client.scrollTop = this.client.scrollHeight;
};
 
Cary.ui.ListView.prototype.getItemCount = function ()
{
    return this.items.length;
};

Cary.ui.ListView.prototype.setItemText = function (itemIndex, columnIndex, text)
{
    this.items [itemIndex].itemColumns [columnIndex].innerText = text;
    
    if (text !== null && text !== '' && this.items [itemIndex].itemColumns [columnIndex].style.color === 'transparent')
        this.items [itemIndex].itemColumns [columnIndex].style.color = null;
};

Cary.ui.ListView.prototype.getItemText = function (itemIndex, columnIndex)
{
    return this.items [itemIndex].itemColumns [columnIndex].innerText;
};

Cary.ui.ListView.prototype.getItemData = function (itemIndex)
{
    return this.items [itemIndex].data;
};

Cary.ui.ListView.prototype.setItemData = function (itemIndex, data)
{
    this.items [itemIndex].data = data;
};

Cary.ui.ListView.prototype.enumItems = function (callback)
{
    this.items.forEach (function (item) { callback (item); });
};

Cary.ui.ListView.prototype.getSelectedItem = function ()
{
    return this.selection;
};

Cary.ui.ListView.prototype.removeAllItems = function ()
{
    this.items = [];

    while (this.client.firstChild)
        this.client.removeChild (this.client.firstChild);
};

Cary.ui.ListView.prototype.removeItem = function (index)
{
    if (index >= 0 && index < this.items.length)
    {
        var i;

        for (i = 0; i < this.items [index].itemColumns.length; ++ i)
            this.items [index].itemDiv.removeChild (this.items [index].itemColumns [i]);

        this.client.removeChild (this.items [index].itemDiv);

        this.items.splice (index, 1);

        for (i = index; i < this.items.length; ++ i)
            this.items [i].itemDiv.style.top = Cary.tools.int2pix (i * 23 - 2);
        
        this.selection = -1;
    }
};

Cary.ui.ListView.prototype.setWidth = function (width)
{
    this.htmlObject.style.width  = Cary.tools.int2pix (width);
    this.htmlObject.style.header = Cary.tools.int2pix (width);
    this.htmlObject.style.client = Cary.tools.int2pix (width);
};
    
