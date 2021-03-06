define(function(require, exports, module)
{
    main.consumes = ["Plugin", "tree", "ui", "menus", "fs", "dialog.fileoverwrite", "dialog.alert", "dialog.notification"];
    main.provides = ["flightFTP"];
    return main;

    function main(options, imports, register)
    {
        var Plugin = imports.Plugin;
        var menus = imports.menus;
        var tree = imports.tree;
        var ui = imports.ui;
        var fs = imports.fs;
        var fileoverwrite = imports["dialog.fileoverwrite"];
        var alertDialog = imports["dialog.alert"];
        var notification = imports["dialog.notification"];
        
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
            
        var destinationFolder;
        var success;
        var overwriteAll;
        var skipAll;
        var currPassenger;
        var anySkip;
        var _hider;
        function flightLanding()
        {
            overwriteAll = false;
            skipAll = false;
            success = true;
            anySkip = false;
            currPassenger = 0;
            
            destinationFolder = tree.getSelectedFolder().path;
            _hider = notification.show("<div style='background: #666666; padding: 7px; font-weight: bold; color: #00ffff;'>Flight FTP - Processing please wait until the 'Flight Complete' dialog appears.</div>", true);
            tryToLandCurrFile();
        }
        
        function tryToLandCurrFile()
        {
            //  check to make sure there are still files to copy
            if(currPassenger>=passengers.length)
            {
                landingComplete();
            }
            //  there are still files, try to copy them
            else
            {
                //  if we're not overwriting everything then start checking for
                //  existing files
                if(!overwriteAll)
                {
                    fs.exists(destinationFolder+"/"+passengers[currPassenger].label, function(exists)
                    {
                        if(exists)
                        {
                            //  we're not skipping all, so check if we want to skip/overwrite this one
                            if(!skipAll)
                            {
                                //  title of the overwrite dialog
                                fileoverwrite.show("Flight - Landing",
                                //  message about file
                                "File: "+passengers[currPassenger].label+" already exists.",
                                "Would you like to overwrite it?",
                                //  handle overwrite
                                //  if isAll = true, then we are overwriting all the files
                                //  if isAll = false, then we are overwriting just this file
                                function(isAll)
                                {
                                    // we're overwriting all
                                    if(isAll) overwriteAll = true;
                                    
                                    forceLandCurrFile();
                                },
                                //  handle skip
                                //  if isAll = true, then we are skipping all the files
                                //  if isAll = false, then we are skipping just this file
                                function(isAll)
                                {
                                    if(isAll) skipAll = true;
                                    anySkip = true;
                                    currPassenger ++
                                    tryToLandCurrFile();
                                },
                                //  show the all buttons and the cancel button
                                { all: true, cancel:false });
                            }
                            //  we are skipping all existing files, so advance to the next file
                            //  and try to land it
                            else
                            {
                                currPassenger ++;
                                tryToLandCurrFile();
                            }
                        }
                        //  the file doesn't already exist, just copy it
                        else
                        {
                            forceLandCurrFile();
                        }
                    });
                }
                //  We are overwritting everything so force land the file
                else
                {
                    forceLandCurrFile();
                }
            }
        }
        
        function forceLandCurrFile()
        {
            fs.copy("~/workspace"+passengers[currPassenger].path, destinationFolder+"/"+passengers[currPassenger].label, {overwrite:true, recursive:true}, 
            function(err, data)
            {
                if(!err)
                {
                    currPassenger ++;
                    tryToLandCurrFile();
                }
                else
                {
                    success = false;
                    alert(err);
                }
            });
        }
        
        function landingComplete()
        {
            tree.refresh(tree.selectedNodes, function(err)
            {
                if(err)
                {
                    
                }
                else
                {
                    
                }
            });
            if(success)
            {
                var message = (anySkip)? "Some files were skipped.": "No files were skipped.";
                alertDialog.show(   "Flight - Complete",
                                    "The flight was successful.",
                                    message,
                                    function()
                                    {
                                        
                                    });
            }
            else
            {
                alertDialog.show(   "Flight - Complete",
                                    "The flight wasn't successful.",
                                    "There were some errors.",
                                    function(){});
            }
            _hider();
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