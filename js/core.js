/**
 * This code has been written by: Mohammad M. AlBanna
 * Website: MBanna.info 
 * Facebook: FB.com/MBanna.info
 * Copyright © 2016 Mohammad M. AlBanna
 */

$(function() {
    var tabsInfoPort = chrome.runtime.connect({name: "tabsInfo"});
    var setteingPort = chrome.runtime.connect({name: "setteingPort"});
    var adsSection = '<div class="tabsBoardAdv"></div>';
    var imagesPath = chrome.extension.getURL("images");
    var speech_language = "<input name='speech_language' type='hidden' value='en-US' />";
    var show_board = "<input name='show_board' type='hidden' value='A' />";
    var voice_search = "<input name='voice_search' type='hidden' value='B' />";
    var show_board_mouse_click = "<input name='show_board_mouse_click' type='hidden' value='Y' />";
    var show_board_mouse_click_image = "<img id='showBoardOnHover' src='"+imagesPath+"/tabs-hover.png' />";
    var tabsContainer = '<div class="tabsContainer"></div>';
    var showAllTabsCardsButton = '<span id="showAllTabsCards">View All Tabs</span>';
    var searchInTabs = '<div class="searchInTabs">\
                <div class="tabsSearchText">\
                    <img src="' + imagesPath + '/search-text.png" />\
                    <input type="text" id="tabsSearchTextInput" placeholder="Write tab title..." />\
                </div>\
                <div class="tabsSearchVoice">\
                    <img src="' + imagesPath + '/search-voice.png" />\
                    <input type="text" id="tabsSearchVoiceInput" placeholder="Start Talking..." />\
                </div>\
            </div>';
    var pinnedTabsContainer = '<div id="pinnedTabsContainer">\
                    <a id="dragPinnedTabsContainer"> <img id="painnedTabsImage" src="' + imagesPath + '/drag.png"> </a>\
                     <div class="cardsContainer"></div>\
            </div>';
    var originalTabsContainer = '<div id="originalTabsContainer"><div class="cardsContainer"></div></div>';
    //Render the board
    $(tabsContainer).appendTo($("body")).append($(adsSection)).append($(pinnedTabsContainer)).append($(originalTabsContainer)).append($(showAllTabsCardsButton)).append($(searchInTabs)).append(speech_language).append(show_board).append(voice_search).append(show_board_mouse_click);
    $("body").append(show_board_mouse_click_image);
    //**************************************************EVENTS*************************************
    //--------------------Load Setting ------------------//
    setteingPort.postMessage({type: "requestSetting"});
    //Listener to changes settings
    setteingPort.onMessage.addListener(function(msg) { 

        if(msg && typeof msg.type !== "undefined" && msg.type == "requestSetting"){
            $("input[name='speech_language'][type='hidden']").val(msg.speech_language);
            $("input[name='show_board'][type='hidden']").val(msg.show_board);
            $("input[name='voice_search'][type='hidden']").val(msg.voice_search);
            $("input[name='show_board_mouse_click'][type='hidden']").val(msg.show_board_mouse_click);

            if(typeof recognition !== "undefiend"){
                recognition.lang = $("input[name='speech_language'][type='hidden']").val();
            }

            var showBoardOnHover = $("input[name='show_board_mouse_click'][type='hidden']").val();
            if(showBoardOnHover=="Y"){
                $("#showBoardOnHover").css("visibility","visible");
            }else{
                $("#showBoardOnHover").css("visibility","hidden");
                
            }
            
        }else if(msg && typeof msg.type !== "undefined" && msg.type == "updateSetting"){
            $("input[name='"+Object.keys(msg)[0]+"'][type='hidden']").val(msg[Object.keys(msg)[0]]);

             if(Object.keys(msg)[0] == "speech_language" && typeof recognition !== "undefiend"){
                recognition.lang = $("input[name='speech_language'][type='hidden']").val();
            }

            var showBoardOnHover = $("input[name='show_board_mouse_click'][type='hidden']").val();
            if(showBoardOnHover=="Y"){
                $("#showBoardOnHover").css("visibility","visible");
            }else{
                $("#showBoardOnHover").css("visibility","hidden");
                
            }
        }

    });
    //Show board with mouse click
     $("body").on("click","#showBoardOnHover",function(){
        if($(".tabsContainer").is(":visible")){
                $(".searchInTabs input").val("");
                $("#showAllTabsCards").click();
                $(".tabsContainer").slideUp("fast");
            }else{
                $(".tabsContainer").slideDown("fast");
            }
     });

    $("body").on("keydown",function(e){
        var showBoardChar =  $("input[name='show_board'][type='hidden']").val();
        var voiceSearchChar =  $("input[name='voice_search'][type='hidden']").val();
        //Show board
        if( (e.metaKey || e.ctrlKey) && e.shiftKey && String.fromCharCode(e.keyCode) === showBoardChar){
            if($(".tabsContainer").is(":visible")){
                $(".searchInTabs input").val("");
                $("#showAllTabsCards").click();
                $(".tabsContainer").slideUp("fast");
            }else{
                $(".tabsContainer").slideDown("fast");
            }
        }
        //Show board with speech voice
        else if( (e.metaKey || e.ctrlKey) && e.shiftKey && String.fromCharCode(e.keyCode) === voiceSearchChar){
            if(!$(".tabsContainer").is(":visible")){ 
                $(".tabsContainer").slideDown("fast");
                $(".tabsSearchVoice").click();
            }else {
                $(".tabsSearchVoice").click();
            }
        }
    });


    //--------------------Close Tab Card ------------------//
    $("body").on("click", ".tabCard .closeCardTab", function() {
        $(this).parents(".tabCard").remove();
        var tabId = $(this).parents(".tabCard").attr("data-id");
        tabsInfoPort.postMessage({id:tabId,type: "closeTab"});

    });


     $("body").on("mousedown", ".tabCard", function(e) {
        e.preventDefault();
        if(e.which == 2){
            $(this).remove();
            var tabId = $(this).attr("data-id");
            tabsInfoPort.postMessage({id:tabId,type: "closeTab"});
        }
    });
    //-------------------- Show all Tabs ------------------//
    $("body").on("click", "#showAllTabsCards", function() {
        $(".tabCard").show();
        $("#showAllTabsCards").css("color","#474747");
    });
    //-------------------- Open pinned tabs container ------------------//
    $("body").on("click", "#dragPinnedTabsContainer", function() {
        if (!$(this).parents("#pinnedTabsContainer").hasClass("pinnedTabsContainerShown")){
            $(this).parents("#pinnedTabsContainer").height(290);
            $(this).siblings('.cardsContainer').height(290);
            $(this).siblings('.cardsContainer').show();
            $(this).parents("#pinnedTabsContainer").addClass("pinnedTabsContainerShown");
            $(this).parents("#pinnedTabsContainer").removeClass("pinnedTabsContainerHidden");
        } else {
            $(this).parents("#pinnedTabsContainer").height(10);
            $(this).siblings('.cardsContainer').hide();
            $(this).parents("#pinnedTabsContainer").addClass("pinnedTabsContainerHidden");
            $(this).parents("#pinnedTabsContainer").removeClass("pinnedTabsContainerShown");
        }
    });

    //--------------------Hide pinnedTabsContainer on click on cardsContainer ------------------//
    $("body").on("click", "#pinnedTabsContainer .cardsContainer", function(e) {
        e.stopPropagation();
        $("#dragPinnedTabsContainer").click();
    });

    //--------------------Hide Tabs Board on click on cardsContainer ------------------//
    $("body").on("click", "#originalTabsContainer .cardsContainer", function(e) {
        e.stopPropagation();
        $("#showBoardOnHover").click();
    });

    //--------------------change selected tab ------------------//
    $("body").on("click", ".cardsContainer .tabCard", function(e) {
        e.stopPropagation();
        var tabId = $(this).attr("data-id");
        tabsInfoPort.postMessage({id:tabId,type: "highlightTab"});
     
    });
    //--------------------Scroll ------------------//
    $('.cardsContainer').enscroll({
        verticalTrackClass: 'track4',
        verticalHandleClass: 'handle4',
        minScrollbarLength: 28,
        showOnHover: false
    });
    //--------------------droppable ------------------//
    $("#showBoardOnHover").draggable();


   $(".cardsContainer").droppable({ accept: ".tabCard", 
   drop: function(event, ui) {
        var dropped = ui.draggable;
        var droppedOn = $(this);
        $(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn); 
        var tabId = $(dropped).attr("data-id");
        if($(this).parent().attr("id") == "pinnedTabsContainer"){
            tabsInfoPort.postMessage({id:tabId,type: "pinTab"});
        }else{
            tabsInfoPort.postMessage({id:tabId,type: "unPinTab"});    
        }
    }});

   //Intervally, check if there pinned tabs or not or hidden cards
   setInterval(function(){
        //Check if there is any tabs in pin board
        if($("#pinnedTabsContainer .tabCard").length > 0){
            $("#painnedTabsImage").attr("src",imagesPath+"/drag-light.png");
        }else{
            $("#painnedTabsImage").attr("src",imagesPath+"/drag.png");
        }
        
        $("#showAllTabsCards").css("color","#474747");
        if($(".tabsContainer").is(":visible")){
            $("#originalTabsContainer .tabCard").each(function(index,el){
                if(!$(el).is(":visible") ){
                    $("#showAllTabsCards").css("color","red");
                    return false;
                }
            });
        }
   },5000)

    //--------------------Ignore contains case sensitive ------------------//
    $.expr[":"].contains = $.expr.createPseudo(function(arg) {
        return function(elem) {
            return $(elem).text().toUpperCase().indexOf($.trim(arg.toUpperCase())) >= 0;
        };
    });
    //--------------------Speech Recongition ------------------//
    if (!('webkitSpeechRecognition' in window)) {
        $(".tabsSearchVoice").remove();
        console.error("Your browser does not support speech recognition, or it is not enabled yet!");
    } else {
        var voiceTimer;
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = $("input[name='speech_language'][type='hidden']").val();
        recognition.onstart = function() {
            $(".tabsSearchVoice").css("width", "280px");
            $(".tabsSearchVoice input").attr("style","transition:all 1s;width:220px !important");
        }
        recognition.onresult = function(event) {
            var final_transcript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                final_transcript += event.results[i][0].transcript;

            }
            clearTimeout(voiceTimer);
            voiceTimer = setTimeout(function() { 
            $("#tabsSearchVoiceInput").val(final_transcript);
                if (!$("#pinnedTabsContainer").hasClass("pinnedTabsContainerShown") && $("#pinnedTabsContainer .tabCard").length > 0) {
                    $("#dragPinnedTabsContainer").click();
                }
                $(".cardsContainer .tabCard").hide();
                $(".cardsContainer .tabCard .tabTitle:contains(" + final_transcript + ")").parents(".tabCard").fadeIn("fast");
            },1000);
        }
        recognition.onerror = function(event) {
            $(".tabsSearchVoice").css("width", "60px");
            $(".tabsSearchVoice input").attr("style","transition:all 1s;width:0px !important");
        }
        recognition.onend = function() {
            $(".tabsSearchVoice").css("width", "60px");
            $(".tabsSearchVoice input").attr("style","transition:all 1s;width:0px !important");
            return;
        }
        $(".tabsSearchVoice").on("click", function() {
            $(".searchInTabs input").val("");
            if ($(".tabsSearchVoice").width() == 280) {
                recognition.stop();
                $(".tabsSearchVoice").css("width", "60px");
                $(".tabsSearchVoice input").attr("style","transition:all 1s;width:0px !important");
                return;
            } else {
                recognition.start();
            }
        })
    } //end else support speatch

    //--------------------SEARCH TEXT ------------------//
    var timer;
    $("body").on("keypress", ".tabsSearchText #tabsSearchTextInput", function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            $(".cardsContainer .tabCard").hide();
            $(".cardsContainer .tabCard .tabTitle:contains(" + $(".tabsSearchText #tabsSearchTextInput").val() + ")").parents(".tabCard").fadeIn("fast");
            if (!$("#pinnedTabsContainer").hasClass("pinnedTabsContainerShown") && $("#pinnedTabsContainer .tabCard").length > 0 ) {
                $("#dragPinnedTabsContainer").click();
            }
        }, 500);
    }).on('keydown', function(e) {
        if (e.keyCode == 8)
            if ($(this).val() == '') {
                $(".cardsContainer .tabCard").show();
            }
    });


    //--------------------Insert Tabs Board to cards container ------------------//
    tabsInfoPort.postMessage({type: "tabsInfo"});
    tabsInfoPort.postMessage({type: "ads"});

    //Listener to background port
    tabsInfoPort.onMessage.addListener(function(msg) { 
        if(msg && typeof msg.type !== "undefined" && msg.type == "tabsInfo"){
            drawCard(msg.id,msg.title,msg.favIconUrl,msg.windowId,tabsInfoPort);
        }else if(msg && msg.type !== "undefined" && msg.type == "tabsUpdate"){
                //tab image
                if(typeof msg.image !== "undefined"){
                $(".tabCard[data-id='"+msg.id+"'] .tabImage").html("<canvas></canvas>");
                var canvas = $(".tabCard[data-id='"+msg.id+"'] .tabImage").find("canvas").get(0);
                var context=canvas.getContext("2d");
                imageObj = new Image(); 
                imageObj.src = msg.image;
                context.drawImage(imageObj,0,0,imageObj.width-15,imageObj.height,0,0,canvas.width,canvas.height);
            }
            //else if there is favIcon
            if(typeof msg.favIconUrl !== "undefined"){
                $(".tabCard[data-id='"+msg.id+"'] .tabImage").find("img").attr("src",msg.favIconUrl);
            }
            
            //Update title
            if(typeof msg.title !== "undefined"){
                 $(".tabCard[data-id='"+msg.id+"'] .tabTitle").text(msg.title);
            }
        }  else if (msg && msg.type !== "undefined" && msg.type == "isPinned"){
             $(".tabCard[data-id='"+msg.id+"']").appendTo('#pinnedTabsContainer .cardsContainer');
        } else if(msg && msg.type !== "undefined" && msg.type == "removeTab"){
            $(".tabCard[data-id='"+msg.id+"']").remove();
        }else if(msg && msg.type !== "undefined" && msg.type == "pinTab"){
            $(".tabCard[data-id='"+msg.id+"']").appendTo('#pinnedTabsContainer .cardsContainer');
        }else if(msg && msg.type !== "undefined" && msg.type == "unPinTab"){
            $(".tabCard[data-id='"+msg.id+"']").appendTo('#originalTabsContainer .cardsContainer');
        }else if(msg && msg.type !== "undefined" && msg.type == "ads"){
            var json =  JSON.parse(msg.ads);
            if (json.length <= 0) {
                return;
            }
            var item = getAds(json);
            if(item!= null && item.length > 0)
            $(".tabsContainer .tabsBoardAdv").append("<a href='"+escapeHTML(item[3])+"' target='_blank'><img title='"+escapeHTML(item[0])+"' alt='"+escapeHTML(item[0])+"' src='"+escapeHTML(item[1])+"' /></a>")
             
        }
    });




