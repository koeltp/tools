// 密码生成器工具
import { copyToClipboard, showNotification, evaluatePasswordStrength } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // 工具元素
    const passwordLength = document.getElementById('passwordLength');
    const passwordLengthValue = document.getElementById('passwordLengthValue');
    const generatedPassword = document.getElementById('generatedPassword');
    const strengthMeter = document.getElementById('strengthMeter');
    const passwordHistory = document.getElementById('passwordHistory');
    
    // 更新密码长度显示
    passwordLength.addEventListener('input', () => {
        passwordLengthValue.textContent = passwordLength.value;
    });
    
    // 密码生成函数
    function generatePassword(length, options) {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let charPool = '';
        let password = '';
        
        if (options.includeLowercase) charPool += lowercase;
        if (options.includeUppercase) charPool += uppercase;
        if (options.includeNumbers) charPool += numbers;
        if (options.includeSymbols) charPool += symbols;
        
        if (charPool.length === 0) {
            return '请至少选择一种字符类型';
        }
        
        // 确保至少包含每种选定的字符类型
        if (options.includeLowercase) {
            password += lowercase[Math.floor(Math.random() * lowercase.length)];
        }
        if (options.includeUppercase) {
            password += uppercase[Math.floor(Math.random() * uppercase.length)];
        }
        if (options.includeNumbers) {
            password += numbers[Math.floor(Math.random() * numbers.length)];
        }
        if (options.includeSymbols) {
            password += symbols[Math.floor(Math.random() * symbols.length)];
        }
        
        // 填充剩余长度
        for (let i = password.length; i < length; i++) {
            password += charPool[Math.floor(Math.random() * charPool.length)];
        }
        
        // 打乱密码字符顺序
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        return password;
    }
    
    // 生成单个密码
    document.getElementById('generatePassword').addEventListener('click', () => {
        const length = parseInt(passwordLength.value);
        const options = {
            includeLowercase: document.getElementById('includeLowercase').checked,
            includeUppercase: document.getElementById('includeUppercase').checked,
            includeNumbers: document.getElementById('includeNumbers').checked,
            includeSymbols: document.getElementById('includeSymbols').checked
        };
        
        const password = generatePassword(length, options);
        
        if (password.startsWith('请至少选择一种字符类型')) {
            generatedPassword.value = password;
            strengthMeter.className = 'strength-meter';
            return;
        }
        
        generatedPassword.value = password;
        
        // 评估密码强度
        const strength = evaluatePasswordStrength(password);
        
        // 添加到历史记录
        updatePasswordHistory(password, strength);
        
        showNotification('密码已生成');
    });
    
    // 生成多个密码
    document.getElementById('generateMultiple').addEventListener('click', () => {
        const length = parseInt(passwordLength.value);
        const options = {
            includeLowercase: document.getElementById('includeLowercase').checked,
            includeUppercase: document.getElementById('includeUppercase').checked,
            includeNumbers: document.getElementById('includeNumbers').checked,
            includeSymbols: document.getElementById('includeSymbols').checked
        };
        
        if (!options.includeLowercase && !options.includeUppercase && 
            !options.includeNumbers && !options.includeSymbols) {
            generatedPassword.value = '请至少选择一种字符类型';
            return;
        }
        
        let passwords = [];
        for (let i = 0; i < 5; i++) {
            passwords.push(generatePassword(length, options));
        }
        
        // 显示第一个密码
        generatedPassword.value = passwords[0];
        evaluatePasswordStrength(passwords[0]);
        
        // 添加到历史记录
        updateMultiplePasswordsHistory(passwords);
        
        showNotification('5个密码已生成');
    });
    
    // 复制密码
    document.getElementById('copyPassword').addEventListener('click', () => {
        if (!generatedPassword.value) return;
        
        if (generatedPassword.value.includes('请至少选择一种字符类型')) {
            showNotification('请先生成有效密码');
            return;
        }
        
        copyToClipboard(generatedPassword.value);
        
        // 显示复制成功消息
        const originalText = generatedPassword.value;
        generatedPassword.value = '✓ 已复制到剪贴板';
        
        setTimeout(() => {
            generatedPassword.value = originalText;
        }, 1500);
        
        showNotification('密码已复制到剪贴板');
    });
    
    // 为生成的密码输入框添加点击复制功能
    generatedPassword.addEventListener('click', () => {
        if (generatedPassword.value && !generatedPassword.value.includes('请至少选择一种字符类型')) {
            copyToClipboard(generatedPassword.value);
            
            // 显示复制成功消息
            const originalText = generatedPassword.value;
            generatedPassword.value = '✓ 已复制到剪贴板';
            
            setTimeout(() => {
                generatedPassword.value = originalText;
            }, 1500);
            
            showNotification('密码已复制到剪贴板');
        }
    });
    
    // 更新密码历史记录
    function updatePasswordHistory(password, strength) {
        let history = passwordHistory.innerHTML;
        if (history === '等待生成密码...') {
            history = '';
        }
        
        const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        const historyItem = createHistoryItem(timestamp, password, strength);
        
        passwordHistory.innerHTML = historyItem + (history ? `<br>${history}` : '');
        
        // 为历史记录项添加点击复制功能
        setupHistoryCopy();
    }
    
    // 更新多个密码历史记录
    function updateMultiplePasswordsHistory(passwords) {
        let history = passwordHistory.innerHTML;
        if (history === '等待生成密码...') {
            history = '';
        }
        
        const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        let newHistory = `${timestamp} - 生成5个密码:<br>`;
        
        passwords.forEach((pwd, index) => {
            const strength = evaluatePasswordStrength(pwd);
            newHistory += `  ${index + 1}. <span class="password-item" data-password="${pwd}">${pwd}</span> (${strength})<br>`;
        });
        
        passwordHistory.innerHTML = newHistory + (history ? `<br>${history}` : '');
        
        // 为历史记录项添加点击复制功能
        setupHistoryCopy();
    }
    
    // 创建历史记录项
    function createHistoryItem(timestamp, password, strength) {
        return `${timestamp} - <span class="password-item" data-password="${password}">${password}</span> (${strength})`;
    }
    
    // 为历史记录项设置点击复制功能
    function setupHistoryCopy() {
        const passwordItems = passwordHistory.querySelectorAll('.password-item');
        passwordItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.style.color = 'var(--primary-color)';
            item.style.textDecoration = 'underline';
            item.style.textDecorationStyle = 'dotted';
            item.style.padding = '2px 4px';
            item.style.borderRadius = '3px';
            item.style.transition = 'background-color 0.2s';
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
            });
            
            item.addEventListener('click', () => {
                const password = item.getAttribute('data-password');
                copyToClipboard(password);
                showNotification('密码已复制到剪贴板');
                
                // 视觉反馈
                const originalText = item.textContent;
                item.textContent = '✓ 已复制';
                item.style.color = 'var(--success-color)';
                
                setTimeout(() => {
                    item.textContent = originalText;
                    item.style.color = 'var(--primary-color)';
                }, 1000);
            });
        });
    }
    
    // 清空密码历史
    document.getElementById('clearPassword').addEventListener('click', () => {
        generatedPassword.value = '';
        passwordHistory.innerHTML = '等待生成密码...';
        strengthMeter.className = 'strength-meter';
        showNotification('已清空');
    });
    
    // 初始化示例数据
    function initExampleData() {
        // 设置默认选项
        document.getElementById('includeLowercase').checked = true;
        document.getElementById('includeUppercase').checked = true;
        document.getElementById('includeNumbers').checked = true;
        document.getElementById('includeSymbols').checked = true;
        
        // 生成一个示例密码
        document.getElementById('generatePassword').click();
    }
    
    // 直接初始化示例数据（移除事件监听）
    initExampleData();
    
    console.log('密码生成器工具已加载');
});