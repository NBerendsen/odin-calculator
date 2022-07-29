math = {

  add: function(a, b) {
    return a + b;
  },

  subtract: function(a, b) {
    return a - b;
  },

  multiply: function(a, b) {
    return a * b;
  },

  divide: function(a, b) {
    return a / b;
  }
}

calculator = {

  stateEnum: Object.freeze({
    CLEARED: 0,
    FIRST: 1,
    OP: 2,
    SECOND: 3,
    EQUALS: 4,
  }),

  truncate: function(value) {

    let valueStr = String(value);
    if (valueStr.length <= 9 || value == NaN) { return value; }

    if (value > 10000000) {
      return value.toExponential(2);
    } else {
      // floating number under 10,000,000
      let numDecimals = String(value).split('.')[1].length;
      return calculator.truncate(Number(value.toFixed(numDecimals - 1)));
    }
  },

  operate: function(op, a, b) {
    let returnValue;
    switch (op) {
      case '+':
        returnValue = math.add(a,b);
        break;
      case '-':
        returnValue = math.subtract(a,b);
        break;
      case '*':
        returnValue = math.multiply(a,b);
        break;
      case '÷':
        returnValue = math.divide(a,b);
        break;
      default:
        returnValue = NaN;
        break;
    }

    return calculator.truncate(returnValue);
  },
}

input = {

  keyCodeMap: Object.freeze({
    8   : 'undo',
    13  : 'equal',
    16  : '+/-',
    46  : 'clear',
    96  : '0',
    97  : '1',
    98  : '2',
    99  : '3',
    100 : '4',
    101 : '5',
    102 : '6',
    103 : '7',
    104 : '8',
    105 : '9',
    106 : '*',
    107 : '+',
    109 : '-',
    110 : '.',
    111 : '÷'
  }),

  isNumber: function (input) {
    return (Number(input) >= 0 &&  Number(input) <= 9);
  },

  isOperand: function (input) {
    return (input === '+' || input === '-' || input === '*' || input === '÷');
  },

  isEquals: function (input) {
    return (input == 'equal');
  },

  isClear: function (input) {
    return (input == 'clear');
  },

  isNegate: function (input) {
    return (input == '+/-');
  },
  
  isPeriod: function (input) {
    return (input == '.');
  },

  isUndo: function (input) {
    return (input == 'undo');
  }
}

let myglobal;
let displayNumber = 0;
let operand_1;
let operand_2;
let operator;
let state = calculator.stateEnum.CLEARED;
let activeOperator;

function clear() {
  state = calculator.stateEnum.CLEARED;
  operand_1 = '';
  operand_2 = '';
  operator = '';
  displayNumber = 0;
}

function updateDisplay() {

  const display = document.querySelector('#display');

  display.innerText = displayNumber;
}

function toggleOpSelect(keyCode) {
  
  if (input.isOperand(activeOperator)) {
    let activeKeyCode = Object.keys(input.keyCodeMap).filter(key => input.keyCodeMap[key] === activeOperator);
    const button = document.querySelector(`.button_[data-key="${activeKeyCode}"]`);
    button.classList.remove('active');
    activeOperator = '';
  }

  if (input.isOperand(input.keyCodeMap[keyCode])){
    const button = document.querySelector(`.button_[data-key="${keyCode}"]`);
    button.classList.add('active');
    activeOperator = input.keyCodeMap[keyCode];
  }
}

function error() {
  const display = document.querySelector('#display');

  display.classList.add('error');
}

function processNumber(num) {
  if (state == calculator.stateEnum.CLEARED) {
    displayNumber = num;
    state = calculator.stateEnum.FIRST;
  } else if (state == calculator.stateEnum.FIRST || state == calculator.stateEnum.SECOND) {
    if (displayNumber.length < 9) {
      displayNumber += num;
    }
  } else if (state == calculator.stateEnum.OP) {
    displayNumber = num;
    state = calculator.stateEnum.SECOND;
  } else if (state == calculator.stateEnum.EQUALS) {
    clear();
    displayNumber = num;
    state = calculator.stateEnum.FIRST;
  }
}

