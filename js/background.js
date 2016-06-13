/**
 * This code has been written by: Mohammad M. AlBanna
 * Website: MBanna.info 
 * Facebook: FB.com/MBanna.info
 * Copyright © 2016 Mohammad M. AlBanna
 */

chrome.storage.local.clear();
chrome.browserAction.setBadgeText({ text: "" });
chrome.browserAction.setBadgeBackgroundColor({color: "#505050"});
//Call Ads
getAndSaveAds();
//---------------------------------------------//
//To prevent fireing this many times, i've moving the code before opening the ports.
chrome.tabs.onHighlighted.addListener(function(tabs){
        chrome.tabs.captureVisibleTab(null, {}, function(dataUri) {
            if(!chrome.runtime.lastError){
               setScreenShot(tabs.tabIds[0], dataUri);
            }else{
                return;
            }        
    });
});

//---------------------------------------------//
chrome.runtime.onConnect.addListener(function(port) {
    port.onDisconnect.addListener(function() {
        port = null;
    });

    if (port.name == "tabsInfo") {
        //---------------------------------------------//
        //Listener to created tabs
        chrome.tabs.onCreated.addListener(function(tab) {
            if(typeof port !== "undefiend" && port !== null){ 
                port.postMessage({
                    type: "tabsInfo",
                    id: tab.id,
                    windowId: tab.windowId,
                    title: tab.title
                });
            }
        });
        //---------------------------------------------//
        //Lister to complete loaded tabs, images and title of the tab
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            if (changeInfo.status == 'complete') {
                if(typeof port !== "undefiend" && port !== null){
                     port.postMessage({
                        type: "tabsUpdate",
                        id: tab.id,
                        windowId: tab.windowId,
                        title: tab.title,
                        favIconUrl: tab.favIconUrl
                    });
                }
            }
        });

        //---------------------------------------------//
        //Listener to removed tabs
        chrome.tabs.onRemoved.addListener(function(tab) {
          if(typeof port !== "undefiend" && port !== null){
                port.postMessage({
                    type: "removeTab",
                    id: tab
                });
           }

            chrome.storage.local.remove(tab.toString());

            chrome.tabs.query({}, function(tabsCount) { 
                chrome.browserAction.setBadgeText({ text: tabsCount.length.toString() });
                chrome.browserAction.setBadgeBackgroundColor({color: "#505050"});
            });
        });

        //---------------------------------------------//
        //Listener to local storage for pin tabs
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if(typeof port !== "undefiend" && port !== null){ 
                if (areaName == "local" && Object.keys(changes).toString().indexOf("pin_") != -1) {
                    var tabId = Object.keys(changes).toString().substring(4);
                    for (key in changes) {
                        if (typeof changes[key].newValue !== "undefined") {
                            port.postMessage({
                                id: tabId,
                                type: "pinTab"
                            });
                        } else if (typeof changes[key].oldValue !== "undefined") {
                            port.postMessage({
                                id: tabId,
                                type: "unPinTab"
                            });
                        }
                    }
                }
            }
        });

        //---------------------------------------------//
        port.onMessage.addListener(function(msg) {
            //Send tabs into
            if (msg && typeof msg.type !== "undefined" && msg.type == "tabsInfo") {
                chrome.tabs.query({}, function(tabs) {
                    for (var i = 0; i < tabs.length; i++) {
                        port.postMessage({
                            type: "tabsInfo",
                            id: tabs[i].id,
                            windowId: tabs[i].windowId,
                            title: tabs[i].title,
                            url: tabs[i].url,
                            favIconUrl: tabs[i].favIconUrl
                        });
                    }
                    chrome.browserAction.setBadgeText({ text: tabs.length.toString() });
                });
            } //end if tabs info
            //send tab Image
            else if (msg && typeof msg.type !== "undefined" && msg.type == "tabsUpdate") {
                   chrome.storage.local.get(null, function(data) {
                    var storageArray = Object.keys(data);
                    for (var i = 0; i < storageArray.length; i++) {
                        if(!isNaN(storageArray[i]))
                        port.postMessage({
                            id: storageArray[i],
                            type: "tabsUpdate",
                            image: data[storageArray[i]]
                        });
                    }
                });
            } //end if else
            else if (msg && typeof msg.type !== "undefined" && msg.type == "pinTab") {
                setPinnedTab(msg.id);
            } //end if else
            else if(msg && typeof msg.type !== "undefined" && msg.type == "ads"){
                chrome.storage.local.get(["adsContent"],function(result){ 
                  port.postMessage({
                        type: "ads",
                        ads:result.adsContent
                    });
                  return true;
                });
            return false;
            }//end if else
            else if (msg && typeof msg.type !== "undefined" && msg.type == "unPinTab") {
                removePinnedTab(msg.id);
            } //end if else
            else if (msg && typeof msg.type !== "undefined" && msg.type == "highlightTab") {
                chrome.tabs.update(parseInt(msg.id), {
                    highlighted: true
                });
            } //end if else
            else if (msg && typeof msg.type !== "undefined" && msg.type == "closeTab") {
                chrome.tabs.remove(parseInt(msg.id));
            } else if (msg && typeof msg.type !== "undefined" && msg.type == "isPinned") {
                chrome.storage.local.get("pin_" + msg.id, function(data) {
                    if (Object.keys(data).length > 0) {
                        if(typeof port !== "undefiend" && port !== null){
                            port.postMessage({
                                id: msg.id,
                                type: "isPinned"
                            });
                      }
                    }
                });
            }
        });
       
    } //if port is tabs Info
    else if(port.name == "setteingPort"){
        //Listener to sync storage
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (areaName == "sync") {
                for (key in changes) {
                    if (typeof changes[key].newValue !== "undefined") {
                        var obj = {};
                        var theKey = key;
                        obj[theKey] += key;
                        obj[theKey] = changes[key].newValue;

                        var theKey2 = "type";
                        obj[theKey2] += "type";
                        obj[theKey2] = "updateSetting";
                        if(typeof port !== "undefiend" && port !== null){ 
                            port.postMessage(obj);
                         }
                    }
                }
            }
        });

        //---------------------------------------------//
        port.onMessage.addListener(function(msg) {
            if(msg && typeof msg.type !== "undefined" && msg.type == "requestSetting"){
                 chrome.storage.sync.get(["speech_language","show_board","voice_search","show_board_mouse_click"],function(result){ 
                    var speech_language = "en-US";
                    var show_board = "A";
                    var voice_search = "B";
                    var show_board_mouse_click = "N";

                    if(typeof result.speech_language !== "undefined"){
                        speech_language = result.speech_language;
                    } 

                    if(typeof result.show_board !== "undefined"){
                        show_board = result.show_board;
                    } 

                    if(typeof result.show_board_mouse_click !== "undefined"){
                        show_board_mouse_click = result.show_board_mouse_click;
                    }

                    if(typeof result.voice_search !== "undefined"){
                        voice_search = result.voice_search;
                    } 

                    if(typeof port !== "undefiend" && port !== null){ 
                        port.postMessage({
                                speech_language: speech_language,
                                show_board: show_board,
                                show_board_mouse_click: show_board_mouse_click,
                                voice_search: voice_search,
                                type: "requestSetting"
                            });
                    }   

                 });
            }
        });
    }
});


