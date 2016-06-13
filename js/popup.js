/**
 * This code has been written by: Mohammad M. AlBanna
 * Website: MBanna.info 
 * Facebook: FB.com/MBanna.info
 * Copyright © 2016 Mohammad M. AlBanna
 */
 
$(function() {
        //Tabs
        $('.tab-content').enscroll("destroy");
        $('ul.tabs li').click(function() {
        var tab_id = $(this).attr('data-tab');
        $('ul.tabs li').removeClass('current');
        $('.tab-content').removeClass('current');
        $(this).addClass('current');
        $("#" + tab_id).addClass('current');
        $('.current.tab-content').enscroll({
            verticalTrackClass: 'track4',
            verticalHandleClass: 'handle4',
            minScrollbarLength: 28,
            showOnHover: false
        });
    });

    //Load Like facebook Page button 
    setTimeout(function(){
        $("#tab-3").prepend('<iframe src="https://www.facebook.com/plugins/likebox.php?href=https%3A%2F%2Fwww.facebook.com%2FMBanna.info&amp;width=250&amp;height=250&amp;colorscheme=light&amp;show_faces=true&amp;header=false&amp;stream=false&amp;show_border=false&amp;appId=627072280724068" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:250px; height:210px;" allowTransparency="true"></iframe>');
    },1000);

    //----------------------Share Buttons------------//
    $("#twitterShare").on("click",function(){
        chrome.browserAction.getBadgeText({},function(result){
            result = parseInt(result);
            if(typeof result !== "undefined" && !isNaN(result) && result > 0){
                window.open("https://twitter.com/share?via=_MBanna&text=I'm using Tabs Board chrome extension to manage opened tabs and I've opened "+(result+1)+" tabs! Try it Now: http://goo.gl/ZJdqNi");
            }else{
                window.open("https://twitter.com/share?via=_MBanna&text=I'm using Tabs Board chrome extension to manage opened tabs and search by voice! Try it Now: http://goo.gl/ZJdqNi");
            }
            
        });
    });

    $("#facebookShare").on("click",function(){
        chrome.browserAction.getBadgeText({},function(result){
            result = parseInt(result);
            if(typeof result !== "undefined" && !isNaN(result) && result > 0){
                window.open("https://www.facebook.com/dialog/feed?app_id=627072280724068&ref=adcounter&link=http://goo.gl/ZJdqNi&name=I'm using Tabs Board chrome extension to manage opened tabs and I've opened "+(result+1)+" tabs! Try it Now&redirect_uri=https://www.facebook.com&actions=%5B%7B%22name%22%3A%22Download%20More%20Extensions%22%2C%22link%22%3A%22http%3A%2F%2Fgoo.gl/YuwJ5P%22%7D%5D");
            }else{
                window.open("https://www.facebook.com/dialog/feed?app_id=627072280724068&ref=adcounter&link=http://goo.gl/ZJdqNi&name=I'm using Tabs Board chrome extension to manage opened tabs! Try it Now&redirect_uri=https://www.facebook.com&actions=%5B%7B%22name%22%3A%22Download%20More%20Extensions%22%2C%22link%22%3A%22http%3A%2F%2Fgoo.gl/YuwJ5P%22%7D%5D");
            }
        });
    });

    $("#googlePlusShare").on("click",function(){
        window.open("https://plus.google.com/share?url=http://goo.gl/ZJdqNi");
    });

    //----------------------------------------------------------------------------------//
    //Load Setting
    chrome.storage.sync.get(["speech_language","show_board","voice_search","show_board_mouse_click"],function(result){
        if(typeof result.speech_language !== "undefined"){
            $("select[name='speech_language']").val(result.speech_language);
        }else{
            $("select[name='speech_language']").val("en-US");
        }

        if(result.show_board_mouse_click == "Y"){
            $("input[name='show_board_mouse_click']").prop("checked", true);
        }else{
            $("input[name='show_board_mouse_click']").prop("checked", false);
        }

        if(typeof result.show_board != "undefined"){
            $("select[name='show_board']").val(result.show_board);
        }else{
            $("select[name='show_board']").val("A");
        }

        if(typeof result.voice_search != "undefined"){
            $("select[name='voice_search']").val(result.voice_search);
        }else{
            $("select[name='voice_search']").val("B");
        }
         
    });
    //----------------------------------------------------------------------------------//
    //Save extension setting
    $("body").on("change", "select", function() {
        var obj = {};
        var key = $(this).attr("name");
        obj[key] += $(this).attr("name");
        obj[key] = $(this).val();
 
        chrome.storage.sync.set(obj);
    });

    $("body").on("change", "input[name='show_board_mouse_click']", function() {
        var obj = {};
        var key = "show_board_mouse_click";
        obj[key] += "show_board_mouse_click";
        if ($(this).is(":checked")) {
            obj[key] = "Y";
        } else {
            obj[key] = "N";
        }
        chrome.storage.sync.set(obj);
    });

    //--------------------View Products ------------------//
    $.getJSON("http://www.mbanna.info/extensions/products.json", function(json, textStatus) {
        if (json.length <= 0) {
            return;
        }
        $(".my-products-list").html("");
        $.each(json, function(index, el) {
            var node = $('<li class="products-list">\
                    <div class="products-list-image">\
                        <img src="'+escapeHTML(el[2])+'" />\
                    </div>\
                    <div class="products-info">\
                        <a title="'+ escapeHTML(el[0]) +'" target="_blank" href="' + escapeHTML(el[3]) + '">' + escapeHTML(el[0]) + '</a>\
                        <a title="'+ escapeHTML(el[1]) +'" target="_blank" href="' + escapeHTML(el[3]) + '">' + escapeHTML(el[1]) + '</a>\
                    </div>\
                </li>').appendTo($(".my-products-list")); 
        });
    });
    //--------------------Escape HTML ------------------//
    function escapeHTML(s) { 
        return s.replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
    }

});