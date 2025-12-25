// 公共工具函数 - tools/utils.js

// 复制到剪贴板函数
export function copyToClipboard(text) {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        // 尝试使用现代API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('复制成功 (现代API)');
            }).catch(err => {
                console.error('现代API复制失败，使用降级方案:', err);
                document.execCommand('copy');
            });
        } else {
            // 降级方案
            document.execCommand('copy');
        }
        
        document.body.removeChild(textarea);
        return true;
    } catch (error) {
        console.error('复制失败:', error);
        return false;
    }
}

// 显示通知
export function showNotification(message) {
    // 移除之前的通知
    const oldNotification = document.querySelector('.copy-notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// 设置点击复制功能
export function setupCopyOnClick(element, text) {
    element.classList.add('copyable');
    element.addEventListener('click', () => {
        if (copyToClipboard(text)) {
            showNotification('已复制到剪贴板');
        } else {
            showNotification('复制失败，请手动选择复制');
        }
    });
}

// 格式化时间戳为可读格式
export function formatTimestamp(timestamp, isMilliseconds = false) {
    const date = isMilliseconds ? new Date(timestamp) : new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN');
}

// 验证JSON字符串
export function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

// 生成随机字符串
export function generateRandomString(length, options = {
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true
}) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let charPool = '';
    if (options.lowercase) charPool += lowercase;
    if (options.uppercase) charPool += uppercase;
    if (options.numbers) charPool += numbers;
    if (options.symbols) charPool += symbols;
    
    if (charPool.length === 0) return '';
    
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charPool.charAt(Math.floor(Math.random() * charPool.length));
    }
    
    return result;
}

// 密码强度评估
export function evaluatePasswordStrength(password) {
    if (!password || password.length === 0) return { score: 0, level: '无' };
    
    let score = 0;
    
    // 长度评分
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    
    // 字符种类评分
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    // 确定强度等级
    let level, className;
    if (score <= 2) {
        level = '弱';
        className = 'strength-weak';
    } else if (score <= 4) {
        level = '一般';
        className = 'strength-fair';
    } else if (score <= 6) {
        level = '好';
        className = 'strength-good';
    } else {
        level = '强';
        className = 'strength-strong';
    }
    
    return { score, level, className };
}