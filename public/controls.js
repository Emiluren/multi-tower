
var controls = {};

controls["up"] = ["w", ""];
controls["down"] = ["s", ""];
controls["left"] = ["a", ""];
controls["right"] = ["d", ""];
controls["ascend"] = ["z", ""];
controls["descend"] = ["x", ""];
controls["to_castle"] = [" ", ""];

var evd = [];
var evu = [];

function initControls() {
  document.onkeydown = function(e) {
    var cc = e.keyCode || e.which;
    var key = String.fromCharCode(cc).toLowerCase();
    evd.push(key);
  }

  document.onkeyup = function(e) {
    var cc = e.keyCode || e.which;
    var key = String.fromCharCode(cc).toLowerCase();
    evu.push(key);
  }
}

function updateControls() {

  for(var i in controls) {
    switch(controls[i][1]) {
    case "pressed": controls[i][1] = "down"; break;
    case "released": controls[i][1] = ""; break;
    }
  }

  for(var e in evd) {
    handleDownEvents(evd[e]);
  }

  evd = [];

  for(var e in evu) {
    handleUpEvents(evu[e]);
  }

  evu = [];
}

function handleDownEvents(key) {
  for(var i in controls) {
    if(key == controls[i][0]) {
      switch(controls[i][1]) {
      case "": controls[i][1] = "pressed"; break;
      }
    }
  }
}

function handleUpEvents(key) {
  for(var i in controls) {
    if(key == controls[i][0]) {
      controls[i][1] = "released";
    }
  }
}

function pressed(key) {
  return controls[key][1] == "pressed";
}

function released(key) {
  return controls[key][1] == "released";
}

function down(key) {
  return controls[key][1] == "pressed" || controls[key][1] == "down";
}

function up() {
  return controls[key][1] == "released" || controls[key][1] == "";
}
