$(document).ready(function(){
    // Modal
    $('.ui.modal').modal('setting', 'closable', false);
    if (!debug) $('.ui.modal').modal('show');

    tryLogin = function(event) {
        if ($('#player_name_text').val()){
            console.log("Player "+$('#player_name_text').val()+" enters");
            $('.ui.modal').modal('hide')
            event.stopPropagation();
            start().then(start2);
        }
    }

    $('#player_name_submit').click(function (e) { tryLogin(e) });
    $('#player_name_text').keypress(function (e) {
        if (e.which == 13){
            tryLogin(e);
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


    // Sidebar toggle
    $("#sidebar_toggle").state({text: {inactive:'<<', active:'>>'}});

    setInterval(function () {
        $("#sidebar_toggle").css("left", ($(".sidebar").position().left+$(".sidebar").width()+40+"px"));
    }, 10);

    // Healthbar
    function setHealth(value){
        $('#healthbar_container').progress({ percent: value });
        $('#healthbar_text').text(value+"%");
    }
    setHealth(30);

    // Add button - events
    $('#create_tower').click(function(){ adding = !adding; addingMode(); });


});
