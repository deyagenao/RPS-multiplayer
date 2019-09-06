// Firebase Configuration
var firebaseConfig = {
    apiKey: "AIzaSyAEeeWMYir3P3PPfdclPTIz3cAWIJAPYDU",
    authDomain: "fsd-rps.firebaseapp.com",
    databaseURL: "https://fsd-rps.firebaseio.com",
    projectId: "fsd-rps",
    storageBucket: "",
    messagingSenderId: "507802135462",
    appId: "1:507802135462:web:1d39ed87f0ce77f5"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// Global Variables
var username = "Guest";
var player1Connected = false;
var player2Connected = false;

// USERNAME LISTENERS
// Click event for the submit name button 
$("#submit-name").on("click", function(){
    if ($("#enter-name").val().trim() !== ""){
        username = $("#enter-name").val().trim()
    }
    startGame();
});
// Listening for enter button 
$("#enter-name").keypress(function(event){
    if (event.which === 13 && $("#enter-name").val().trim() !== ""){
        username = $("#enter-name").val().trim();
        startGame();
    }
});

// Global Functions 
function startGame() {

}





//     if (!player1Connected){
//     player1Name = $("#enter-name").val().trim();
//     $("#player-1").text(player1Name)
//     $("#game-status").empty();
//     } else if (!player2Connected) {
//         player2Name = $("#enter-name").val().trim();
//         $("#player-2").text(player2Name)
//         $("#game-status").empty();
//     } else {
//         $("#game-status").html("<h5>Sorry, the game is currently full. Try again soon!</h5>")
//     }