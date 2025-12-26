import { copyToClipboard, showNotification, setupCopyOnClick, formatTimestamp } from './utils.js';
// 时间戳转换工具
document.addEventListener('DOMContentLoaded', function () {
    // 工具元素
    const timestampInput = document.getElementById('timestampInput');
    const timestampResult = document.getElementById('timestampResult');
    const timeFormatsContainer = document.getElementById('timeFormats');
    const currentTimeElement = document.getElementById('currentTime');
    const currentTimestampElement = document.getElementById('currentTimestamp');

    // 更新当前时间
    function updateCurrentTime() {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);

        currentTimeElement.textContent = now.toLocaleString('zh-CN');
        currentTimestampElement.textContent = timestamp;
    }

    // 初始化当前时间显示
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // 时间戳转换为日期
    document.getElementById('convertToDate').addEventListener('click', () => {
        const input = timestampInput.value.trim();

        if (!input) {
            timestampResult.textContent = '请输入时间戳或日期字符串';
            return;
        }

        let timestamp;

        // 检查输入是否为数字（时间戳）
        if (/^\d+$/.test(input)) {
            // 判断是秒还是毫秒时间戳
            timestamp = input.length === 10 ? parseInt(input) * 1000 : parseInt(input);
        } else {
            // 尝试解析日期字符串
            const date = new Date(input);
            timestamp = date.getTime();

            if (isNaN(timestamp)) {
                timestampResult.textContent = '无法识别的日期格式，请使用标准格式如: 2023-01-01 12:00:00';
                return;
            }
        }

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            timestampResult.textContent = '无效的时间戳';
            return;
        }

        // 生成多种日期格式
        const formats = [
            { label: 'ISO 8601 格式', value: date.toISOString() },
            { label: '本地日期时间', value: date.toLocaleString('zh-CN') },
            { label: '日期部分', value: date.toLocaleDateString('zh-CN') },
            { label: '时间部分', value: date.toLocaleTimeString('zh-CN') },
            { label: 'UTC 时间', value: date.toUTCString() },
            { label: 'Unix 时间戳 (秒)', value: Math.floor(date.getTime() / 1000) },
            { label: 'Unix 时间戳 (毫秒)', value: date.getTime() },
            { label: '年-月-日', value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` },
            { label: '时:分:秒', value: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}` }
        ];

        // 显示主要结果
        timestampResult.textContent = `输入: ${input}\n\n转换为日期: ${date.toLocaleString('zh-CN')}\n\n其他格式:`;

        // 为结果添加点击复制功能
        //setupCopyOnClick(timestampResult, date.toLocaleString('zh-CN'));

        // 显示其他格式
        timeFormatsContainer.innerHTML = '';
        formats.forEach(format => {
            const formatItem = document.createElement('div');
            formatItem.className = 'format-item';
            formatItem.innerHTML = `
                <div class="format-label">${format.label}</div>
                <div class="format-value">${format.value}</div>
            `;
            timeFormatsContainer.appendChild(formatItem);
        });
    });

    // 日期转换为时间戳
    document.getElementById('convertToTimestamp').addEventListener('click', () => {
        const input = timestampInput.value.trim();

        if (!input) {
            timestampResult.textContent = '请输入时间戳或日期字符串';
            return;
        }

        let date;

        // 检查输入是否为数字（时间戳）
        if (/^\d+$/.test(input)) {
            // 如果已经是时间戳，直接显示
            const timestamp = input.length === 10 ? parseInt(input) * 1000 : parseInt(input);
            date = new Date(timestamp);
        } else {
            // 尝试解析日期字符串
            date = new Date(input);
        }

        if (isNaN(date.getTime())) {
            timestampResult.textContent = '无效的日期格式';
            return;
        }

        const timestampMs = date.getTime();
        const timestampSec = Math.floor(timestampMs / 1000);

        timestampResult.textContent = `输入: ${input}\n\nUnix 时间戳 (秒): ${timestampSec}\nUnix 时间戳 (毫秒): ${timestampMs}\n\n对应日期: ${date.toLocaleString('zh-CN')}`;
      
        // 为结果添加点击复制功能
        //setupCopyOnClick(timestampResult, timestampSec.toString());

        // 清空格式显示
        timeFormatsContainer.innerHTML = '';
    });

    // 使用当前时间
    document.getElementById('useCurrentTime').addEventListener('click', () => {
        const now = new Date();
        timestampInput.value = now.toLocaleString('zh-CN');

        // 触发转换
        document.getElementById('convertToTimestamp').click();
    });

    // 清空时间戳输入
    document.getElementById('clearTimestamp').addEventListener('click', () => {
        timestampInput.value = '';
        timestampResult.textContent = '等待转换...';
        timeFormatsContainer.innerHTML = '';
    });

    // 初始化示例数据
    function initExampleData() {
        timestampInput.value = Math.floor(Date.now() / 1000);
        document.getElementById('convertToDate').click();
    }

    // 当工具激活时初始化示例数据
    document.addEventListener('init-timestamp-tool', initExampleData);

    // 如果时间戳工具是默认激活的，直接初始化
    if (document.getElementById('timestamp-tool').classList.contains('active')) {
        initExampleData();
    }

    console.log('时间戳工具已加载');
});