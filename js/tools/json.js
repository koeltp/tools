import { copyToClipboard, showNotification, setupCopyOnClick } from './utils.js';
// JSON工具
document.addEventListener('DOMContentLoaded', function () {
    // 工具元素
    const jsonInput = document.getElementById('jsonInput');
    const jsonResult = document.getElementById('jsonResult');

    // 格式化JSON
    document.getElementById('formatJson').addEventListener('click', () => {
        const input = jsonInput.value.trim();

        if (!input) {
            jsonResult.textContent = '请输入JSON数据';
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            jsonResult.textContent = formatted;
            setupCopyOnClick(jsonResult, formatted);
        } catch (error) {
            jsonResult.textContent = `JSON格式错误: ${error.message}`;
        }
    });

    // 验证JSON
    document.getElementById('validateJson').addEventListener('click', () => {
        const input = jsonInput.value.trim();

        if (!input) {
            jsonResult.textContent = '请输入JSON数据';
            return;
        }

        try {
            JSON.parse(input);
            jsonResult.textContent = '✅ JSON格式正确！';
        } catch (error) {
            jsonResult.textContent = `❌ JSON格式错误: ${error.message}`;
        }
    });

    // 压缩JSON
    document.getElementById('compressJson').addEventListener('click', () => {
        const input = jsonInput.value.trim();

        if (!input) {
            jsonResult.textContent = '请输入JSON数据';
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const compressed = JSON.stringify(parsed);
            jsonResult.textContent = compressed;
            setupCopyOnClick(jsonResult, compressed);
        } catch (error) {
            jsonResult.textContent = `JSON格式错误: ${error.message}`;
        }
    });

    // 转义JSON
    document.getElementById('escapeJson').addEventListener('click', () => {
        const input = jsonInput.value.trim();

        if (!input) {
            jsonResult.textContent = '请输入JSON数据';
            return;
        }

        try {
            // 验证JSON格式
            JSON.parse(input);
            // 转义特殊字符
            const escaped = input
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');

            jsonResult.textContent = escaped;
            setupCopyOnClick(jsonResult, escaped);
        } catch (error) {
            jsonResult.textContent = `JSON格式错误: ${error.message}`;
        }
    });

    // 反转义JSON
    document.getElementById('unescapeJson').addEventListener('click', () => {
        const input = jsonInput.value.trim();

        if (!input) {
            jsonResult.textContent = '请输入JSON数据';
            return;
        }

        try {
            // 反转义特殊字符
            const unescaped = input
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\\t/g, '\t');

            // 尝试解析验证
            JSON.parse(unescaped);
            jsonResult.textContent = unescaped;
            setupCopyOnClick(jsonResult, unescaped);
        } catch (error) {
            jsonResult.textContent = `JSON格式错误或转义字符串无效: ${error.message}`;
        }
    });

    // 清空JSON输入
    document.getElementById('clearJson').addEventListener('click', () => {
        jsonInput.value = '';
        jsonResult.textContent = '等待处理...';
    });

    // 初始化示例数据
    function initExampleData() {
        const exampleJson = {
            "name": "张三",
            "age": 28,
            "isStudent": false,
            "hobbies": ["阅读", "游泳", "编程"],
            "address": {
                "city": "北京",
                "street": "朝阳路"
            },
            "website": [
                {"url":"https://tz.taipi.top","name":"TP投资"},
                {"url":"https://www.jieleme.top","name":"结了么"},
                {"url":"https://www.byteepoch.com","name":"字节时代"},
                {"url":"https://jiewei.top","name":"杰威精密"},
                {"url":"https://nav.taipi.top","name":"太皮导航"},
                {"url":"https://www.dogedoge.com","name":"太皮工具箱"}
            ],
            "scores": [85, 92, 78, 95]
        };
        jsonInput.value = JSON.stringify(exampleJson, null, 2);
        document.getElementById('formatJson').click();
    }

    initExampleData();
});