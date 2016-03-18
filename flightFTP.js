define(function(require, exports, module)
{
    main.consumes = ["Plugin", "tree", "ui", "menus"];
    main.provides = ["flightFTP"];
    return main;

    function main(options, imports, register)
    {
        var Plugin = imports.Plugin;
        var menus = imports.menus;
        var tree = imports.tree;
        var ui = imports.ui;
        
        /***** Initialization *****/
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        var emit = plugin.getEmitter();
        
        function load(){}
        
        var passengers = [];
        var flightTakeoffItem = new ui.item(
        {
                caption: "Flight - Takeoff",
                isAvailable:function(editor){return true;},
                onclick:flightTakeoff
        });
        
        function flightTakeoff()
        {
            passengers = tree.selection;
        }
        
        var flightLandingItem = new ui.item(
        {
                caption:"Flight - Landing",
                isAvailable:function(editor)
                {
                    return (passengers.length > 0);
                },
                onclick:flightLanding
        });
            
        function flightLanding()
        {
            var destination = tree.selectedNode;
            var destinationFolder = tree.getSelectedFolder();
            console.log(destination);
            for(var a in passengers)
            {
                
            }
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