//---------------------------------------------//
function setScreenShot(tabId, image) {
    chrome.storage.local.remove(tabId.toString());
    var obj = {};
    var key = tabId;
    obj[key] += tabId;
    obj[key] = image;
    chrome.storage.local.set(obj);
}

//---------------------------------------------//
function setPinnedTab(tabId) {
    var obj = {};
    var key = "pin_" + tabId;
    obj[key] += tabId;
    chrome.storage.local.set(obj);
}
//---------------------------------------------//
function removePinnedTab(tabId) {
    chrome.storage.local.remove("pin_" + tabId);
}
//---------------------------------------------//
chrome.runtime.onInstalled.addListener(function(details){
    var css = chrome.extension.getURL("css");
    var js = chrome.extension.getURL("js");
    if(details.reason == "install"){
        window.open("http://www.mbanna.info/tabs-board-chrome-extension/#lastVersion",'_blank');
        chrome.tabs.query({}, function(tabs) {
            chrome.browserAction.setBadgeText({ text: tabs.length.toString() });
            for(var i= 0; i < tabs.length; i++ ){
                if(tabs[i].url.toString().lastIndexOf("chrome://") == -1 && tabs[i].url.toString().lastIndexOf("chrome-devtools://") == -1){
                    chrome.tabs.insertCSS(tabs[i].id,{file: "css/core.css"});
                    chrome.tabs.executeScript(tabs[i].id,{file: "js/jquery.js"});
                    chrome.tabs.executeScript(tabs[i].id,{file: "js/enscroll.js"});
                    chrome.tabs.executeScript(tabs[i].id,{file: "js/jquery-ui.js"});
                    chrome.tabs.executeScript(tabs[i].id,{file: "js/core.js"});
                }
            }
        });
    }
    else if(details.reason == "update"){
        chrome.tabs.query({}, function(tabs) {
            chrome.browserAction.setBadgeText({ text: tabs.length.toString() });
        });
    }


});
//-----------------------------------------------------------------------------------------------------//
//Send & save Ads Requests
function getAndSaveAds(){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "http://www.mbanna.info/extensions/tabs_board.json", true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (xmlhttp.responseText) {
                var key = "adsContent";
                var obj = {};
                obj[key] += "adsContent";
                obj[key] = xmlhttp.responseText;
                chrome.storage.local.set(obj);
            }
        }
    }
} 
//-----------------------------------------------------------------------------------------------------//
setInterval(function(){
     getAndSaveAds();
}, 14400000);
