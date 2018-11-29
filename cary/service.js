Cary.Service = function (period, param)
{
    this.period   = period;
    this.param    = param;
    this.instance = this;
    this.timer    = null;
};

Cary.Service.prototype.started = function ()
{
    return this.timer !== null;
};
    
Cary.Service.prototype.start = function (callIWorkerImmediately)
{
    if (Cary.tools.isNothing (callIWorkerImmediately))
        callIWorkerImmediately = false;
    
    if (this.timer === null)
    {
        var instance = this;
        
        this.timer = setInterval (function () 
                                  { 
                                      instance.worker (instance.param); 
                                  }, this.period);
        
        if (callIWorkerImmediately)
            this.worker (this.param);
    }
};

Cary.Service.prototype.stop = function ()
{
    if (this.timer !== null)
    {
        clearInterval (this.timer);
        
        this.timer = null;
    }
};

Cary.Service.prototype.worker = function ()
{    
};
