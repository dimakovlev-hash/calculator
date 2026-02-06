class Calculator {
    constructor() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;

        this.resultDisplay = document.getElementById('result');
        this.expressionDisplay = document.getElementById('expression');

        this.init();
    }

    init() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e);
                this.handleButton(button);
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();

        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${event.clientX - rect.left - radius}px`;
        ripple.style.top = `${event.clientY - rect.top - radius}px`;
        ripple.classList.add('ripple');

        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    handleButton(button) {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (value !== undefined) {
            this.inputNumber(value);
        } else if (action) {
            this.handleAction(action);
        }
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'sign':
                this.toggleSign();
                break;
            case 'percent':
                this.percentage();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.setOperation(action);
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }

    handleKeyboard(e) {
        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
        } else if (e.key === '.') {
            this.inputDecimal();
        } else if (e.key === '+') {
            this.setOperation('add');
        } else if (e.key === '-') {
            this.setOperation('subtract');
        } else if (e.key === '*') {
            this.setOperation('multiply');
        } else if (e.key === '/') {
            e.preventDefault();
            this.setOperation('divide');
        } else if (e.key === 'Enter' || e.key === '=') {
            this.calculate();
        } else if (e.key === 'Escape') {
            this.clear();
        } else if (e.key === 'Backspace') {
            this.backspace();
        } else if (e.key === '%') {
            this.percentage();
        }
    }

    inputNumber(num) {
        if (this.shouldResetDisplay) {
            this.currentValue = num;
            this.shouldResetDisplay = false;
        } else {
            if (this.currentValue === '0' && num !== '0') {
                this.currentValue = num;
            } else if (this.currentValue !== '0') {
                if (this.currentValue.length < 15) {
                    this.currentValue += num;
                }
            }
        }
        this.updateDisplay();
    }

    inputDecimal() {
        if (this.shouldResetDisplay) {
            this.currentValue = '0.';
            this.shouldResetDisplay = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }

    setOperation(op) {
        if (this.operation && !this.shouldResetDisplay) {
            this.calculate();
        }

        this.previousValue = this.currentValue;
        this.operation = op;
        this.shouldResetDisplay = true;

        this.updateOperatorButtons(op);
        this.updateExpression();
    }

    updateOperatorButtons(activeOp) {
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.action === activeOp) {
                btn.classList.add('active');
            }
        });
    }

    calculate() {
        if (!this.operation || !this.previousValue) return;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        switch (this.operation) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    this.showError('Ошибка');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        // Format result
        if (result.toString().length > 12) {
            if (Math.abs(result) >= 1e12 || (Math.abs(result) < 1e-6 && result !== 0)) {
                result = result.toExponential(6);
            } else {
                result = parseFloat(result.toPrecision(12));
            }
        }

        this.expressionDisplay.textContent = `${this.formatNumber(prev)} ${this.getOperatorSymbol(this.operation)} ${this.formatNumber(current)} =`;
        this.currentValue = result.toString();
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = true;

        this.updateOperatorButtons(null);
        this.updateDisplay();
    }

    getOperatorSymbol(op) {
        const symbols = {
            add: '+',
            subtract: '−',
            multiply: '×',
            divide: '÷'
        };
        return symbols[op] || '';
    }

    updateExpression() {
        if (this.previousValue && this.operation) {
            this.expressionDisplay.textContent = `${this.formatNumber(parseFloat(this.previousValue))} ${this.getOperatorSymbol(this.operation)}`;
        }
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.expressionDisplay.textContent = '';
        this.resultDisplay.classList.remove('error');
        this.updateOperatorButtons(null);
        this.updateDisplay();
    }

    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    toggleSign() {
        if (this.currentValue !== '0') {
            if (this.currentValue.startsWith('-')) {
                this.currentValue = this.currentValue.slice(1);
            } else {
                this.currentValue = '-' + this.currentValue;
            }
            this.updateDisplay();
        }
    }

    percentage() {
        const value = parseFloat(this.currentValue);
        if (this.previousValue && this.operation) {
            // Calculate percentage of previous value
            this.currentValue = (parseFloat(this.previousValue) * value / 100).toString();
        } else {
            this.currentValue = (value / 100).toString();
        }
        this.updateDisplay();
    }

    showError(message) {
        this.resultDisplay.textContent = message;
        this.resultDisplay.classList.add('error');
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = true;
        this.updateOperatorButtons(null);

        setTimeout(() => {
            this.clear();
        }, 1500);
    }

    formatNumber(num) {
        if (isNaN(num)) return '0';

        const parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return parts.join('.');
    }

    updateDisplay() {
        const num = parseFloat(this.currentValue);
        if (!isNaN(num) && !this.currentValue.endsWith('.')) {
            this.resultDisplay.textContent = this.formatNumber(num);
        } else {
            this.resultDisplay.textContent = this.currentValue;
        }
        this.resultDisplay.classList.remove('error');
    }
}

// Initialize calculator
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});
