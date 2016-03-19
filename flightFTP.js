define(function(require, exports, module)
{
    main.consumes = ["Plugin", "tree", "ui", "menus", "fs"];
    main.provides = ["flightFTP"];
    return main;

    function main(options, imports, register)
    {
        var Plugin = imports.Plugin;
        var menus = imports.menus;
        var tree = imports.tree;
        var ui = imports.ui;
        var fs = imports.fs;
        
        /***** Initialization *****/
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        var emit = plugin.getEmitter();
        
        function load(){}
        
        var passengers = [];
        var flightTakeoffItem = new ui.item(
        {
                caption: "Flight - Takeoff",
                isAvailable:function(editor)
                {
                    var tempSelect = tree.selection;
                    for(var a in tempSelect) if(tempSelect[a].indexOf("~/mounts/")!=-1) return false;
                    return true;
                },
                onclick:flightTakeoff
        });
        
        function flightTakeoff()
        {
            passengers = tree.selectedNodes;
            console.log(passengers[0]);
        }
        
        var flightLandingItem = new ui.item(
        {
                caption:"Flight - Landing",
                isAvailable:function(editor)
                {
                    var tempSelect = tree.getSelectedFolder().path;
                    if(tempSelect.indexOf("~/mounts/")==-1) return false;
                    return (passengers.length > 0);
                },
                onclick:flightLanding
        });
            
        function flightLanding()
        {
            var destination = tree.selectedNode;
            var destinationFolder = tree.getSelectedFolder().path;
            console.log(destinationFolder);
            var success = true;
            for(var a in passengers)
            {
                console.log("copying:");
                console.log("TO:"+destinationFolder);
                console.log("FROM:"+"~/workspace"+passengers[a]);
                fs.copy("~/workspace"+passengers[a].path, destinationFolder+"/"+passengers[a].label, {overwrite:false, recursive:false}, function(err, data)
                {
                    if(!err) return;
                    success = false;
                    alert(err);
                });
            }
            tree.refresh(tree.selectedNodes, function(){});
            if(success)alert("The flight was successful.");
        }
        
        
        /***** Methods *****/

        
        /***** Lifecycle *****/
        
        plugin.on("load", function()
        {
        });
        plugin.on("unload", function()
        {
        });

        
        tree.on("load",function()
        {
            var mnuCtxTree = tree.getElement("mnuCtxTree");
                menus.addItemToMenu(mnuCtxTree, new ui.divider(), 100, tree);
                menus.addItemToMenu(mnuCtxTree, flightTakeoffItem, 101, tree);
                menus.addItemToMenu(mnuCtxTree, flightLandingItem, 102, tree);
                menus.addItemToMenu(mnuCtxTree, new ui.divider(), 103, tree);
        });
        
        /***** Register and define API *****/
        
        plugin.freezePublicAPI(
        {
            
        });
        
        register(null,
        {
            "flightFTP": plugin
        });
    }
});