function rgb2hex(red, green, blue) {
    var rgb = blue | (green << 8) | (red << 16);
    return '#' + (0x1000000 + rgb).toString(16).slice(1)
}

function generate_color(name) {
    var i = name.length;
    var red = 100;
    var green = 23;
    var blue = 59;
    while (i--) {
        var num = name.charCodeAt(i);
        red += num;
        green = green*(i + 1)*num;
        blue += (i + 1)*num*num;
        if ((red + green + blue + i) % 2 == 0) {
            red = green * (i + 1);
            blue -= green - red;
            green += red;
        } else {
            red = red * red;
            green = green * green;
            blue = blue * blue;
        }
    }
    console.log(red);
    console.log(green);
    console.log(blue);
    red = red % 255;
    green = green % 255;
    blue = blue % 255;
    return rgb2hex(red, green, blue);
}


