$(document).ready(function(){
    // Modal
    $('.ui.modal').modal('setting', 'closable', false);
    if (!debug) $('.ui.modal').modal('show');

    tryLogin = function(){
        if ($('#player_name_text').val()){
            console.log("Player "+$('#player_name_text').val()+" enters");
            $('.ui.modal').modal('hide')
        }
    }

    $('#player_name_submit').click(function () { tryLogin() });
    $('#player_name_text').keypress(function (e) {
        if (e.which == 13){
            tryLogin();
        }
    });

    // Sidebar
    $('.sidebar')
        .sidebar({
            closable: false,
            dimPage: false
        })
        .sidebar('setting', 'transition', 'overlay')
        .sidebar('attach events','#sidebar_toggle')
        .sidebar('toggle');

    // Sidebar toggle
    $("#sidebar_toggle").state({text: {inactive:'<<', active:'>>'}});

    // THIS IS A REALLY UGLY WAY DO DO IT. IT SHOULD BE TRANSITIONING INSTEAD
    setInterval(function () {
        $("#sidebar_toggle").css("left", ($(".sidebar").position().left+$(".sidebar").width()+40+"px"));
    }, 10);

    // Healthbar
    $('#player_name_submit').click(function (event) {
        if ($('#player_name_text').val()){
            console.log("Player "+$('#player_name_text').val()+" enters");
            $('.ui.modal').modal('hide')
            event.stopPropagation();
            start().then(start2);
        }
    });

    function setHealth(value){
        $('#healthbar_container').progress({ percent: value });
        $('#healthbar_text').text(value+"%");
    }
    setHealth(30);

    // Add button - events
    $('#create_tower').click(function(){ adding = 'building';  });
    $('#create_minion').click(function(){ adding = 'minion';  });


});
