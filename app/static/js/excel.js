function generateNestedIFFormula() {
    const conditionBlocks = document.querySelectorAll('.conditionBlock');
    let formula = '';

    conditionBlocks.forEach(block => {
        const condition = block.querySelector('.condition').value;
        const trueResult = block.querySelector('.trueResult').value;
        const falseResult = block.querySelector('.falseResult').value;
        const nestedConditions = block.querySelectorAll('.nestedCondition');

        let nestedFormulaString = '';
        nestedConditions.forEach(nested => {
            const nestedCondition = nested.querySelector('.condition').value;
            const nestedTrueResult = nested.querySelector('.trueResult').value;
            const nestedFalseResult = nested.querySelector('.falseResult').value;
            nestedFormulaString += `IF(${nestedCondition}, "${nestedTrueResult}", "${nestedFalseResult}"), `;
        });

        if (nestedFormulaString) {
            nestedFormulaString = nestedFormulaString.slice(0, -2); // 去掉最后的逗号和空格
            formula += `IF(${condition}, "${trueResult}", ${nestedFormulaString}), `;
        } else {
            formula += `IF(${condition}, "${trueResult}", "${falseResult}"), `;
        }
    });

    formula = formula.slice(0, -2); // 去掉最后的逗号和空格
    document.getElementById('formulaResult').textContent = "生成的多层 IF 公式: " + formula;

    navigator.clipboard.writeText(formula).then(() => {
        alert("公式已复制到剪贴板");
    }).catch(err => {
        console.error('无法复制到剪贴板: ', err);
    });
}

function addCondition() {
    const container = document.getElementById('conditionsContainer');
    const conditionIndex = container.children.length + 1;

    const conditionDiv = document.createElement('div');
    conditionDiv.className = 'conditionBlock';
    conditionDiv.innerHTML = `
        <label for="condition${conditionIndex}">条件 ${conditionIndex}:</label>
        <input type="text" class="condition" placeholder="如 A1>10"><br>
        <label for="trueResult${conditionIndex}">条件为真时的结果 ${conditionIndex}:</label>
        <input type="text" class="trueResult" placeholder="如 大于10"><br>
        <label for="falseResult${conditionIndex}">条件为假时的结果 ${conditionIndex}:</label>
        <input type="text" class="falseResult" placeholder="如 小于或等于10"><br>
        <button type="button" onclick="addNestedCondition(this)">添加嵌套条件</button>
    `;
    container.appendChild(conditionDiv);
}

function addNestedCondition(button) {
    const parentBlock = button.parentElement;
    const nestedDiv = document.createElement('div');
    nestedDiv.className = 'nestedCondition';
    nestedDiv.innerHTML = `
        <label>嵌套条件:</label>
        <input type="text" class="condition" placeholder="如 A1>10"><br>
        <label>嵌套条件为真时的结果:</label>
        <input type="text" class="trueResult" placeholder="如 大于10"><br>
        <label>嵌套条件为假时的结果:</label>
        <input type="text" class="falseResult" placeholder="如 小于或等于10"><br>
    `;
    parentBlock.appendChild(nestedDiv);
}