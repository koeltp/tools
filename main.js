// 主应用程序逻辑
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

    // 导航功能
    const navLinks = document.querySelectorAll('.nav-link');
    const toolContents = document.querySelectorAll('.tool-content');
    const currentToolTitle = document.getElementById('currentToolTitle');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const toolId = link.getAttribute('data-tool');
            
            // 更新活动导航项
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // 更新当前工具标题
            const toolTitle = link.querySelector('span').textContent;
            currentToolTitle.textContent = toolTitle;
            
            // 显示对应工具内容
            toolContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${toolId}-tool`) {
                    content.classList.add('active');
                    
                    // 当切换工具时，加载对应的工具模块
                    loadToolModule(toolId);
                }
            });
            
            // 保存当前活动工具到本地存储
            localStorage.setItem('activeTool', toolId);
        });
    });
    
    // 加载工具模块函数
    function loadToolModule(toolId) {
        // 这里可以按需加载工具模块
        // 由于我们已经将所有工具脚本都加载了，这里主要处理初始化
        console.log(`切换到工具: ${toolId}`);
        
        // 触发工具初始化事件
        const initEvent = new CustomEvent(`init-${toolId}-tool`);
        document.dispatchEvent(initEvent);
    }
    
    // 从本地存储恢复活动工具
    const savedTool = localStorage.getItem('activeTool') || 'timestamp';
    const savedToolLink = document.querySelector(`.nav-link[data-tool="${savedTool}"]`);
    if (savedToolLink) {
        savedToolLink.click();
    }
    
    // 初始化应用
    console.log('全能工具箱已加载');
});

// 工具切换事件监听器
document.addEventListener('init-timestamp-tool', function() {
    // 时间戳工具初始化逻辑将在 timestamp.js 中处理
    console.log('初始化时间戳工具');
});

document.addEventListener('init-json-tool', function() {
    // JSON工具初始化逻辑将在 json.js 中处理
    console.log('初始化JSON工具');
});

document.addEventListener('init-md5-tool', function() {
    // MD5工具初始化逻辑将在 md5.js 中处理
    console.log('初始化MD5工具');
});

document.addEventListener('init-aes-tool', function() {
    // AES工具初始化逻辑将在 aes.js 中处理
    console.log('初始化AES工具');
});

document.addEventListener('init-encode-tool', function() {
    // 编码工具初始化逻辑将在 encode.js 中处理
    console.log('初始化编码工具');
});

document.addEventListener('init-password-tool', function() {
    // 密码工具初始化逻辑将在 password.js 中处理
    console.log('初始化密码工具');
});

document.addEventListener('init-qrcode-tool', function() {
    // 二维码工具初始化逻辑将在 qrcode.js 中处理
    console.log('初始化二维码工具');
});