const GET_URL = "";
const POST_URL = "";

const rows = document.querySelectorAll(".crossword-row");
const numberRows = rows.length;
const numberCols = rows[0].querySelectorAll(".crossword-cell").length;

/**
 * Direction:
 * 0 = horizontal (across)
 * 1 = vertical   (down)
 */
let direction = 0;
let focusedCell = { row: 0, col: 0 };

// Assign data attributes and set click listeners
rows.forEach((rowElem, rowIndex) => {
  const cells = rowElem.querySelectorAll(".crossword-cell");
  cells.forEach((cellElem, colIndex) => {
    cellElem.dataset.row = rowIndex;
    cellElem.dataset.col = colIndex;

    cellElem.addEventListener("click", () => {
      handleCellClick(rowIndex, colIndex);
    });
  });
});

/**
 * Handles cell clicks:
 * - If same cell, toggle direction.
 * - Otherwise, focus that cell.
 */
function handleCellClick(rowIndex, colIndex) {
  if (focusedCell.row === rowIndex && focusedCell.col === colIndex) {
    direction = 1 - direction; // toggle direction
  } else {
    focusedCell = { row: rowIndex, col: colIndex };
  }
  highlightGrid();
}

/**
 * Highlights the row or column of the focused cell,
 * and marks the focused cell with a special class.
 */
function highlightGrid() {
  // Clear existing highlights
  rows.forEach((rowElem) => {
    rowElem.querySelectorAll(".crossword-cell").forEach((cellElem) => {
      cellElem.classList.remove("crossword-cell-focused");
      cellElem.classList.remove("crossword-cell-highlighted");
    });
  });

  // Highlight entire row or column
  if (direction === 0) {
    // Horizontal
    const rowElem = rows[focusedCell.row];
    const cells = rowElem.querySelectorAll(".crossword-cell");
    cells.forEach((cell) => cell.classList.add("crossword-cell-highlighted"));
  } else {
    // Vertical
    for (let r = 0; r < numberRows; r++) {
      const rowElem = rows[r];
      const cell = rowElem.querySelectorAll(".crossword-cell")[focusedCell.col];
      cell.classList.add("crossword-cell-highlighted");
    }
  }

  // Mark the currently focused cell
  const focusRowElem = rows[focusedCell.row];
  const focusCell = focusRowElem.querySelectorAll(".crossword-cell")[focusedCell.col];
  focusCell.classList.add("crossword-cell-focused");
}

/** Check if pressed key is a letter (A-Z) */
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

/** Handle keydown events */
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (isLetter(key)) {
    placeLetter(key.toUpperCase());
    moveToNextCell();
    highlightGrid();
    event.preventDefault();
  } else if (key === "Backspace") {
    clearCurrentCell();
    moveToPreviousCell();
    highlightGrid();
    event.preventDefault();
  } else if (key === "Enter") {
    handleEnter();
    event.preventDefault();
  } else if (key === " ") {
    // Space toggles direction
    direction = 1 - direction;
    highlightGrid();
    event.preventDefault();
  } else if (key.startsWith("Arrow")) {
    handleArrows(key);
    highlightGrid();
    event.preventDefault();
  }
});

/**
 * Places a letter in the currently focused cell.
 */
function placeLetter(letter) {
  const rowElem = rows[focusedCell.row];
  const cell = rowElem.querySelectorAll(".crossword-cell")[focusedCell.col];
  cell.textContent = letter;
}

/**
 * Clears the letter in the currently focused cell.
 */
function clearCurrentCell() {
  const rowElem = rows[focusedCell.row];
  const cell = rowElem.querySelectorAll(".crossword-cell")[focusedCell.col];
  cell.textContent = "";  // or a space if you prefer
}

/**
 * Move focus to the next cell in the current direction (if possible).
 */
function moveToNextCell() {
  if (direction === 0) {
    // Horizontal
    if (focusedCell.col < numberCols - 1) {
      focusedCell.col++;
    }
  } else {
    // Vertical
    if (focusedCell.row < numberRows - 1) {
      focusedCell.row++;
    }
  }
}

/**
 * Move focus to the previous cell in the current direction (if possible).
 */
function moveToPreviousCell() {
  if (direction === 0) {
    // Horizontal
    if (focusedCell.col > 0) {
      focusedCell.col--;
    }
  } else {
    // Vertical
    if (focusedCell.row > 0) {
      focusedCell.row--;
    }
  }
}

/**
 * Handle arrow key navigation.
 */
function handleArrows(arrowKey) {
  if (arrowKey === "ArrowUp" && focusedCell.row > 0) {
    focusedCell.row--;
  } else if (arrowKey === "ArrowDown" && focusedCell.row < numberRows - 1) {
    focusedCell.row++;
  } else if (arrowKey === "ArrowLeft" && focusedCell.col > 0) {
    focusedCell.col--;
  } else if (arrowKey === "ArrowRight" && focusedCell.col < numberCols - 1) {
    focusedCell.col++;
  }
}

/**
 * Handle the Enter key:
 * - If direction is horizontal, move to next row (first column).
 * - If direction is vertical, move to next column (first row).
 * - If there are no more rows/columns, toggle direction
 *   and move to the top-left cell (0, 0).
 */
function handleEnter() {
  if (direction === 0) {
    // Horizontal: move down one row, col = 0
    if (focusedCell.row < numberRows - 1) {
      focusedCell.row++;
      focusedCell.col = 0;
    } else {
      // No more rows, switch to vertical and go to top-left
      direction = 1;
      focusedCell = { row: 0, col: 0 };
    }
  } else {
    // Vertical: move right one column, row = 0
    if (focusedCell.col < numberCols - 1) {
      focusedCell.col++;
      focusedCell.row = 0;
    } else {
      // No more columns, switch to horizontal and go to top-left
      direction = 0;
      focusedCell = { row: 0, col: 0 };
    }
  }
  highlightGrid();
}

// Initialize
highlightGrid();
