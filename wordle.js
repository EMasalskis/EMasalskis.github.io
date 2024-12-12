const GET_URL = "https://words.dev-apis.com/word-of-the-day";
const POST_URL = "https://words.dev-apis.com/validate-word"
const NUMBER_LETTERS = 5;
const NUMBER_ROWS = 6;
let WORD;

const rows = document.querySelectorAll(".word-row");
let focusRow = 0;
let buffer = "";

async function initializeWord() {
    const promise = await fetch(GET_URL);
    const processedResponse = await promise.json();
    WORD = processedResponse.word;
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
    if (buffer.length == 5) {
        tryWord(buffer).then(function (response) {
            if (response) {
                checkGuess(buffer);
            } else {
                console.log(buffer + " is not a valid word!");
            }
        });
    }
}

function checkGuess(guess) {
    wordCharList = WORD.split("");

    // first check the greens and remove from the letter list
    for (let i = 0; i < NUMBER_LETTERS; i++) {
        if (guess[i] == WORD[i]) {
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
        if (guess[i] == WORD[i]) {
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

    if (buffer == WORD) {
        alert("You guessed today's word!");
        buffer = ""
        focusRow = 0
    }

    if (focusRow >= NUMBER_ROWS - 1) {
        alert("You guessed today's word!");
        buffer = ""
        focusRow = 0
    }

    buffer = ""
    focusRow++;
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