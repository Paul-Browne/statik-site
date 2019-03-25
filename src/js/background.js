function init() {
  var canvas = document.getElementById("canvas");
  var c = canvas.getContext("2d");
  var w = window.innerWidth;
  var h = window.innerHeight;

  var step = 16;
  canvas.width = w;
  canvas.height = h;
  c.lineCap = "square";
  c.lineWidth = 1.2;
  c.beginPath();
  c.rect(0, 0, w, h);
  c.fillStyle = "#000";
  c.fill();

  function draw(x, y, width, height) {
    var leftToRight = Math.random() >= 0.5;
    var red = Math.floor((255 * x) / w);
    var green = Math.floor((255 * y) / h);
    c.beginPath();
    if (leftToRight) {
      c.moveTo(x, y);
      c.quadraticCurveTo(
        x + width + 8 * (Math.random() - 0.5),
        y + height + 8 * (Math.random() - 0.5),
        x + width,
        y + height
      );
    } else {
      c.moveTo(x + width, y);
      c.quadraticCurveTo(
        x + 8 * (Math.random() - 0.5),
        y + height + 8 * (Math.random() - 0.5),
        x,
        y + height
      );
    }
    c.strokeStyle = "rgba(" + red + "," + green + "," + 125 + "," + 0.75 + ")";
    c.stroke();
  }

  for (var x = 0; x < w; x += step) {
    for (var y = 0; y < h; y += step) {
      draw(x, y, step, step);
    }
  }
}

init();
window.addEventListener("resize", function() {
  init();
});
