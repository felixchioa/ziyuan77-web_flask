function generateQuestions() {
    const numQuestions = parseInt(document.getElementById('numQuestions').value);
    const range = parseInt(document.getElementById('range').value);
    const operations = Array.from(document.getElementById('operations').selectedOptions).map(option => option.value);
    const includeFractions = document.getElementById('includeFractions').checked;

    if (operations.length === 0) {
        alert('请选择至少一种运算类型');
        return;
    }

    let questions = '';
    let answers = '';

    for (let i = 0; i < numQuestions; i++) {
        const operation = operations[Math.floor(Math.random() * operations.length)];
        let question, answer;

        if (operation === 'mix') {
            const num1 = getRandomNumber(range, includeFractions);
            const num2 = getRandomNumber(range, includeFractions);
            const num3 = getRandomNumber(range, includeFractions);
            question = `${num1} + ${num2} * ${num3}`;
            answer = num1 + num2 * num3;
        } else if (operation === 'equation') {
            const a = getRandomNumber(range, includeFractions);
            const b = getRandomNumber(range, includeFractions);
            question = `${a}x + ${b} = 0`;
            answer = `x = ${(-b / a).toFixed(2)}`;
        } else {
            const num1 = getRandomNumber(range, includeFractions);
            const num2 = getRandomNumber(range, includeFractions);
            question = `${num1} ${operation} ${num2}`;
            switch (operation) {
                case '+':
                    answer = num1 + num2;
                    break;
                case '-':
                    answer = num1 - num2;
                    break;
                case '*':
                    answer = num1 * num2;
                    break;
                case '/':
                    answer = (num2 !== 0) ? (num1 / num2).toFixed(2) : 'undefined';
                    break;
            }
        }

        questions += `题目 ${i + 1}: ${question} = \n`;
        answers += `答案 ${i + 1}: ${answer}\n`;
    }

    const content = questions + '\n' + answers;
    downloadTxtFile(content);
}

function getRandomNumber(range, includeFractions) {
    const isNegative = Math.random() < 0.5;
    let number = Math.random() * range + 1;
    if (includeFractions) {
        number = parseFloat(number.toFixed(2));
    } else {
        number = Math.floor(number);
    }
    return isNegative ? -number : number;
}

function downloadTxtFile(content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'math_questions.txt';
    a.click();
    URL.revokeObjectURL(url);
}