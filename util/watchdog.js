SessionWatchdog.THRESHOLD = 300;

function SessionWatchdog ()
{
    Cary.tools.sendRequest ({ url: 'prolongate.php', method: 'get', content: Cary.tools.contentTypes.plainText, onLoad: onLoaded, resType: Cary.tools.resTypes.plain });
    
    function onLoaded (response)
    {
        if (response === 'OK')
        {
            var timer     = setInterval (function () { checkIdleState (); }, 1000);
            var idleCount = 0;

            document.onmousemove = function () { idleCount = 0; };

            function checkIdleState ()
            {
                if ((++ idleCount) > SessionWatchdog.THRESHOLD)
                {
                    idleCount = 0;

                    clearInterval (timer);

                    Cary.tools.sendRequest ({ url: 'logout.php', method: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText });

                    window.location = 'login.html';
                }
            }
        }
    }
}

