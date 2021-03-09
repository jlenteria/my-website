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

var index = 0;
var Data = "";
const cSharp1 =
  "Add Student Information App using C sharp. You can add, view, edit and delete informations of the students.";
const cSharp2 =
  "Motorcycle Inventory using C sharp. You can add, delete, edit, view and select motorcycles.";
const cSharp3 =
  "Products Inventory System using C sharp. It has different categories of products where you can see Dashboard, Perform, View and Update Inventory.";
const website =
  "This is my Personal Website made of HTML, CSS with a few codes of Javascript.";
const googleMap =
  "Google Map Store. This application is also made of HTML, CSS and Javascript.";
const studentApp =
  "Add Student Application. This website application is made of Javascript and CSS with React Js framework. This is an CRUD react application.";
const todoApp =
  "Todo app with account. This is a todo application that has an account. It used Reactjs, Nodejs and Mongodb.";
const randomMind =
  "This website is like a social media site, you can share your thoughts here, you can like and comment posts. This is made of reactjs and nodejs with mongodb database. I am currently developing this site.";
//links
const studentLink = "https://github.com/jlenteria/student-information-csharp";
const motorInventoryLink = "https://github.com/jlenteria/Motor-Inventory";
const productInventoryLink = "https://github.com/jlenteria/Products-Inventory";
const websiteLink = "https://bonfox.netlify.app/";
const mapLink = "https://github.com/jlenteria/Store-Locator-with-Google-Maps";
const studentAppLink = "https://github.com/jlenteria/person-information-system";
const todoAppLink = "https://bonfox-todo.herokuapp.com/";

var sentence = [
  "",
  cSharp1,
  cSharp2,
  cSharp3,
  "",
  website,
  googleMap,
  studentApp,
  todoApp,
  randomMind,
];
var img = [
  "",
  "img/student-information.jpg",
  "img/motorcycle-inventory.jpg",
  "img/product-inventory.jpg",
  " ",
  "img/website.png",
  "img/google-store.png",
  "img/student-app.png",
  "img/todo.png",
  "img/randommind.png",
];

var link = [
  "",
  studentLink,
  motorInventoryLink,
  productInventoryLink,
  "",
  websiteLink,
  mapLink,
  studentAppLink,
  todoAppLink,
  "",
];

var linkContent = "";
function prev() {
  var workSentence = document.getElementById("work-sentence");
  document.querySelector(".next").style.opacity = "1";
  document.querySelector(".next").style.cursor = "pointer";

  if (index > 0) {
    index--;
    if (index == 0) {
      document.querySelector(".prev").style.opacity = "0.2";
      document.querySelector(".prev").style.cursor = "not-allowed";
    }
    if (index != 5 && index != 8) {
      linkContent = "Visit on Github";
    } else {
      linkContent = "<i class='fa fa-eye'> Live Demo</i>";
    }
    Data = `<div style = "display: block;">
        <img src = ${img[index]}  text-align: center;">
        <p  style = "padding-top: 20px;">${sentence[index]}</p>
        <a href='${link[index]}' target='_blank'><strong> ${linkContent}</strong></a>

        </div>`;

    if (index === 0) {
      Data = `<div style = "display:block;">
            <video controls style = "border-radius:20px; text-align:center">
                <source src = "img/thesis.mp4" type="video/mp4">
            </video>
            <br>
            <p>Game using Innovative Mechanical Inputs and Kinetics (GIMIK) </p>
            <p style = "font-size: 12px;">This is our THESIS project which is a real-time game application using Java and Arduino. This game will give you not only for fun but also you can charge your mobile phone for your reward and also there are other reward if you win the game. I'm the only one who program the application of our thesis.</p>
            </div>`;
    }
    if (index == 4) {
      Data = `<div style = "display:block;">
            <video controls style = "border-radius:20px; text-align:center">
                <source src = "img/ObstacleBot.mp4" type="video/mp4">
            </video>
            <br><br>
            <p>Obstacle Avoiding Robot </p>
            <p style = "font-size: 12px;">This project is made of Arduino.</p>
            </div>`;
    }
    workSentence.innerHTML = Data;
  }
}
function next() {
  var workSentence = document.getElementById("work-sentence");
  document.querySelector(".prev").style.opacity = "1";
  document.querySelector(".prev").style.cursor = "pointer";

  if (index < img.length - 1) {
    index++;
    if (index == link.length - 1) {
      document.querySelector(".next").style.opacity = "0.2";
      document.querySelector(".next").style.cursor = "not-allowed";
    }
    if (index == 9) {
      linkContent = "";
    } else if (index != 5 && index != 8) {
      linkContent = "Visit on Github";
    } else {
      linkContent = "<i class='fa fa-eye'> Live Demo</i>";
    }

    Data = `<div style = "display: block;">
        <img src = ${img[index]}  text-align: center;" >
        <p  style = "padding-top: 20px;">${sentence[index]}</p>
        <a href='${link[index]}' target='_blank'><strong>${linkContent}<strong></a>

        </div>`;
    if (index == 4) {
      Data = `<div style = "display:block;">
            <video controls style = "border-radius:20px; text-align:center">
                <source src = "img/ObstacleBot.mp4" type="video/mp4">
            </video>
            <br><br>
            <p>Obstacle Avoiding Robot </p>
            <p style = "font-size: 12px;">This project is made of Arduino.</p>
            </div>`;
    }
  }
  workSentence.innerHTML = Data;
}
