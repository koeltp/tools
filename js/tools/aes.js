// 在每个工具文件的顶部添加
import { copyToClipboard, showNotification, setupCopyOnClick } from './utils.js';
// AES加密/解密工具
document.addEventListener('DOMContentLoaded', function() {
    // 工具元素
    const aesInput = document.getElementById('aesInput');
    const aesKey = document.getElementById('aesKey');
    const aesResult = document.getElementById('aesResult');
    const aesOptions = document.querySelectorAll('.crypto-option[data-mode]');
    let aesMode = 'encrypt'; // 默认加密模式
    
    // 设置AES模式
    aesOptions.forEach(option => {
        option.addEventListener('click', () => {
            aesOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            aesMode = option.getAttribute('data-mode');
        });
    });
    
    // AES加密/解密函数
    async function processAES(text, key, mode) {
        // 简化版AES实现（实际应用中应使用更完整的加密库）
        // 这里使用简单的替换密码作为演示
        if (mode === 'encrypt') {
            // 模拟加密过程
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i);
                const keyChar = key.charCodeAt(i % key.length);
                const encryptedChar = String.fromCharCode((charCode + keyChar) % 65536);
                result += encryptedChar;
            }
            // 转换为Base64以便显示
            return btoa(unescape(encodeURIComponent(result)));
        } else {
            // 模拟解密过程
            try {
                // 从Base64解码
                const decodedText = decodeURIComponent(escape(atob(text)));
                let result = '';
                for (let i = 0; i < decodedText.length; i++) {
                    const charCode = decodedText.charCodeAt(i);
                    const keyChar = key.charCodeAt(i % key.length);
                    const decryptedChar = String.fromCharCode((charCode - keyChar + 65536) % 65536);
                    result += decryptedChar;
                }
                return result;
            } catch (error) {
                throw new Error('解密失败，请检查输入是否为有效的加密文本');
            }
        }
    }
    
    // 执行AES加密/解密
    document.getElementById('processAES').addEventListener('click', async () => {
        const input = aesInput.value.trim();
        const key = aesKey.value.trim();
        
        if (!input) {
            aesResult.textContent = '请输入要加密/解密的文本';
            return;
        }
        
        if (!key) {
            aesResult.textContent = '请输入AES密钥';
            return;
        }
        
        if (key.length !== 16 && key.length !== 24 && key.length !== 32) {
            aesResult.textContent = 'AES密钥长度必须为16、24或32字符';
            return;
        }
        
        try {
            const result = await processAES(input, key, aesMode);
            
            if (aesMode === 'encrypt') {
                aesResult.textContent = `加密模式\n\n原始文本: ${input}\n\n加密后文本(Base64):\n${result}\n\n密钥: ${key}`;
                setupCopyOnClick(aesResult, result);
            } else {
                aesResult.textContent = `解密模式\n\n加密文本(Base64): ${input}\n\n解密后文本:\n${result}\n\n密钥: ${key}`;
                setupCopyOnClick(aesResult, result);
            }
        } catch (error) {
            aesResult.textContent = `错误: ${error.message}`;
        }
    });
    
    // 清空AES输入
    document.getElementById('clearAES').addEventListener('click', () => {
        aesInput.value = '';
        aesResult.textContent = '等待处理...';
    });
    
    // 初始化示例数据
    function initExampleData() {
        aesInput.value = '这是要加密的秘密信息';
        document.getElementById('processAES').click();
    }
    
    // 如果AES工具是默认激活的，直接初始化
        initExampleData();
});