// 二维码工具 - 不使用模块化，因为需要访问全局 QRCode 和 jsQR
document.addEventListener('DOMContentLoaded', function() {
    // 工具元素
    const qrcodeInput = document.getElementById('qrcodeInput');
    const qrcodeSize = document.getElementById('qrcodeSize');
    const qrcodeSizeValue = document.getElementById('qrcodeSizeValue');
    const qrcodeTextResult = document.getElementById('qrcodeTextResult');
    const qrcodeCanvas = document.getElementById('qrcodeCanvas');
    const qrcodeUpload = document.getElementById('qrcodeUpload');
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const decodeResult = document.getElementById('decodeResult');
    const qrcodeOptions = document.querySelectorAll('.crypto-option[data-qrcode-mode]');
    const qrcodeSections = document.querySelectorAll('.qrcode-section');
    
    let qrcodeMode = 'generate'; // 默认生成模式
    let currentQRCode = null;
    let uploadedImage = null;
    
    // 更新二维码尺寸显示
    qrcodeSize.addEventListener('input', () => {
        qrcodeSizeValue.textContent = `${qrcodeSize.value}px`;
    });
    
    // 设置二维码模式
    qrcodeOptions.forEach(option => {
        option.addEventListener('click', () => {
            qrcodeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            qrcodeMode = option.getAttribute('data-qrcode-mode');
            
            // 显示对应区域
            qrcodeSections.forEach(section => {
                section.style.display = 'none';
            });
            
            document.getElementById(`qrcode-${qrcodeMode}`).style.display = 'block';
        });
    });
    
    // 生成二维码函数
    function generateQRCode(text, size) {
        // 清除之前的二维码
        qrcodeCanvas.innerHTML = '';
        
        // 检查 QRCode 库是否已加载
        if (typeof QRCode === 'undefined') {
            qrcodeTextResult.textContent = '错误: QRCode 库未加载，请刷新页面重试';
            qrcodeTextResult.classList.remove('copyable');
            showNotification('QRCode 库加载失败');
            return;
        }
        
        try {
            // 创建二维码实例
            currentQRCode = new QRCode(qrcodeCanvas, {
                text: text,
                width: size,
                height: size,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            
            // 显示文本结果
            qrcodeTextResult.textContent = `已生成二维码:\n\n内容: ${text}\n\n尺寸: ${size} × ${size} 像素\n\n提示: 点击上方二维码可下载，点击此处文本可复制`;
            
            // 为文本结果添加点击复制功能
            setupCopyOnClick(qrcodeTextResult, text);
            
            // 为二维码图片添加点击下载功能
            setTimeout(() => {
                const qrImg = qrcodeCanvas.querySelector('img');
                if (qrImg) {
                    qrImg.style.cursor = 'pointer';
                    qrImg.title = '点击下载二维码';
                    qrImg.addEventListener('click', () => {
                        downloadQRCode(text);
                    });
                }
                
                // 也为canvas添加点击下载功能
                const qrCanvas = qrcodeCanvas.querySelector('canvas');
                if (qrCanvas) {
                    qrCanvas.style.cursor = 'pointer';
                    qrCanvas.title = '点击下载二维码';
                    qrCanvas.addEventListener('click', () => {
                        downloadQRCode(text);
                    });
                }
            }, 100);
            
        } catch (error) {
            qrcodeTextResult.textContent = `生成二维码时出错: ${error.message}`;
            qrcodeTextResult.classList.remove('copyable');
        }
    }
    
    // 下载二维码
    function downloadQRCode(text) {
        const canvas = qrcodeCanvas.querySelector('canvas');
        if (!canvas) return;
        
        try {
            const link = document.createElement('a');
            // 创建安全的文件名
            const safeText = text.substring(0, 20).replace(/[^a-z0-9]/gi, '_');
            link.download = `qrcode_${safeText || 'code'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            showNotification('二维码已下载');
        } catch (error) {
            showNotification('下载失败: ' + error.message);
        }
    }
    
    // 生成二维码按钮
    document.getElementById('generateQRCode').addEventListener('click', () => {
        const text = qrcodeInput.value.trim();
        const size = parseInt(qrcodeSize.value);
        
        if (!text) {
            qrcodeTextResult.textContent = '请输入要生成二维码的文本';
            qrcodeTextResult.classList.remove('copyable');
            return;
        }
        
        if (text.length > 1000) {
            qrcodeTextResult.textContent = '文本过长，请控制在1000字符以内';
            qrcodeTextResult.classList.remove('copyable');
            return;
        }
        
        generateQRCode(text, size);
        showNotification('二维码已生成');
    });
    
    // 下载二维码按钮
    document.getElementById('downloadQRCode').addEventListener('click', () => {
        const text = qrcodeInput.value.trim();
        if (!text) {
            showNotification('请先生成二维码');
            return;
        }
        
        downloadQRCode(text);
    });
    
    // 清空二维码
    document.getElementById('clearQRCode').addEventListener('click', () => {
        qrcodeInput.value = '';
        qrcodeCanvas.innerHTML = '';
        qrcodeTextResult.textContent = '等待生成二维码...';
        qrcodeTextResult.classList.remove('copyable');
        showNotification('已清空');
    });
    
    // 文件上传处理
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.2)';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    });
    
    qrcodeUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    });
    
    // 处理图片上传
    function handleImageUpload(file) {
        // 检查文件类型
        if (!file.type.match('image.*')) {
            showNotification('请上传图片文件 (JPG, PNG, GIF)');
            return;
        }
        
        // 检查文件大小（5MB限制）
        if (file.size > 5 * 1024 * 1024) {
            showNotification('图片大小不能超过5MB');
            return;
        }
        
        uploadedImage = file;
        
        // 预览图片
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="上传的二维码图片">`;
        };
        reader.readAsDataURL(file);
        
        showNotification('图片已上传');
    }
    
    // 解码二维码
    document.getElementById('decodeQRCode').addEventListener('click', () => {
        if (!uploadedImage) {
            decodeResult.textContent = '请先上传二维码图片';
            decodeResult.classList.remove('copyable');
            return;
        }
        
        // 检查 jsQR 库是否已加载
        if (typeof jsQR === 'undefined') {
            decodeResult.textContent = '错误: jsQR 库未加载，请刷新页面重试';
            decodeResult.classList.remove('copyable');
            showNotification('jsQR 库加载失败');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // 创建canvas用于解码
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                try {
                    // 尝试解码
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    
                    if (code) {
                        const resultText = `解码成功!\n\n二维码内容:\n${code.data}`;
                        decodeResult.textContent = resultText + `\n\n格式: ${code.chunks ? code.chunks.join(', ') : '未知'}\n\n提示: 点击此处文本可复制`;
                        
                        // 为结果添加点击复制功能
                        setupCopyOnClick(decodeResult, code.data);
                        
                        showNotification('二维码解码成功');
                    } else {
                        decodeResult.textContent = '解码失败: 未找到有效的二维码\n\n可能原因:\n1. 图片不是二维码\n2. 二维码已损坏\n3. 图片质量太差\n4. 二维码太复杂';
                        decodeResult.classList.remove('copyable');
                    }
                } catch (error) {
                    decodeResult.textContent = `解码时出错: ${error.message}`;
                    decodeResult.classList.remove('copyable');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(uploadedImage);
    });
    
    // 清空上传
    document.getElementById('clearUpload').addEventListener('click', () => {
        qrcodeUpload.value = '';
        uploadedImage = null;
        imagePreview.innerHTML = '<p>预览区域</p>';
        decodeResult.textContent = '等待解码...';
        decodeResult.classList.remove('copyable');
        showNotification('已清空上传');
    });
    
    // 初始化示例数据
    function initExampleData() {
        qrcodeInput.value = 'https://github.com/';
        qrcodeSize.value = 200;
        qrcodeSizeValue.textContent = '200px';
        
        // 自动生成示例二维码
        setTimeout(() => {
            if (typeof QRCode !== 'undefined') {
                document.getElementById('generateQRCode').click();
            } else {
                qrcodeTextResult.textContent = 'QRCode库正在加载，请稍候...';
                // 重试一次
                setTimeout(() => {
                    if (typeof QRCode !== 'undefined') {
                        document.getElementById('generateQRCode').click();
                    } else {
                        qrcodeTextResult.textContent = 'QRCode库加载失败，请刷新页面重试';
                    }
                }, 1000);
            }
        }, 500);
    }
    
    // 当工具激活时初始化示例数据
    document.addEventListener('init-qrcode-tool', initExampleData);
    
    // 如果二维码工具是默认激活的，直接初始化
    if (document.getElementById('qrcode-tool') && document.getElementById('qrcode-tool').classList.contains('active')) {
        initExampleData();
    }
    
    // 设置点击复制功能
    function setupCopyOnClick(element, text) {
        element.classList.add('copyable');
        element.addEventListener('click', () => {
            copyToClipboard(text);
            showNotification('已复制到剪贴板');
        });
    }
    
    // 复制到剪贴板函数
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    // 显示通知
    function showNotification(message) {
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
    
    console.log('二维码工具已加载');
});