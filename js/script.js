window.onscroll = function () {
  scrollFunction();
};
function scrollFunction() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    document.getElementById("nav").style.height = "60px";
    document.getElementById("nav").style.background = "white";
    document.getElementById("nav").style.borderBottom =
      "1px solid rgba(0,0,0,0.3)";
    document.getElementById("nav").style.transition = "all 0.4s ease-in-out";
    document.getElementById("ul").style.marginTop = "-10px";
    document.getElementById("home").style.color = "black";
    document.getElementById("about").style.color = "black";
    document.getElementById("works").style.color = "black";
    document.getElementById("services").style.color = "black";
    document.getElementById("contact").style.color = "black";
    document.getElementById("brand").style.color = "black";
    document.getElementById("brand").style.marginTop = "7px";
  } else {
    document.getElementById("nav").style.height = "70px";
    document.getElementById("ul").style.marginTop = "0";
    document.getElementById("nav").style.background = "transparent";
    document.getElementById("nav").style.borderBottom = "none";
    document.getElementById("home").style.color = "white";
    document.getElementById("about").style.color = "white";
    document.getElementById("works").style.color = "white";
    document.getElementById("services").style.color = "white";
    document.getElementById("contact").style.color = "white";
    document.getElementById("brand").style.color = "white";
  }
}
