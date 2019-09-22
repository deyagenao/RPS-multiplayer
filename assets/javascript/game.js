// Firebase Configuration
var firebaseConfig = {
    apiKey: "AIzaSyCuhZyFlyerviRfVhs-Ttfxnhq4ttMmhsM",
    authDomain: "fs-rps.firebaseapp.com",
    databaseURL: "https://fs-rps.firebaseio.com",
    projectId: "fs-rps",
    storageBucket: "",
    messagingSenderId: "614150473320",
    appId: "1:614150473320:web:98331caca0ef6d66a75ddd"
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
    if ($("#enter-name").val() !== ""){
        username = $("#enter-name").val();
        startGame();
    }else{
        alert("Please enter a username!")
    }
});
// Listening for enter button 
$("#enter-name").keypress(function(event){
    if (event.which === 13 && $("#enter-name").val() !== ""){
        username = $("#enter-name").val();
        startGame();
    }else{
        alert("Please enter a username!")
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
chatData.orderByChild("time").on("child_added", function(snapshot){
    $("#chat-messages").append(
        $("<p>").addClass("player" +snapshot.val().idNum),
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
    $("#player" + playerNum + " ul").empty();
    $("#player" + playerNum+ "-chosen").html("<h4>" + clickChoice + "</h4>");

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

    //Player data objects
    playerOneData = snapshot.child("1").val();
    playerTwoData = snapshot.child("2").val();

    // If there's a player 1, fill in name and win loss data 
    if (playerOneExists) {
        $("#player1-name").text(playerOneData.name);
        $("#player1-wins").text("Wins: " + playerOneData.wins);
        $("#player1-losses").text("Losses: " +playerOneData.losses);
    }else {
        //If there is no player 1, clear win/loss data and show waiting
        $("#player1-name").text("Waiting for Player 1");
        $("#player1-wins").empty();
        $("#player1-losses").empty();
    }

    //If there is a player 2, fill in name and win/loss data
    if (playerTwoExists) {
        $("#player2-name").text(playerTwoData.name);
        $("#player2-wins").text("Wins: " +playerTwoData.wins);
        $("#player2-losses").text("Losses: " +playerTwoData.losses);
    } else {
        //If there is no player 2, clear win/loss data and show waiting
        $("#player2-name").text("Waiting for Player 2");
        $("#player2-wins").empty();
        $("#player2-losses").empty();
    }
});

// Detects changes in the cuurent turn key
currentTurnRef.on("value", function(snapshot){
    //Gets cuurent turn from snapshot
    currentTurn = snapshot.val();

    //Don't do the following unless player is logged in 
    if (playerNum) {
        //For turn 1
        if (currentTurn === 1) {
            // if it's the current player's turn, tell them and show choices
            if (currentTurn === playerNum) {
                $("#current-turn h4").text("It's Your Turn!");
                $("#player" +playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
            }else {
                //If it isn't the current player's turn, tell them they're waiting for player one 
                $("#current-turn h4").text("Waiting for " +playerOneData.name + " to choose.");
            }
            //shows teal border around active player
            $("#player1").css("border", "2px solid teal");
            $("#player2").css("border", "1px solid black");
        }else if (currentTurn === 2) {
            //If it's the current player's turn, tell them and show choices 
            if (currentTurn === playerNum) {
                $("#current-turn h4").text("It's Your Turn!");
                $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
            } else {
                //If it isn't the current player's turn, tell them they're waiting for player two
                $("#current-turn h4").text("Waiting for " +playerTwoData.name + " to choose.");
            }

            //Shows teal border around active player 
            $("#player2").css("border", "2px solid teal");
            $("#player1").css("border", "1px solid black");
        } else if (currentTurn === 3) {
            // Game win logic takes place, then resets to turn 1
            gameLogic(playerOneData.choice, playerTwoData.choice);

            //reveal both player choices 
            $("#player1-chosen").html("<h4>" + playerOneData.choice+ "</h4>");
            $("#player2-chosen").html("<h4>" + playerTwoData.choice + "</h4>");

            // reset after timeout
            var moveOn = function() {
                $("#player1-chosen").empty();
                $("#player2-chosen").empty();
                $("#result").empty();

                //check to make sure players didn't leave before timeout
                if (playerOneExists && playerTwoExists) {
                    currentTurnRef.set(1);
                }
            };
            // show results for 2 seconds, then resets
            setTimeout(moveOn, 3000);
        }else {
            $("#player1 ul").empty();
            $("#player2 ul").empty();
            $("#current-turn").html("<h4>Waiting for another player to join.</h4>");
            $("#player1").css("border", "1px solid black");
            $("#player2").css("border", "1px solid black");
        }
    }
});

//When a player joins, checks to see if there are two players now. If yes, then it will start the game 
playersRef.on("child_added", function(snapshot){
    if (currentPlayers === 1){
        //set turn to 1, which starts the game
        currentTurnRef.set(1)
    }
});


// Function for starting the game
function startGame() {
    //For adding disconnects to the chat with a unique id (the date/ time the user entered the game)
    //Needed because firebase's '.push()' creates its unique keys client side,
    // so you can't ".push()" in a ".onDisconnect"
    var chatDataDisc = database.ref("/chat/" + Date.now());

    //Checks for current players, if there's a player one connected, then the user becomes player 2 
    //If there is no player one, then the user becomes player 1 
    if (currentPlayers < 2) {
        if (playerOneExists) {
            playerNum = 2;
        }else{
            playerNum = 1;
        }

        //Creates key based on assigned player number
        playerRef = database.ref("/players/" +playerNum);

        //Creates player object. 'choice' is unnecessary here, but left in to be as complete as possible 
        playerRef.set({
            name: username,
            wins: 0,
            losses: 0,
            choice: null
        });

        //On disconnect, remove this user's player object
        playerRef.onDisconnect().remove();

        // If a user disconnects, set the current turn to "null" so the game does not continue
        currentTurnRef.onDisconnect().remove();

        //Send disconnect message to chat with Firebase server generated timestamp and id of "0" to denote system message 
        chatDataDisc.onDisconnect().set({
            name: username,
            time: firebase.database.ServerValue.TIMESTAMP,
            message: "has disconnected.",
            idNum: 0
        });

        // Remove name input box and show current player number 
        $("#game-status").empty();

        $("#game-status").append($("<h4>").text("Hi " + username + "! You are Player " +playerNum));
    }else {
        //If current players is "2", will not allow the player to join
        alert("Sorry, Game Full! Try Again Later!"); 
    }
}

// Game Logic to determine who will win and increments wins/ losses accordingly 
function gameLogic (player1choice, player2choice) {
    var playerOneWon = function (){
        $("#result").text(playerOneData.name + " Wins!");
        if (playerNum === 1) {
            playersRef
                .child("1")
                .child("wins")
                .set(playerOneData.wins +1);
            playersRef
                .child("2")
                .child("losses")
                .set(playerTwoData.losses + 1);
        }
    };

    var playerTwoWon = function() {
        $("#result").text(playerTwoData.name+ " Wins!");
        if (playerNum === 2) {
            playersRef
                .child("2")
                .child("wins")
                .set(playerTwoData.wins + 1);
            playersRef
                .child("1")
                .child("losses")
                .set(playerOneData.losses + 1);
        }
    };

    var tie = function() {
        $("#result").text("Tie Game!");
    };

    if (player1choice === "Rock" && player2choice === "Rock") {
        tie();
    }else if (player1choice === "Paper" && player2choice === "Paper"){
        tie();
    }else if (player1choice === "Scissors" && player2choice === "Scissors"){
        tie()
    }else if (player1choice === "Rock" && player2choice === "Paper"){
        playerTwoWon();
    }else if (player1choice === "Rock" && player2choice === "Scissors"){
        playerOneWon();
    }else if (player1choice === "Paper" && player2choice === "Rock") {
        playerOneWon();
    } else if (player1choice === "Paper" && player2choice === "Scissors") {
        playerTwoWon();
    } else if (player1choice === "Scissors" && player2choice === "Rock") {
        playerTwoWon();
    } else if (player1choice === "Scissors" && player2choice === "Paper") {
        playerOneWon();
    }
}
