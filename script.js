const display = document.getElementById("display");
const historyContainer = document.getElementById("history"); // Make a div in HTML for history

// Append numbers/operators to display safely
function appendToDisplay(input) {
    const lastChar = display.value.slice(-1);

    // Prevent double operators like ++, --, xx, **, ^^
    if ("+-x/*^".includes(lastChar) && "+x/*^".includes(input)) {
        return;
    }

    // Prevent starting with an operator
    if (display.value === "" && "+x/*^".includes(input)) return;

    // Clear "Error" before appending
    if (display.value === "Error") display.value = "";

    display.value += input;
}

// Clear display
function clearDisplay() {
    display.value = "";
}

// Backspace
function backspace() {
    display.value = display.value.slice(0, -1);
}

// Calculate expression safely with % support
function calculate() {
    try {
        if (display.value === "") return;

        let expression = display.value;

        // Convert operators to JS-compatible symbols
        expression = expression
            .replace(/x/g, "*")   // multiply
            .replace(/\^/g, "**"); // power

        // Handle percentages: replace 10% with (10/100)
        // Matches numbers followed by %
        expression = expression.replace(/(\d+(\.\d+)?)%/g, "($1/100)");

        // Prevent expression ending with an operator
        if (/[+\-*/.]$/.test(expression)) {
            display.value = "Error";
            return;
        }

        const result = new Function("return " + expression)();

        if (!isFinite(result)) {
            display.value = "Error";
            return;
        }

        addToHistory(display.value + " = " + result);
        display.value = result;

    } catch {
        display.value = "Error";
    }
}

// Add entry to history (only unique results)
function addToHistory(entry) {
    if (!historyContainer) return;

    const newResult = entry.split("=").pop().trim();

    const items = historyContainer.querySelectorAll("p");
    for (let item of items) {
        const existingResult = item.textContent.split("=").pop().trim();
        if (existingResult === newResult) {
            return; // same answer already exists → stop
        }
    }

    const p = document.createElement("p");
    p.textContent = entry;
    historyContainer.prepend(p); // newest on top

    // Optional: limit history to 10 items
    if (historyContainer.childElementCount > 10) {
        historyContainer.removeChild(historyContainer.lastChild);
    }
}

// Button click handler
document.querySelectorAll(".btn").forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContent;

        if (value === "C") {
            clearDisplay();
        } else if (value === "⌫") {
            backspace();
        } else if (value === "=") {
            calculate();
        } else {
            appendToDisplay(value);
        }
    });
});

// Optional: keyboard support
document.addEventListener("keydown", (e) => {
    if ("0123456789+-*/.^%".includes(e.key)) appendToDisplay(e.key);
    else if (e.key === "Enter") calculate();
    else if (e.key === "Backspace") backspace();
    else if (e.key.toLowerCase() === "c") clearDisplay();
});
