<?php
    require_once 'session/session_mgr.php';
    
    $sessionMgr = new SessionManager ();

    $curTime = time ();
    
    if (!$sessionMgr->isAuthenticated () || $sessionMgr->isSessionExpired ())
    {
        include ('login.html');
    }
    else
    {
        $sessionMgr->setAccessTime ();
        
        $features = $sessionMgr->getUserFeatures ();
        ?>
            <!DOCTYPE html>
            <!--
            To change this license header, choose License Headers in Project Properties.
            To change this template file, choose Tools | Templates
            and open the template in the editor.
            -->
            <html>
                <head>
                    <title>Порт Санкт-Петербург</title>
                    <meta charset="utf8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="main.css"/>
                    <link rel="stylesheet" href="cary/styles.css"/>
                    <link rel="stylesheet" href="cary/classic.css"/>
                    <link rel="stylesheet" href="cary/ui/generic/calendar.css"/>
                    <style type="text/css">
                        /* Chart.js */
                        @-webkit-keyframes chartjs-render-animation{from{opacity:0.99}to{opacity:1}}@keyframes chartjs-render-animation{from{opacity:0.99}to{opacity:1}}.chartjs-render-monitor{-webkit-animation:chartjs-render-animation 0.001s;animation:chartjs-render-animation 0.001s;}
                    </style>
                    <script>
                        <?php
                            $indent     = str_repeat (' ', 16);
                            $initialLat = SessionManager::getVariable ('initLat');
                            $initialLon = SessionManager::getVariable ('initLon');

                            if (!$initialLat || !$initialLon)
                            {
                                $initialLat = 'null';
                                $initialLon = 'null';
                            }

                            echo $indent."var initialPos = { lat: $initialLat, lon: $initialLon };\n";
                        ?>
                    </script>
                    <script src="https://maps.googleapis.com/maps/api/js?libraries=geometry&key=AIzaSyCsZWmFuiHNNNIh5GSgkz6bhJuWhbtk21g"></script>
                    <!-- <script src="gmo/main.js"></script>
                    <script src="gmo/common.js"></script>
                    <script src="gmo/map.js"></script>
                    <script src="gmo/poly.js"></script>
                    <script src="gmo/util.js"></script>
                    <script src="gmo/onion.js"></script>
                    <script src="gmo/stats.js"></script>
                    <script src="gmo/controls.js"></script> -->
                    <script src="chart.js/Chart.bundle.js"></script>
                    <script src="lz-string/lz-string.js"></script>
                    <script src="main.js"></script>
                    <script src="custom.js"></script>
                    <script src="cary/cary.js"></script>
                    <script src="cary/tools.js"></script>
                    <script src="cary/service.js"></script>
                    <script src="cary/geo.js"></script>
                    <script src="cary/geo_util.js"></script>
                    <script src="cary/gm/maps.js"></script>
                    <script src="cary/gm/map_controls.js"></script>
                    <script src="cary/gm/mf_balloon.js"></script>
                    <script src="cary/gm/map_locker.js"></script>
                    <script src="cary/gm/pos_indicator.js"></script>
                    <script src="cary/gm/img_button.js"></script>
                    <script src="cary/gm/brg_rgn_tag.js"></script>
                    <script src="cary/gm/gm_panel.js"></script>
                    <script src="cary/gm/map_menu.js"></script>
                    <script src="cary/gm/drawers/gen_drawer.js"></script>
                    <script src="cary/gm/drawers/polyline_drawer.js"></script>
                    <script src="cary/gm/drawers/polygon_drawer.js"></script>
                    <script src="cary/gm/drawers/icon_drawer.js"></script>
                    <script src="cary/gm/drawers/circle_drawer.js"></script>
                    <script src="cary/gm/drawers/icon_grp_drawer.js"></script>
                    <script src="cary/usr_obj/gen_obj.js"></script>
                    <script src="cary/usr_obj/multi_pt_obj.js"></script>
                    <script src="cary/usr_obj/usr_pln.js"></script>
                    <script src="cary/usr_obj/usr_plg.js"></script>
                    <script src="cary/usr_obj/usr_icn.js"></script>
                    <script src="cary/usr_obj/usr_icn_grp.js"></script>
                    <script src="cary/usr_obj/usr_circle.js"></script>
                    <script src="cary/ui/generic/wnd.js"></script>
                    <script src="cary/ui/generic/gen_ctl.js"></script>
                    <script src="cary/ui/generic/buttons.js"></script>
                    <script src="cary/ui/generic/editbox.js"></script>
                    <script src="cary/ui/generic/slider.js"></script>
                    <script src="cary/ui/generic/treeview.js"></script>
                    <script src="cary/ui/generic/listview.js"></script>
                    <script src="cary/ui/generic/listbox.js"></script>
                    <script src="cary/ui/generic/browser.js"></script>
                    <script src="cary/ui/generic/browsebox.js"></script>
                    <script src="cary/ui/generic/checkbox.js"></script>
                    <script src="cary/ui/generic/details.js"></script>
                    <script src="cary/ui/generic/calendar.js"></script>
                    <script src="cary/ui/generic/datehourbox2.js"></script>
                    <script src="cary/ui/generic/flashing_img.js"></script>
                    <script src="cary/ui/dlg/coord_edit.js"></script>
                    <script src="cary/ui/dlg/pos_edit.js"></script>
                    <script src="cary/ui/dlg/usr_pln_props.js"></script>
                    <script src="cary/ui/dlg/usr_plg_props.js"></script>
                    <script src="cary/ui/dlg/msg_box.js"></script>
                    <script src="cary/ui/dlg/browser_wnd.js "></script>
                    <script src="custom_obj/custom_obj.js"></script>
                    <script src="custom_obj/upd_list.js"></script>
                    <script src="custom_obj/wl_marker.js"></script>
                    <script src="custom_obj/nav_cnt.js"></script>
                    <script src="custom_obj/route_obj.js"></script>
                    <script src="ui/ln_pl_pane.js"></script>
                    <script src="ui/timeline_pane.js"></script>
                    <script src="ui/side_pane.js"></script>
                    <script src="ui/uo_load.js"></script>
                    <script src="ui/icn_select.js"></script>
                    <script src="ui/depth_cnt_props.js"></script>
                    <script src="ui/route_props.js"></script>
                    <script src="ui/nav_cnt_props.js"></script>
                    <script src="ui/bridge_props.js"></script>
                    <script src="ui/icn_imp_wnd.js"></script>
                    <script src="ui/ui_list_wnd.js"></script>
                    <script src="ui/obj_att_wnd.js"></script>
                    <script src="ui/obj_prop_change_wnd.js"></script>
                    <script src="ui/upd_hist_wnd.js"></script>
                    <script src="ui/graph_wnd.js"></script>
                    <script src="ui/usr_icons_wnd.js"></script>
                    <script src="ui/wl_marker_props.js"></script>
                    <script src="ui/wpt_prop_wnd.js"></script>
                    <script src="ui/l_pane/of_info_pane.js"></script>
                    <script src="ui/l_pane/depth_areas_pane.js"></script>
                    <script src="ui/l_pane/docums_pane.js"></script>
                    <script src="ui/r_pane/obj_edit_pane.js"></script>
                    <script src="ui/r_pane/usr_layers_pane.js"></script>
                    <script src="ui/r_pane/usr_icons_pane.js"></script>
                    <script src="ui/r_pane/usr_layer_edit.js"></script>
                    <script src="ui/r_pane/more_info_pane.js"></script>
                    <script src="ui/r_pane/closeable_pane.js"></script>
                    <script src="ui/r_pane/wl_pane.js"></script>
                    <script src="ui/r_pane/rte_pane.js"></script>
                    <script src="ui/route_props.js"></script>
                    <script src="custom_obj/generic.js"></script>
                    <!-- <script src="custom_obj/berth.js"></script> -->
                    <script src="custom_obj/depth_cnt.js"></script>
                    <script src="custom_obj/bridge.js"></script>
                    <script src="custom_obj/drawers/alrtbl_cnt_drawer.js"></script>
                    <script src="custom_obj/drawers/dpt_cnt_drawer.js"></script>
                    <script src="custom_obj/drawers/bridge_cnt_drawer.js"></script>
                    <script src="custom_obj/drawers/wl_marker_drawer.js"></script>
                    <script src="custom_obj/drawers/nav_cnt_drawer.js"></script>
                    <script src="custom_obj/drawers/route_drawer.js"></script>
                    <script src="util/oe_util.js"></script>
                    <script src="util/wl_util.js"></script>
                    <script src="util/ser_util.js"></script>
                    <script src="util/watchdog.js"></script>
                    <script src="docs/doc_tree.js"></script>
                    <script src="strings.js"></script>
                    <script src="ais.js"></script>
                    <script src="simulation.js"></script>
                </head>
                <body onload="init ();">
                    <div id="leftPane" class="infoPanel leftOriented">
                        Map control
                        <!--
                        <div class="labeledData">
                            Base map:
                            <select id="baseMap" class="combo" onchange="selectMapType (this.selectedIndex);">
                            </select>
                        </div>
                        <div class="labeledData">
                            OpenSea
                            <input id="osm" class="switch" type="checkbox" onchange="showOverlay (0, this.checked);" />
                        </div>
                        <div class="labeledData">
                            OpenWeater, temperature
                            <input id="oswt" class="switch" type="checkbox" onchange="showOverlay (1, this.checked);" />
                        </div>
                        <div class="labeledData">
                            OpenWeater, precipitation
                            <input id="oswp" class="switch" type="checkbox" onchange="showOverlay (2, this.checked);" />
                        </div>
                        <div class="labeledData">
                            OpenWeater, wind
                            <input id="osww" class="switch" type="checkbox" onchange="showOverlay (3, this.checked);" />
                        </div>
                        <div class="labeledData">
                            OpenWeater, pressure
                            <input id="oswpr" class="switch" type="checkbox" onchange="showOverlay (4, this.checked);" />
                        </div>
                        <div class="labeledData">
                            OpenWeater, clouds
                            <input id="oswc" class="switch" type="checkbox" onchange="showOverlay (5, this.checked);" />
                        </div>
                        -->
                    </div>
                    <div id="rightPane" class="infoPanel rightOriented">Right pane</div>
                    <div id="map" class="panel map">Map pane</div>
                </body>
            </html>
        <?php
    }
?>