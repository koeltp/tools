// main.js
// 主应用程序逻辑（适用于所有页面）
document.addEventListener('DOMContentLoaded', function () {
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

    // 动态加载导航菜单
    loadNavigationMenu();

    // 复制文本功能（通用）
    document.addEventListener('click', function (e) {
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
        document.body.appendChild(notification);// main.js
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

    // 动态加载导航菜单
    loadNavigationMenu();

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
    
    // 工具切换功能
    document.addEventListener('click', function(e) {
        const toolLink = e.target.closest('.nav-link[data-tool]');
        if (toolLink) {
            const toolId = toolLink.getAttribute('data-tool');
            const toolElement = document.getElementById(`${toolId}-tool`);
            
            if (toolElement) {
                // 移除所有工具的active类
                document.querySelectorAll('.tool-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // 添加当前工具的active类
                toolElement.classList.add('active');
                toolElement.classList.add('tool-switch-enter');
                
                // 移除动画类
                setTimeout(() => {
                    toolElement.classList.remove('tool-switch-enter');
                }, 500);
                
                // 更新页面标题
                const toolTitle = toolLink.querySelector('span').textContent;
                document.title = `${toolTitle} - 太皮工具箱`;
                
                // 触发工具初始化事件
                const initEvent = new CustomEvent(`init-${toolId}-tool`);
                document.dispatchEvent(initEvent);
            }
        }
    });
    
    console.log('太皮工具箱已加载');
});

// 动态加载导航菜单
async function loadNavigationMenu() {
    try {
        // 为导航菜单添加加载状态
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.classList.add('loading');
        }
        
        const response = await fetch('nav.json');
        if (!response.ok) {
            throw new Error('导航数据加载失败');
        }
        
        const navItems = await response.json();
        
        // 清空现有菜单
        navMenu.innerHTML = '';
        
        // 获取当前页面的文件名
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // 生成导航菜单
        navItems.forEach(item => {
            const navItem = document.createElement('li');
            navItem.className = 'nav-item';
            
            // 检查是否为当前页面
            const isActive = item.url === currentPage;
            
            navItem.innerHTML = `
                <a href="${item.url}" class="nav-link ${isActive ? 'active' : ''}" 
                   data-tool="${item.id}" 
                   title="${item.name}">
                    <div class="hover-glow"></div>
                    <div class="particles-container"></div>
                    <div class="nav-content">
                        <i class="${item.icon}"></i>
                        <span>${item.name}</span>
                    </div>
                    <div class="advanced-tooltip">${item.name}</div>
                </a>
            `;
            
            navMenu.appendChild(navItem);
        });
        
        // 移除加载状态
        navMenu.classList.remove('loading');
        
        // 添加高级悬停效果
        addAdvancedHoverEffects();
        
        console.log('导航菜单加载成功');
    } catch (error) {
        console.error('加载导航菜单失败:', error);
        // 如果加载失败，显示一个错误消息
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.innerHTML = `
                <li class="nav-item">
                    <a href="#" class="nav-link error">
                        <div class="nav-content">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>导航加载失败</span>
                        </div>
                    </a>
                </li>
            `;
        }
    }
}

// 高级悬停效果
function addAdvancedHoverEffects() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const hoverGlow = link.querySelector('.hover-glow');
        const particlesContainer = link.querySelector('.particles-container');
        
        // 鼠标移动时的光晕效果
        link.addEventListener('mousemove', function(e) {
            if (!hoverGlow) return;
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 更新光晕位置
            hoverGlow.style.setProperty('--mouse-x', `${x}px`);
            hoverGlow.style.setProperty('--mouse-y', `${y}px`);
            
            // 创建粒子效果
            createParticles(particlesContainer, x, y);
        });
        
        // 鼠标进入时的效果
        link.addEventListener('mouseenter', function() {
            // 添加波纹效果
            const ripple = document.createElement('div');
            ripple.className = 'ripple-effect';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            this.appendChild(ripple);
            
            // 移除波纹
            setTimeout(() => {
                if (ripple.parentNode === this) {
                    this.removeChild(ripple);
                }
            }, 800);
            
            // 添加轻微震动效果
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'navShake 0.3s ease';
            }, 10);
        });
        
        // 鼠标离开时的效果
        link.addEventListener('mouseleave', function() {
            if (hoverGlow) {
                hoverGlow.style.opacity = '0';
            }
        });
        
        // 点击效果
        link.addEventListener('click', function(e) {
            // 如果不是当前页面，添加效果
            if (!this.classList.contains('active')) {
                // 创建点击波纹效果
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement('div');
                ripple.className = 'ripple-effect';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                this.appendChild(ripple);
                
                // 添加点击反馈动画
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // 移除波纹
                setTimeout(() => {
                    if (ripple.parentNode === this) {
                        this.removeChild(ripple);
                    }
                }, 800);
            }
            
            // 阻止默认行为，让工具切换功能处理导航
            e.preventDefault();
        });
    });
    
    // 添加震动动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes navShake {
            0%, 100% { transform: translateX(0) scale(1.02); }
            25% { transform: translateX(-2px) scale(1.02); }
            75% { transform: translateX(2px) scale(1.02); }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        
        .nav-link:hover {
            animation: float 2s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);
}