function drawCard(id,title,favIcon,windowId,tabsInfoPort){
    if(typeof favIcon === "undefined"){
        favIcon = imagesPath+"/warning.png";
    }
    //--------------------Draw card with draggable event ------------------//
     $('<div class="tabCard" data-id="'+id+'">\
                <div class="tabTitle" title="'+title+'">'+title+'</div>\
                <span class="closeCardTab">x</span>\
                <div class="tabImage" title="'+title+'"><img src="'+favIcon+'" /></div>\
            </div>').appendTo('#originalTabsContainer .cardsContainer').draggable({
                revert: "invalid",
                cursor: 'move',  
                start:function(event,ui){
                    if(!$("#pinnedTabsContainer").hasClass("pinnedTabsContainerShown")){
                         $("#dragPinnedTabsContainer").click();
                     }
                    //generate draggable card hoder
                    $("body").append('<div class="tabCard draggableCard"></div>');
    

                    $(".cardsContainer").css("overflow","visible");
                    $("#pinnedTabsContainer").css("overflow","visible");
                    $(".tabCard").hide();
                    $(".tabCard.draggableCard").css({"visibility":"visible","display":"inline-block"});
                    $(".tabCard.draggableCard").html($(this).html());
                    $(".tabCard.draggableCard").css({top:event.clientY-150,left:event.clientX-100});


                },
                drag:function(event,ui){
                    $(".tabCard.draggableCard").css({top:event.pageY-150,left:event.pageX-100});
                     
                 },
                stop:function(event,ui){
                    $(".tabCard.draggableCard").remove();
                    $(".tabCard.draggableCard").css({"display":"none"});
                    $(".cardsContainer").css("overflow","hidden");
                    $("#pinnedTabsContainer").css("overflow","hidden");
                    $(".tabCard").show();

                }
            });

//send tab image request
tabsInfoPort.postMessage({id:id,type: "tabsUpdate",windowId:windowId});
tabsInfoPort.postMessage({id:id,type: "isPinned"});
}

//For ads
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth(); //January is 0!
var yyyy = today.getFullYear();
var counter = 0;
var max = 50;

//Recursion to get valid ads
function getAds(json){
    counter++;
    if(counter >= max)
    {
        return null;
    }
    var item = json[Math.floor(Math.random()*json.length)];
    var startDateCompare = new Date(item[2][0].split("-")[2],item[2][0].split("-")[1]-1,item[2][0].split("-")[0]);
    var endDateCompare = new Date(item[2][1].split("-")[2],item[2][1].split("-")[1]-1,item[2][1].split("-")[0]);
    var todayCompare = new Date(yyyy, mm,dd);
    if( startDateCompare <= todayCompare && todayCompare <= endDateCompare ){
       return item;
    }else{
        return getAds(json);
    }
}

function escapeHTML(s) { 
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

});//end jQuery