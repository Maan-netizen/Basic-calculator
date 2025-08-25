document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.btn');
    
    let currentExpression = '0'; // Stores the full expression string
    let awaitingNewInput = false; // Flag to indicate if the next number should clear the display

    // Helper to update the display safely
    function updateDisplay(value) {
        display.value = value;
    }

    // Resets the calculator to its initial state
    function clearAll() {
        currentExpression = '0';
        awaitingNewInput = false;
        updateDisplay(currentExpression);
    }

    // Deletes the last character from the expression
    function deleteLast() {
        if (currentExpression === 'Error') {
            clearAll();
            return;
        }
        if (currentExpression.length > 1) {
            currentExpression = currentExpression.slice(0, -1);
        } else {
            currentExpression = '0'; // If only one char or empty, reset to '0'
        }
        updateDisplay(currentExpression);
        awaitingNewInput = false; // Allow further input
    }

    // Appends a number or decimal point to the current expression
    function appendNumber(number) {
        if (currentExpression === 'Error') {
            currentExpression = number;
            awaitingNewInput = false;
        } else if (awaitingNewInput) {
            currentExpression = number;
            awaitingNewInput = false;
        } else {
            // Prevent multiple decimal points in a single number
            if (number === '.' && currentExpression.split(/[+\-*/%]/).pop().includes('.')) {
                return;
            }
            // Replace initial '0' if it's not followed by a decimal point
            if (currentExpression === '0' && number !== '.') {
                currentExpression = number;
            } else {
                currentExpression += number;
            }
        }
        updateDisplay(currentExpression);
    }

    // Appends an operator to the current expression
    function appendOperator(op) {
        if (currentExpression === 'Error') {
            currentExpression = '0';
        }
        // If the last character is an operator, replace it with the new one
        if (currentExpression.match(/[+\-*/]$/)) { // Only consider standard operators
            currentExpression = currentExpression.slice(0, -1) + op;
        } else if (currentExpression.match(/%$/)) { // If last is %, treat as expression completion, then add operator
             currentExpression += op;
        } else {
            currentExpression += op;
        }
        awaitingNewInput = false;
        updateDisplay(currentExpression);
    }

    // Handles the percentage operation
    function handlePercentage() {
        if (currentExpression === 'Error') {
            currentExpression = '0';
            updateDisplay(currentExpression);
            return;
        }
        try {
            // Regex to find the last number in the expression, including decimals and negatives
            const numPattern = '(-?(?:\\d+(?:\\.\\d*)?|\\.\\d+))';
            const lastNumberMatch = currentExpression.match(new RegExp(`${numPattern}$`));
            
            if (lastNumberMatch) {
                const lastNumber = parseFloat(lastNumberMatch[1]);
                const percentageValue = lastNumber / 100;
                currentExpression = currentExpression.slice(0, lastNumberMatch.index) + percentageValue.toString();
                updateDisplay(currentExpression);
            } else if (currentExpression === '0') {
                // If only '0', percentage is still '0'
                currentExpression = '0';
                updateDisplay(currentExpression);
            }
        } catch (e) {
            currentExpression = 'Error';
            updateDisplay('Error');
        }
        awaitingNewInput = false;
    }

    // Evaluates the expression respecting BODMAS/BIDMAS
    function evaluateExpression() {
        if (currentExpression === 'Error') {
            currentExpression = '0';
            updateDisplay(currentExpression);
            return;
        }

        let expressionToEvaluate = currentExpression;
        expressionToEvaluate = expressionToEvaluate.replace(/×/g, '*').replace(/÷/g, '/');

        // Regex for numbers, including negative, decimal, and leading decimal
        const numPattern = '(-?(?:\\d+(?:\\.\\d*)?|\\.\\d+))';

        try {
            // Step 1: Evaluate Multiplication and Division
            while (expressionToEvaluate.match(new RegExp(`${numPattern}\\s*([*/])\\s*${numPattern}`))) {
                expressionToEvaluate = expressionToEvaluate.replace(new RegExp(`${numPattern}\\s*([*/])\\s*${numPattern}`), (match, num1Str, op, num2Str) => {
                    const num1 = parseFloat(num1Str);
                    const num2 = parseFloat(num2Str);
                    if (op === '/' && num2 === 0) {
                        throw new Error('Division by zero');
                    }
                    const result = op === '*' ? num1 * num2 : num1 / num2;
                    return result.toString();
                });
            }

            // Step 2: Evaluate Addition and Subtraction
            while (expressionToEvaluate.match(new RegExp(`${numPattern}\\s*([+\\-])\\s*${numPattern}`))) {
                expressionToEvaluate = expressionToEvaluate.replace(new RegExp(`${numPattern}\\s*([+\\-])\\s*${numPattern}`), (match, num1Str, op, num2Str) => {
                    const num1 = parseFloat(num1Str);
                    const num2 = parseFloat(num2Str);
                    const result = op === '+' ? num1 + num2 : num1 - num2;
                    return result.toString();
                });
            }

            // Final check for leading/trailing operators after evaluation.
            // If the expression now starts or ends with an operator, it's malformed or incomplete.
            if (expressionToEvaluate.match(/^[+\-*/]/) || expressionToEvaluate.match(/[+\-*/]$/)) {
                 throw new Error('Invalid Expression');
            }

            let finalResult = parseFloat(expressionToEvaluate);

            // Handle floating point precision issues
            finalResult = parseFloat(finalResult.toFixed(10));

            currentExpression = finalResult.toString();
            updateDisplay(currentExpression);
            awaitingNewInput = true; // Next number input should start a new calculation
        } catch (error) {
            if (error.message === 'Division by zero') {
                currentExpression = 'Error';
                updateDisplay('Error: Div by 0');
            } else if (error.message === 'Invalid Expression') {
                 currentExpression = 'Error';
                 updateDisplay('Error: Invalid Exp');
            } else {
                currentExpression = 'Error';
                updateDisplay('Error');
            }
            awaitingNewInput = true;
        }
    }

    // Event listener for button clicks
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.dataset.value;
            const action = button.dataset.action;

            if (action === 'clear') {
                clearAll();
            } else if (action === 'delete') {
                deleteLast();
            } else if (action === 'calculate') {
                evaluateExpression();
            } else if (button.classList.contains('number') || value === '.') {
                appendNumber(value);
            } else if (button.classList.contains('operator')) {
                if (value === '%') {
                    handlePercentage();
                } else {
                    appendOperator(value);
                }
            }
        });
    });

    // Event listener for keyboard input
    document.addEventListener('keydown', (event) => {
        const key = event.key;

        if (!isNaN(parseFloat(key))) { // Numbers
            event.preventDefault(); 
            appendNumber(key);
        } else if (key === '.') { // Decimal point
            event.preventDefault();
            appendNumber(key);
        } else if (['+', '-', '*', '/'].includes(key)) { // Standard operators
            event.preventDefault();
            appendOperator(key);
        } else if (key === 'Enter') { // Equals
            event.preventDefault();
            evaluateExpression();
        } else if (key === 'Backspace') { // Delete
            event.preventDefault();
            deleteLast();
        } else if (key === 'Escape') { // Clear
            event.preventDefault();
            clearAll();
        } else if (key === '%') { // Percentage
            event.preventDefault();
            handlePercentage();
        }
    });

    // Initialize display on load
    clearAll();
});