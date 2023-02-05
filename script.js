/**
 * Variables
 */

const numberButtons = document.querySelectorAll('.number');
const screen = document.querySelector('.output');
const specialButtons = document.querySelectorAll('.special');
const operatorButtons = document.querySelectorAll('.operator');
const decimalButton = document.querySelector('.decimal');
const equalsButton = document.querySelector('.equals');

const maxLengthOfNumbersOnDisplay = 10;
let needToClearDisplay = false;   //toggles when an operator has been selected vs when a user has inputted numbers
let noDecimalOnDisplay = true;
let shiftHeld = false;
let selectedOperator;
let firstNumber;
let secondNumber;


/**
 * Numbers
 */

numberButtons.forEach(number => {
    number.addEventListener('click', () => {
        updateDisplay(number.innerHTML);
        number.blur();
    })
});

// If an operator btn was just selected, or the display is 0, will override the number. Otherwise, will expand the number.
function updateDisplay(num) {
    if (screen.innerHTML == 0 && noDecimalOnDisplay === true || needToClearDisplay) {
        screen.innerHTML = num;
        needToClearDisplay = false;
    } else if (screen.innerHTML.length > maxLengthOfNumbersOnDisplay) {
            let longDisplay = +screen.innerHTML + +num
            screen.innerHTML = toScientificNotation(longDisplay, maxLengthOfNumbersOnDisplay);
    } else {
        screen.innerHTML += num;
    };
};


/**
 * Decimals
 */

// Adds decimal point, allowing users to click decimal without a 0, and not allowing them to insert multiple decimals
function addDecimalPoint() {
    if (noDecimalOnDisplay && needToClearDisplay === false) {
        screen.innerHTML += '.';
        noDecimalOnDisplay = false;
    } else {
        screen.innerHTML = '0.';
        noDecimalOnDisplay = needToClearDisplay = false;
    }
}

decimalButton.addEventListener('click', () => {
    addDecimalPoint();
});


/**
 * Operators
 */

// Displays results on the screen when operator btn is pressed, and refreshs variables for future calculations.
// User can change what operator they are using mid-calculation
function evaluateOperatorButton(operator) {
    if (firstNumber === undefined || selectedOperator === 'equals') {
        firstNumber = screen.innerHTML;
    } else if (secondNumber === undefined && needToClearDisplay === false) {
        secondNumber = screen.innerHTML;
        let result = operate(selectedOperator, +firstNumber, +secondNumber);
        screen.innerHTML = result; 
        firstNumber = result;
        secondNumber = undefined;
    }
    selectedOperator = operator;
    needToClearDisplay = noDecimalOnDisplay = true;
}

operatorButtons.forEach(operator => {
    operator.addEventListener('click', () => {
        evaluateOperatorButton(operator.classList[1])
        operator.blur();
    })
});


/**
 * Calculations
 */

// Displays the results of the last operator btn pressed, and refreshs variables for future calculations
// User can immediately do another operation based on the results from the last calculation
function actionEqualsButton() {
    secondNumber = screen.innerHTML;
    screen.innerHTML = operate(selectedOperator, +firstNumber, +secondNumber);
    needToClearDisplay = noDecimalOnDisplay = true;
    firstNumber = undefined;
    selectedOperator = 'equals'; 
}

equalsButton.addEventListener('click', (e) => {
    actionEqualsButton()
    equalsButton.blur();
});
   
// Calculate functions, and catches divide by 0 error
function operate(operator, num1, num2) {
    let result; 

    switch (operator) {
        case 'addition':
            result = num1 + num2;
            break;
        case 'subtract':
            result = num1 - num2;
            break;
        case 'multiply':
            result = num1 * num2;
            break;
        case 'divide':
            num2 === 0 ? result = 'Nope' : result = num1 / num2;       
            break;
        default:
            result = screen.innerHTML;
            break;    
    }
    
    if (noDecimalOnDisplay === false) {
        return roundNumbers(result, maxLengthOfNumbersOnDisplay - 5);
    } else if (String(result).length > maxLengthOfNumbersOnDisplay) {
        return toScientificNotation(result, maxLengthOfNumbersOnDisplay);
    } else {
        return result;
    }  
};


/**
 * Number Formatting
 */

// Round decimal points, to keep number length to under max digits, and to avoid floating point errors
function roundNumbers(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

// Stops numbers from overflowing
function toScientificNotation(value, decimals) {
    return Number.parseFloat(value).toExponential(decimals);
};


/**
 * Special Buttons
 */

function actionSpecialButton(buttonClass) {
    let currentNumber;
    switch (buttonClass) {
        case 'clear':
            firstNumber = secondNumber = selectedOperator = undefined;
            needToClearDisplay = noDecimalOnDisplay = true;
            screen.innerHTML = 0;
            break;
        case 'toggle':
            currentNumber = screen.innerHTML;
            screen.innerHTML = currentNumber > 0 ? currentNumber * -1 : Math.abs(currentNumber);
            break;
        case 'backspace':
            if (needToClearDisplay === false) {
                currentNumber = screen.innerHTML;
                currentNumber = currentNumber.slice(0, -1)
                screen.innerHTML = currentNumber == '' ? 0 : currentNumber
            }
            break;
    }
}

specialButtons.forEach(button => {
    button.addEventListener('click', () => {
        actionSpecialButton(button.classList[1]);
        button.blur();
    })
}); 

/**
 * Keyboard Functionality
 */

window.addEventListener('keydown', (e) => {
    let checkIfNumber = e.code.slice(-1);
    if (e.shiftKey) {
        switch (e.code) {
            case 'Equal':
                evaluateOperatorButton('addition');
                break;
            case 'Digit8':
                evaluateOperatorButton('multiply');
                break;
            case 'KeyC':
                actionSpecialButton('clear');
                break;                
        };
    } else if (+checkIfNumber || checkIfNumber == 0) {
        updateDisplay(checkIfNumber);
    } else {
        switch (e.code) {
            case 'NumpadDivide':
            case 'Slash':
                evaluateOperatorButton('divide');
                break;
            case 'NumpadMultiply':
                evaluateOperatorButton('multiply');
                break;
            case 'NumpadSubtract':
            case 'Minus':
                evaluateOperatorButton('subtract');
                break;
            case 'NumpadAdd':
                evaluateOperatorButton('addition');
                break;
            case 'NumpadDecimal':
            case 'Period':
                addDecimalPoint();
                break;
            case 'Equal':
            case 'NumpadEnter':
            case 'Enter':
                actionEqualsButton();
                break;
            case 'Backspace':
                actionSpecialButton('backspace');
                break;
            case 'KeyC':
                actionSpecialButton('clear');
                break;
            case 'F9':
                actionSpecialButton('toggle');
                break;
        };
    };
});