// footer.js
// 动态生成页脚功能

document.addEventListener('DOMContentLoaded', function() {
    // 查找页脚容器
    const footerContainer = document.getElementById('main-footer-container');
    if (!footerContainer) {
        console.warn('未找到页脚容器 (#main-footer-container)');
        return;
    }
    
    // 创建页脚元素
    const footer = document.createElement('footer');
    footer.className = 'main-footer';
    
    // 设置页脚HTML内容
    footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-copyright">
                <p>© 2025 太皮工具箱 | 开发者必备工具集</p>
                <p>友链：<a href="https://tz.taipi.top" target="_blank">TP投资</a> | <a href="https://www.byteepoch.com" target="_blank">字节时代</a> | <a href="https://www.jieleme.top" target="_blank">结了么</a> | <a href="https://nav.taipi.top" target="_blank">太皮导航</a></p>
                <p>本工具完全在浏览器端运行，不会上传任何数据到服务器</p>
            </div>
            <div class="runtime-display">
                <p>
                    小破站已运行 <span class="runtime-days">0</span> 天
                    <span class="runtime-hours">0</span> 时
                    <span class="runtime-minutes">0</span> 分
                    <span class="runtime-seconds">0</span> 秒
                </p>
            </div>
        </div>
    `;
    
    // 将页脚添加到容器
    footerContainer.appendChild(footer);
    
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
        const daysElement = document.querySelector('.runtime-days');
        const hoursElement = document.querySelector('.runtime-hours');
        const minutesElement = document.querySelector('.runtime-minutes');
        const secondsElement = document.querySelector('.runtime-seconds');
        
        if (daysElement) daysElement.textContent = days;
        if (hoursElement) hoursElement.textContent = hours;
        if (minutesElement) minutesElement.textContent = minutes;
        if (secondsElement) secondsElement.textContent = seconds;
    }
    
    // 初始化运行时间显示并每秒更新
    updateRuntime();
    setInterval(updateRuntime, 1000);
});