function processOperand(op) {
  if (state == calculator.stateEnum.FIRST) {
    operand_1 = displayNumber;
    operator = op;
    state = calculator.stateEnum.OP;
  } else if (state == calculator.stateEnum.OP) {
    operator = op;
  } else if (state == calculator.stateEnum.CLEARED) {
    operand_1 = '0';
    displayNumber = operand_1;
    operator = op;
    state = calculator.stateEnum.OP;
    // if (op == '-') {
    //   displayNumber = op;
    //   state = calculator.stateEnum.FIRST;
    // }
  } else if (state == calculator.stateEnum.EQUALS) {
    operand_1 = displayNumber;
    operator = op;
    state = calculator.stateEnum.OP;
  } else if (state == calculator.stateEnum.SECOND) {
    operand_2 = displayNumber;
    operand_1 = String(calculator.operate(operator, Number(operand_1), Number(operand_2)));
    operator = op;
    displayNumber = operand_1;
    state = calculator.stateEnum.OP;
  }
}

function processEquals() {
  if (state == calculator.stateEnum.SECOND) {
    operand_2 = displayNumber;
    displayNumber = String(calculator.operate(operator, Number(operand_1), Number(operand_2)));
    state = calculator.stateEnum.EQUALS;
  } else if (state == calculator.stateEnum.OP) {
    operand_2 = operand_1;
    displayNumber = String(calculator.operate(operator, Number(operand_1), Number(operand_2)));
    state = calculator.stateEnum.EQUALS;
  } else if (state == calculator.stateEnum.EQUALS) {
    operand_1 = displayNumber;
    displayNumber = String(calculator.operate(operator, Number(operand_1), Number(operand_2)));
  }
}

function processClear() {
  clear();
}

function processNegate() {
  if (state == calculator.stateEnum.FIRST || state == calculator.stateEnum.SECOND || state == calculator.stateEnum.EQUALS) {
    if (displayNumber[0] == '-') {
      displayNumber = displayNumber.slice(1);
    } else {
      displayNumber = '-' + displayNumber;
    }
  }
}

function processPeriod() {
  if (state == calculator.stateEnum.FIRST || state == calculator.stateEnum.SECOND) {
    if (!displayNumber.includes('.')) {
      displayNumber = displayNumber + '.';
    }
  } else if (state == calculator.stateEnum.CLEARED || state == calculator.stateEnum.EQUALS) {
    clear();
    displayNumber = '0.';
    state = calculator.stateEnum.FIRST;
  } else if (state == calculator.stateEnum.OP) {
    displayNumber = '0.';
    state = calculator.stateEnum.SECOND;
  }
}

function processUndo() {
  console.log(`state: ${state} active: ${displayNumber}`);
  if (state == calculator.stateEnum.FIRST || state == calculator.stateEnum.SECOND) {
    let activeNumberLength = displayNumber.length
    if (activeNumberLength > 0) {
      displayNumber = displayNumber.slice(0, activeNumberLength - 1);

    }
  } else if (state == calculator.stateEnum.OP) {
    operator = '';
    state = calculator.stateEnum.FIRST;
  }
}

function parseKeyCode(keyCode) {

  let key = input.keyCodeMap[keyCode];

  if (input.isNumber(key)) {
    processNumber(key);
  } else if (input.isOperand(key)) {
    processOperand(key);
  } else if (input.isEquals(key)) {
    processEquals();
  } else if (input.isClear(key)) {
    processClear();
  } else if (input.isNegate(key)) {
    processNegate();
  } else if (input.isPeriod(key)) {
    processPeriod();
  } else if (input.isUndo(key)) {
    processUndo();
  }

  toggleOpSelect(keyCode);
  updateDisplay();
}

function processButtonPress(e) {

  let keyCode;
  if (e.type == "keydown") {
    keyCode = e.keyCode
  } else if (e.type == "click") {
    keyCode = e.target.dataset.key;
    e.target.blur();
  }

  if (!(keyCode in input.keyCodeMap)) { return; }

  const button = document.querySelector(`.button_[data-key="${keyCode}"]`);

  if (e.type == "keydown") {
    if (!input.isOperand(input.keyCodeMap[keyCode])) {
      button.classList.add("active");
      setTimeout(() => {
        button.classList.remove("active");
      }, 150);
    }
  }

  parseKeyCode(keyCode);
}

const buttons = document.querySelectorAll('.button_');
buttons.forEach(buttons => {
  buttons.addEventListener('click', processButtonPress);
});

document.addEventListener('keydown', processButtonPress);