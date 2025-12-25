import { copyToClipboard, showNotification, setupCopyOnClick } from './utils.js';
// 编码/解码工具
document.addEventListener('DOMContentLoaded', function() {
    // 工具元素
    const encodeInput = document.getElementById('encodeInput');
    const encodeResult = document.getElementById('encodeResult');
    const encodeOptions = document.querySelectorAll('.crypto-option[data-encode-type]');
    let encodeType = 'base64-encode'; // 默认Base64编码
    
    // 设置编码类型
    encodeOptions.forEach(option => {
        option.addEventListener('click', () => {
            encodeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            encodeType = option.getAttribute('data-encode-type');
        });
    });
    
    // 执行编码/解码
    document.getElementById('processEncode').addEventListener('click', () => {
        const input = encodeInput.value.trim();
        
        if (!input) {
            encodeResult.textContent = '请输入要编码/解码的文本';
            return;
        }
        
        try {
            let result = '';
            let operation = '';
            
            switch (encodeType) {
                case 'base64-encode':
                    result = btoa(unescape(encodeURIComponent(input)));
                    operation = 'Base64编码';
                    break;
                case 'base64-decode':
                    result = decodeURIComponent(escape(atob(input)));
                    operation = 'Base64解码';
                    break;
                case 'url-encode':
                    result = encodeURIComponent(input);
                    operation = 'URL编码';
                    break;
                case 'url-decode':
                    result = decodeURIComponent(input);
                    operation = 'URL解码';
                    break;
                default:
                    result = '未知操作类型';
            }
            
            encodeResult.textContent = `${operation}\n\n输入文本: ${input}\n\n结果:\n${result}`;
            setupCopyOnClick(encodeResult, result);
        } catch (error) {
            encodeResult.textContent = `错误: ${error.message}\n请检查输入格式是否正确`;
        }
    });
    
    // 清空编码输入
    document.getElementById('clearEncode').addEventListener('click', () => {
        encodeInput.value = '';
        encodeResult.textContent = '等待处理...';
    });
    
    // 初始化示例数据
    function initExampleData() {
        encodeInput.value = 'https://example.com/search?q=编码解码工具';
        document.getElementById('processEncode').click();
    }
    
    // 当工具激活时初始化示例数据
    document.addEventListener('init-encode-tool', initExampleData);
    
    // 如果编码工具是默认激活的，直接初始化
    if (document.getElementById('encode-tool').classList.contains('active')) {
        initExampleData();
    }
    
    console.log('编码解码工具已加载');
});