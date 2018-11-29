function GraphWnd (parent, labels, values, options, callbacks)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var backgroundColor = 'backgroundColor' in options ? options.backgroundColor : 'white';
    var borderColor     = 'borderColor' in options ? options.borderColor : 'blue';
    var title           = 'title' in options ? options.title : '';
    var xLabel          = 'xLabel' in options ? options.xLabel : null;
    var yLabel          = 'yLabel' in options ? options.yLabel : null;
    
    this.callbacks   = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.config      = { type: 'line',
                         data: { labels: labels, datasets: [{ label: stringTable.wlLabel, backgroundColor: backgroundColor, borderColor: borderColor, data: values, fill: false }] },
                         options: { responsive: false, title: { display: false /*title !== null, text: title*/ }, tooltips: { mode: 'index', intersect: false },
				    hover: { mode: 'nearest', intersect: true },
				    scales: { xAxes: [{ display: true, scaleLabel: { display: options.xLabel !== null, labelString: xLabel } }],
                                              yAxes: [{ display: true, scaleLabel: { display: options.yLabel !== null, labelString: yLabel } }] } } };
    
    if (parent === null)
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, 
                          [{ position: { hcenter: true, vcenter: true, width: 800, height: 500, absolute: true }, 
                             title: title === null ? stringTable.graph : title, parent: parent, visible: true }]);
};

GraphWnd.prototype = Object.create (Cary.ui.Window.prototype);

GraphWnd.prototype.onInitialize = function ()
{
    var instance    = this;
    //var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var canvas      = document.createElement ('canvas');
    var ctx;
    var graph;
    
    canvas.id            = 'canvas';
    canvas.width         = 800;
    canvas.height        = 470;
    canvas.class         = 'chartjs-render-monitor';
    canvas.style.display = 'block';
    canvas.style.left    = '30px';
    canvas.style.width   = '800px';
    canvas.style.header  = '480px';
    
    this.client.appendChild (canvas);

    ctx   = canvas.getContext('2d');
    graph = new Chart (ctx, this.config);
    
    //new Cary.ui.Button ({ text: 'Close', parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, {});

    /*function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }*/
};

