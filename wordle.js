const GET_URL = "https://words.dev-apis.com/word-of-the-day?random=1";
const POST_URL = "https://words.dev-apis.com/validate-word"
const NUMBER_LETTERS = 5;
const NUMBER_ROWS = 6;
let currentWord;

const rows = document.querySelectorAll(".word-row");
const loader = document.querySelector(".loader-gif");
const alert = document.querySelector(".alert-wrapper");
let focusRow = 0;
let buffer = "";
let busy = false;

async function initializeWord() {
    const promise = await fetch(GET_URL);
    const processedResponse = await promise.json();
    currentWord = processedResponse.word;
}

async function tryWord(word) {
    const promise = await fetch(POST_URL, {method: "POST", body: JSON.stringify({"word": word})});
    const processedResponse = await promise.json();
    return processedResponse.validWord
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function handleLetter(letter) {
    if (buffer.length < NUMBER_LETTERS) {
        buffer += letter;
    }
}

function handleBackspace() {
    if (buffer.length > 0) {
        buffer = buffer.slice(0, -1);
    }
}

function handleEnter() {
    if (buffer.length == 5 && !busy) {
        busy = true
        tryWord(buffer).then(function (response) {
            if (response) {
                checkGuess(buffer);
            } else {
                wrongAnimation();
            }
            busy = false;
        });
    }
}

function checkGuess(guess) {
    wordCharList = currentWord.split("");

    // first check the greens and remove from the letter list
    for (let i = 0; i < NUMBER_LETTERS; i++) {
        if (guess[i] == currentWord[i]) {
            rows[focusRow].children[i].classList.add("guessed-green");
            // remove letter from list
            const index = wordCharList.indexOf(guess[i]);
            if (index > -1) {
                wordCharList.splice(index, 1);
            }
        }
    }

    // then check the rest
    for (let i = 0; i < NUMBER_LETTERS; i++) {
        if (guess[i] == currentWord[i]) {
            // do nothing
        } else if (wordCharList.includes(guess[i])) {
            rows[focusRow].children[i].classList.add("guessed-yellow");
            // remove from list
            const index = wordCharList.indexOf(guess[i]);
            if (index > -1) {
                wordCharList.splice(index, 1);
            }
        } else {
            rows[focusRow].children[i].classList.add("guessed-grey");
        }
    }

    buffer = ""
    focusRow++;

    if (guess === currentWord) {
        handleGameEnd(true);
    } else if (focusRow >= NUMBER_ROWS) {
        handleGameEnd(false);
    }
}

function handleGameEnd(won) {
    const cells = rows[focusRow - 1].children;
    let animationsCompleted = 0;

    for (let cell of cells) {
        cell.addEventListener("animationend", function onAnimationEnd() {
            animationsCompleted++;
            cell.removeEventListener("animationend", onAnimationEnd);

            // Check if all animations have finished
            if (animationsCompleted === NUMBER_LETTERS) {
                if (won) {
                    displayAlert("🎉 You won! 🎉");
                } else {
                    displayAlert("You lost. The word was: " + currentWord.toUpperCase());
                }
            }
        });
    }
}

function resetGame() {
    for (let i = 0; i < NUMBER_ROWS; i++) {
        for (let j = 0; j < NUMBER_LETTERS; j++) {
            rows[i].children[j].textContent = "";
            rows[i].children[j].classList.remove("guessed-green", "guessed-yellow", "guessed-grey");
        }
    }
    buffer = "";
    focusRow = 0;
}

function rerender() {
    for (let i = 0; i < NUMBER_LETTERS; i++) {
        if (i < buffer.length) {
            rows[focusRow].children[i].textContent = buffer[i];
        } else {
            rows[focusRow].children[i].textContent = "";
        }
    }
}

function wrongAnimation() {
    const currentRow = rows[focusRow];
    for (let i = 0; i < NUMBER_LETTERS; i++) {
        const cell = currentRow.children[i];
        cell.classList.add("wrong");

        // Remove the animation class after it ends
        cell.addEventListener("animationend", function() {
            cell.classList.remove("wrong");
        }, { once: true });
    }
}

function displayAlert(text) {
    alertText = alert.querySelector(".alert-text");
    alert.style.display = "flex";
    alertText.textContent = text;
}

initializeWord();

document
    .addEventListener("keydown", function (event) {
    const key = event.key
    if (isLetter(key)) {
        handleLetter(key);
    } else if (key == "Backspace") {
        handleBackspace();
    } else if (key == "Enter") {
        handleEnter();
    } else {
        event.preventDefault();
    }
    rerender();
});

alertButton = alert.querySelector(".alert-button");

alertButton.addEventListener("click", function () {
    resetGame();
    initializeWord();

    alert.style.display = "none";
});