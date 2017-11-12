$(document).ready(function(){
    // Modal
    $('.ui.modal').modal('setting', 'closable', false);
    if (!debug) $('.ui.modal').modal('show');

    // Set focus after 100 ms
    setTimeout(function(){
        $('#player_name_text').focus()
    }, 100);

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

    // Add button - events
    $('#create_tower').click(function(){ adding = !adding; addingMode(); $('#create_tower').toggleClass('active');});
    $('#delete_tower').click(function(){  request_delete(selected.id); });
    $('#upgrade_tower').click(function(){ request_upgrade(selected.id); });

    // Stop building on escape
    $(document).keyup(function(e) {
        if (e.keyCode == 27 && adding) { // escape key maps to keycode `27`
            adding = false; addingMode(); $('#create_tower').removeClass('active');
        }
    });


});

// Healthbar
function setHealthbar(value){
    $('#healthbar_container').progress({ percent: value });
    $('#healthbar_text').text(value+"%");
}
