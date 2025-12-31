// 主应用程序逻辑（适用于所有页面）
document.addEventListener('DOMContentLoaded', function() {
    // 主题切换功能
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        }
    });

    // 初始化主题
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun';
    }

    // 运行时间计算功能
    function updateRuntime() {
        // 设置网站开始运行的时间为2025年12月25日 16:45
        const startTime = new Date('2025-12-25T16:45:00').getTime();
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - startTime;
        
        // 计算天、时、分、秒
        const days = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((elapsedTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
        
        // 更新显示
        document.querySelector('.runtime-days').textContent = days;
        document.querySelector('.runtime-hours').textContent = hours;
        document.querySelector('.runtime-minutes').textContent = minutes;
        document.querySelector('.runtime-seconds').textContent = seconds;
    }
    
    // 初始化运行时间显示并每秒更新
    updateRuntime();
    setInterval(updateRuntime, 1000);
    
    // 复制文本功能（通用）
    document.addEventListener('click', function(e) {
        if (e.target.closest('.result-content.copyable')) {
            const textToCopy = e.target.closest('.result-content.copyable').textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                // 显示复制成功提示
                showNotification('内容已复制到剪贴板', 'success');
            }).catch(err => {
                console.error('复制失败:', err);
                showNotification('复制失败，请手动复制', 'error');
            });
        }
    });
    
    // 显示通知函数
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `copy-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    console.log('全能工具箱已加载');
});

// 工具通用函数
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 深色模式样式添加到style.css
const darkModeStyles = `
.copy-notification.success {
    background-color: var(--success-color);
}

.copy-notification.error {
    background-color: var(--danger-color);
}
`;