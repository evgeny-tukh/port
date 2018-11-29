<?php
    require_once 'session/session_mgr.php';
    
    $sessionMgr = new SessionManager ();

    if (!$sessionMgr->isAuthenticated () || $sessionMgr->isSessionExpired ())
    {
        include ('login.html');
        
        echo "Logged out";
    }
    else
    {
        $sessionMgr->setAccessTime ();
        
        echo "OK";
    }
