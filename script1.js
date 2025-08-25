// Get the display element
const display = document.getElementById('display');
// Get all calculator buttons
const buttons = document.querySelectorAll('.btn');

// Initialize variables for calculator logic
let currentInput = '';      // Stores the current number being entered
let operator = null;        // Stores the selected arithmetic operator
let previousInput = '';     // Stores the first operand in a calculation
let equalsPressed = false;  // Flag to check if equals was pressed

// Function to reset the calculator
function clearCalculator() {
    currentInput = '';
    operator = null;
    previousInput = '';
    equalsPressed = false;
    display.value = '0'; // Set display to '0' on clear
}

// Function to handle number input
function handleNumber(number) {
    // If equals was just pressed, start a new calculation
    if (equalsPressed) {
        currentInput = number;
        equalsPressed = false;
    } else {
        // Prevent multiple leading zeros or multiple decimal points
        if (number === '0' && currentInput === '0') return;
        if (number === '.' && currentInput.includes('.')) return;
        if (currentInput === '0' && number !== '.') {
            currentInput = number; // Replace leading '0' with new number
        } else {
            currentInput += number; // Append number
        }
    }
    display.value = currentInput; // Update display
}

// Function to handle operator input
function handleOperator(nextOperator) {
    if (currentInput === '' && previousInput === '') return; // No input yet

    equalsPressed = false; // Reset equals flag

    // If there's a current input and no previous input, store it as previous
    if (currentInput !== '' && previousInput === '') {
        previousInput = currentInput;
        currentInput = '';
        operator = nextOperator;
    }
    // If there's already a previous input and operator, calculate first, then apply new operator
    else if (currentInput !== '' && previousInput !== '' && operator !== null) {
        calculate(); // Perform previous calculation
        operator = nextOperator; // Set new operator
        currentInput = ''; // Clear current input for next number
    }
    // If an operator is pressed again after setting a previous number, just update the operator
    else if (currentInput === '' && previousInput !== '') {
        operator = nextOperator;
    }
}

// Function to perform the calculation
function calculate() {
    if (previousInput === '' || currentInput === '' || operator === null) {
        return; // Not enough information to calculate
    }

    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    // Perform the operation based on the stored operator
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                display.value = 'Error: Division by zero';
                clearCalculator(); // Reset calculator on error
                return;
            }
            result = prev / current;
            break;
        case '%': // Percentage calculation: current is percentage of prev
            result = prev * (current / 100);
            break;
        default:
            return;
    }

    // Update display with the result
    // To handle potential floating point inaccuracies, round to a reasonable number of decimal places
    display.value = parseFloat(result.toFixed(10));
    previousInput = display.value; // Store result as previous for chained operations
    currentInput = '';           // Clear current input
    operator = null;             // Clear operator
    equalsPressed = true;        // Set flag that equals was pressed
}

// Function to toggle positive/negative sign
function toggleSign() {
    if (currentInput !== '') {
        currentInput = (parseFloat(currentInput) * -1).toString();
        display.value = currentInput;
    } else if (previousInput !== '' && equalsPressed) {
        previousInput = (parseFloat(previousInput) * -1).toString();
        display.value = previousInput;
    }
}

// Event listener for button clicks
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.dataset.value; // Get the value from data-value attribute

        if (!isNaN(parseFloat(value)) || value === '.') {
            handleNumber(value);
        } else if (['+', '-', '*', '/'].includes(value)) {
            handleOperator(value);
        } else if (value === '=') {
            calculate();
        } else if (value === 'C') {
            clearCalculator();
        } else if (value === '+/-') {
            toggleSign();
        } else if (value === '%') {
            // If there's a current input, treat it as a percentage of itself (e.g., 50% = 0.5)
            // Or if there's a previous input and current input, treat current as % of previous
            if (currentInput !== '') {
                // If only a number is entered, pressing % will divide it by 100
                if (previousInput === '') {
                    currentInput = (parseFloat(currentInput) / 100).toString();
                    display.value = currentInput;
                } else {
                    // If an operator is pending (e.g., 100 + 50%), calculate 50% of 100
                    handleOperator('%'); // Use '%' as an operator to signify percentage of previous
                    calculate();
                }
            } else if (previousInput !== '' && equalsPressed) { // If result is on display
                 previousInput = (parseFloat(previousInput) / 100).toString();
                 display.value = previousInput;
            }
        }
    });
});

// Event listener for keyboard input
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (!isNaN(parseFloat(key)) || key === '.') { // Numbers and decimal
        handleNumber(key);
    } else if (['+', '-', '*', '/'].includes(key)) { // Operators
        handleOperator(key);
    } else if (key === 'Enter' || key === '=') { // Equals
        event.preventDefault(); // Prevent default Enter key behavior (e.g., submitting forms)
        calculate();
    } else if (key === 'Escape') { // Clear with Escape
        clearCalculator();
    } else if (key === 'Backspace') { // Delete last character with Backspace
        event.preventDefault(); // Prevent default Backspace behavior (e.g., navigating back)
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            display.value = currentInput === '' ? '0' : currentInput;
        }
    }
});

// Initialize display on load
window.onload = clearCalculator;