// 创建粒子效果
function createParticles(container, x, y) {
    if (!container) return;
    
    // 限制粒子数量
    if (container.children.length > 10) {
        container.removeChild(container.firstChild);
    }
    
    // 创建新粒子
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    // 随机大小和颜色
    const size = Math.random() * 4 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // 随机颜色
    const colors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.background = color;
    
    // 随机动画
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 50 + 30;
    const duration = Math.random() * 0.8 + 0.5;
    
    particle.style.opacity = '1';
    particle.style.transition = `all ${duration}s ease-out`;
    
    container.appendChild(particle);
    
    // 动画结束后移除粒子
    setTimeout(() => {
        particle.style.transform = `translate(${Math.cos(angle) * speed}px, ${Math.sin(angle) * speed}px)`;
        particle.style.opacity = '0';
    }, 10);
    
    setTimeout(() => {
        if (particle.parentNode === container) {
            container.removeChild(particle);
        }
    }, duration * 1000);
}

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

// 添加CSS动画样式
function addNavStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* 导航加载动画 */
        .nav-menu.loading .nav-link span {
            background: linear-gradient(90deg, 
                #e5e7eb 25%, 
                #d1d5db 50%, 
                #e5e7eb 75%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: shimmer 2s infinite linear;
        }
        
        body.dark-mode .nav-menu.loading .nav-link span {
            background: linear-gradient(90deg, 
                #4b5563 25%, 
                #6b7280 50%, 
                #4b5563 75%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
        }
        
        @keyframes shimmer {
            to {
                background-position: 200% center;
            }
        }
    `;
    document.head.appendChild(style);
}

// 初始化导航样式
addNavStyles();

// 移动端菜单功能
function initMobileMenu() {
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(mobileMenuBtn);
    
    mobileMenuBtn.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // 点击其他地方关闭菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-btn')) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    });
}

// 初始化移动端菜单
if (window.innerWidth <= 768) {
    initMobileMenu();
}

// 窗口大小变化时重新初始化移动端菜单
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        if (!document.querySelector('.mobile-menu-btn')) {
            initMobileMenu();
        }
    } else {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.remove();
        }
        document.querySelector('.sidebar').classList.remove('active');
    }
});

// 工具初始化函数
function initTools() {
    // 获取当前工具ID
    const currentToolLink = document.querySelector('.nav-link.active');
    if (currentToolLink) {
        const toolId = currentToolLink.getAttribute('data-tool');
        const initEvent = new CustomEvent(`init-${toolId}-tool`);
        document.dispatchEvent(initEvent);
    }
}

// 页面加载完成后初始化工具
setTimeout(initTools, 100);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
});

// 动态加载导航菜单
async function loadNavigationMenu() {
    try {
        const response = await fetch('nav.json');
        if (!response.ok) {
            throw new Error('导航数据加载失败');
        }

        const navItems = await response.json();
        const navMenu = document.getElementById('navMenu');

        // 清空现有菜单
        navMenu.innerHTML = '';

        // 获取当前页面的文件名
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // 生成导航菜单
        navItems.forEach(item => {
            const navItem = document.createElement('li');
            navItem.className = 'nav-item';

            // 检查是否为当前页面
            const isActive = item.url === currentPage;

            navItem.innerHTML = `
                <a href="${item.url}" class="nav-link ${isActive ? 'active' : ''}" data-tool="${item.id}">
                    <i class="${item.icon}"></i>
                    <span>${item.name}</span>
                </a>
            `;

            navMenu.appendChild(navItem);
        });

    } catch (error) {
        console.error('加载导航菜单失败:', error);
        // 如果加载失败，显示一个错误消息
        const navMenu = document.getElementById('navMenu');
        navMenu.innerHTML = `
            <li class="nav-item">
                <a href="#" class="nav-link">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>导航加载失败</span>
                </a>
            </li>
        `;
    }
}

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