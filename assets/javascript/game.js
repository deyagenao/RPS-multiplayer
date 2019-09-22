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

// Global Variables
var database = firebase.database();
var chatData = database.ref("/chat");
var playersRef = database.ref("players");
var currentTurnRef = database.ref("turn");
var username = "Guest";
var currentPlayers = null;
var currentTurn = null;
var playerNum = false;
var playerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;

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

// Chat Listeners
// Chat send button listener, grabs input and pushes to firebase (Firebase's push automatically creates a unique key)
$("#chat-send").click(function(){
    if ($("chat-input").val() !== ""){
        var message = $("#chat-input").val();

        chatData.push({
            name: username,
            message: message,
            time: firebase.database.ServerValue.TIMESTAMP,
            idNum: playerNum
        });

        $("#chat-input").val("");
    }
});

//Chat input listener
$("#chat-input").keypress(function(event){
    if (event.which === 13 && $("#chat-input").val() !== ""){
        var message = $("#chat-input").val();

        chatData.push({
            name: username, 
            message: message,
            time: firebase.database.ServerValue.TIMESTAMP,
            idNum: playerNum
        });

        $("#chat-input").val("");
    }
});

// Update chat on screen when new message detected - ordered by 'time' value
chatData.orderbyChild("time").on("child_added", function(snapshot){
    $("#chat-messages").append(
        $("<p>").addClass("player-" +snapshot.val().idNum),
        $("<span>").text(snapshot.val().name + ": " + snapshot.val().message)
    );

    //Keeps div scrolled to bottom on each update 
    $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
});

// Click event for dynamically added <li> elements, or game choices
$(document).on("click", "li", function(){
    console.log("click");

    // Grabs text from li choice
    var clickChoice = $(this).text();
    console.log(playerRef);

    // Sets the choice in the current player firebase 
    playerRef.child("choice").set(clickChoice);

    //User has chosen, so removes choices and displays that they chose 
    $("#player" + playerNum + "ul").empty();
    $("#player" + playerNum+ "chosen").text(clickChoice);

    // Increments turn. Turn goes from: 
    // 1 - player 1 
    // 2 - player 2
    // 3 - determine winner
    currentTurnRef.transaction(function(turn){
        return turn + 1;
    });
});

// Tracks changes in key which contains player objects 
playersRef.on("value", function(snapshot){
    //length of players array
    currentPlayers = snapshot.numChildren();

    //Check to see if players exist
    playerOneExists = snapshot.child("1").exists();
    playerTwoExists = snapshot.child("2").exists();
})

// Function for starting the game
function startGame() {

}

