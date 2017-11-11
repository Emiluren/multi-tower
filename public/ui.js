$(document).ready(function(){

    $('.sidebar')
        .sidebar({
            closable: false,
            dimPage: false
        })
        .sidebar('setting', 'transition', 'overlay')
        .sidebar('attach events','#sidebar_toggle')
        .sidebar('toggle');

    $('.ui.modal').modal('setting', 'closable', false);
    if (!debug) $('.ui.modal').modal('show');

    $("#sidebar_toggle").state({text: {inactive:'<<', active:'>>'}});
    // THIS IS A REALLY UGLY WAY DO DO IT. IT SHOULD BE TRANSITIONING INSTEAD
    setInterval(function () {
        $("#sidebar_toggle").css("left", ($(".sidebar").position().left+$(".sidebar").width())+"px");
    }, 10);

    $('#player_name_submit').click(function () {
        if ($('#player_name_text').val()){
            console.log("Player "+$('#player_name_text').val()+" enters");
            $('.ui.modal').modal('hide')
        }
    });

    function setHealth(value){
        $('#healthbar_container').progress({ percent: value });
        $('#healthbar_text').text(value+"%");
    }
    setHealth(30);


});
