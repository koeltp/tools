// 图片压缩工具
document.addEventListener('DOMContentLoaded', function() {
    console.log('图片压缩工具开始加载...');
    
    // 工具元素
    const imageUpload = document.getElementById('imageUpload');
    const uploadArea = document.getElementById('uploadArea');
    const formatSelect = document.getElementById('formatSelect');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const resizeToggle = document.getElementById('resizeToggle');
    const resizeOptions = document.getElementById('resizeOptions');
    const maxWidth = document.getElementById('maxWidth');
    const maxHeight = document.getElementById('maxHeight');
    const keepAspectRatio = document.getElementById('keepAspectRatio');
    const compressBtn = document.getElementById('compressImage');
    const downloadBtn = document.getElementById('downloadImage');
    const batchBtn = document.getElementById('batchCompress');
    const clearBtn = document.getElementById('clearAll');
    
    // 预览元素
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalInfo = document.getElementById('originalInfo');
    const compressedInfo = document.getElementById('compressedInfo');
    
    // 统计元素
    const sizeReduction = document.getElementById('sizeReduction');
    const compressionRatio = document.getElementById('compressionRatio');
    const compressionFactor = document.getElementById('compressionFactor');
    
    // 文件信息元素
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileDimensions = document.getElementById('fileDimensions');
    const fileSize = document.getElementById('fileSize');
    
    // 批量结果
    const batchResultsContainer = document.getElementById('batchResultsContainer');
    const batchResults = document.getElementById('batchResults');
    
    // 当前处理的图片数据
    let currentImage = null;
    let originalImageData = null;
    let compressedImageData = null;
    let currentFileName = '';
    let batchImages = [];
    
    // 检查元素是否存在
    console.log('检查元素加载情况:', {
        imageUpload: !!imageUpload,
        uploadArea: !!uploadArea,
        compressBtn: !!compressBtn
    });
    
    // 更新质量显示
    if (qualitySlider && qualityValue) {
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = qualitySlider.value;
        });
    }
    
    // 切换尺寸调整选项
    if (resizeToggle && resizeOptions) {
        resizeToggle.addEventListener('change', () => {
            resizeOptions.style.display = resizeToggle.checked ? 'block' : 'none';
        });
    }
    
    // 保持宽高比的计算
    if (maxWidth && maxHeight && keepAspectRatio) {
        maxWidth.addEventListener('input', () => {
            if (keepAspectRatio.checked && currentImage) {
                const ratio = currentImage.height / currentImage.width;
                maxHeight.value = Math.round(maxWidth.value * ratio);
            }
        });
        
        maxHeight.addEventListener('input', () => {
            if (keepAspectRatio.checked && currentImage) {
                const ratio = currentImage.width / currentImage.height;
                maxWidth.value = Math.round(maxHeight.value * ratio);
            }
        });
    }
    
    // 拖放上传功能
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.style.borderColor = '#4361ee';
            uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.style.borderColor = '';
            uploadArea.style.backgroundColor = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.style.borderColor = '';
            uploadArea.style.backgroundColor = '';
            
            const files = e.dataTransfer.files;
            console.log('拖拽文件:', files);
            if (files.length > 0) {
                handleImageFiles(files);
            }
        });
        
        // 为上传区域添加点击事件
        uploadArea.addEventListener('click', () => {
            console.log('点击上传区域');
            imageUpload.click();
        });
    }
    
    // 文件选择变化
    if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
            console.log('文件选择变化:', e.target.files);
            const files = e.target.files;
            if (files.length > 0) {
                handleImageFiles(files);
            }
        });
    }
    
    // 处理图片文件
    function handleImageFiles(files) {
        console.log('处理图片文件:', files);
        
        // 重置状态
        resetUI();
        
        if (files.length === 1) {
            // 单张图片
            const file = files[0];
            console.log('单张图片:', file);
            loadImage(file);
        } else {
            // 批量处理
            batchImages = Array.from(files);
            console.log('批量图片:', batchImages.length);
            showNotification(`已选择 ${batchImages.length} 张图片，准备批量处理`);
            
            // 加载第一张图片预览
            if (batchImages.length > 0) {
                loadImage(batchImages[0]);
            }
        }
    }
    
    // 加载图片
    function loadImage(file) {
        console.log('加载图片:', file.name, file.type, file.size);
        
        if (!file.type.match('image.*')) {
            showNotification('请选择有效的图片文件', 'error');
            console.error('无效的文件类型:', file.type);
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            showNotification('图片大小不能超过10MB', 'error');
            console.error('文件过大:', file.size);
            return;
        }
        
        currentFileName = file.name;
        const reader = new FileReader();
        
        reader.onload = function(e) {
            console.log('文件读取完成');
            const img = new Image();
            
            img.onload = function() {
                console.log('图片加载完成，尺寸:', img.width, 'x', img.height);
                currentImage = img;
                originalImageData = {
                    width: img.width,
                    height: img.height,
                    size: file.size,
                    format: getFileExtension(file.name).toUpperCase(),
                    dataUrl: e.target.result
                };
                
                // 显示原始图片
                displayOriginalImage();
                
                // 显示文件信息
                displayFileInfo(file, img);
                
                // 自动压缩
                setTimeout(compressCurrentImage, 500);
            };
            
            img.onerror = function() {
                console.error('图片加载失败');
                showNotification('图片加载失败，请重试', 'error');
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            console.error('文件读取失败');
            showNotification('文件读取失败，请重试', 'error');
        };
        
        reader.readAsDataURL(file);
    }
    
    // 显示文件信息
    function displayFileInfo(file, img) {
        fileName.textContent = file.name;
        fileDimensions.textContent = `${img.width} × ${img.height} px`;
        fileSize.textContent = formatFileSize(file.size);
        
        fileInfo.style.display = 'block';
    }
    
    // 显示原始图片
    function displayOriginalImage() {
        console.log('显示原始图片');
        if (!currentImage || !originalImageData) return;
        
        // 显示图片
        originalPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = originalImageData.dataUrl;
        img.alt = '原始图片';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        originalPreview.appendChild(img);
        
        // 更新信息
        originalInfo.innerHTML = `
            <div>尺寸: <span>${originalImageData.width}</span> × <span>${originalImageData.height}</span> px</div>
            <div>大小: <span>${formatFileSize(originalImageData.size)}</span></div>
            <div>格式: <span>${originalImageData.format}</span></div>
        `;
    }
    
    // 压缩当前图片
    function compressCurrentImage() {
        console.log('开始压缩图片');
        if (!currentImage) {
            showNotification('请先选择图片', 'error');
            return;
        }
        
        const quality = parseInt(qualitySlider.value) / 100;
        const format = formatSelect.value === 'original' ? 
            getFileExtension(currentFileName) : formatSelect.value;
        const shouldResize = resizeToggle.checked;
        const targetWidth = parseInt(maxWidth.value);
        const targetHeight = parseInt(maxHeight.value);
        
        console.log('压缩参数:', { quality, format, shouldResize, targetWidth, targetHeight });
        
        // 创建Canvas
        const canvas = document.createElement('canvas');
        let width = currentImage.width;
        let height = currentImage.height;
        
        // 计算调整后的尺寸
        if (shouldResize) {
            if (width > targetWidth || height > targetHeight) {
                const ratio = Math.min(targetWidth / width, targetHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图片
        const ctx = canvas.getContext('2d');
        
        // 处理PNG透明背景
        if (format === 'jpeg' || format === 'jpg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
        }
        
        ctx.drawImage(currentImage, 0, 0, width, height);
        
        console.log('Canvas绘制完成，开始转换为Blob');
        
        // 获取压缩后的数据
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error('图片压缩失败，Blob为空');
                showNotification('图片压缩失败', 'error');
                return;
            }
            
            console.log('Blob创建成功，大小:', blob.size);
            
            const reader = new FileReader();
            reader.onload = function(e) {
                compressedImageData = {
                    width: width,
                    height: height,
                    size: blob.size,
                    format: format.toUpperCase(),
                    dataUrl: e.target.result,
                    blob: blob
                };
                
                console.log('压缩完成，压缩率:', ((1 - compressedImageData.size / originalImageData.size) * 100).toFixed(1) + '%');
                
                // 显示压缩后图片
                displayCompressedImage();
                
                // 更新统计信息
                updateCompressionStats();
                
                // 启用下载按钮
                downloadBtn.disabled = false;
                
                showNotification('图片压缩完成');
            };
            reader.readAsDataURL(blob);
        }, `image/${format === 'jpg' ? 'jpeg' : format}`, quality);
    }
    
    // 显示压缩后图片
    function displayCompressedImage() {
        if (!compressedImageData) return;
        
        // 显示图片
        compressedPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = compressedImageData.dataUrl;
        img.alt = '压缩后图片';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        compressedPreview.appendChild(img);
        
        // 更新信息（移除了压缩率显示，因为下面会统一显示）
        compressedInfo.innerHTML = `
            <div>尺寸: <span>${compressedImageData.width}</span> × <span>${compressedImageData.height}</span> px</div>
            <div>大小: <span>${formatFileSize(compressedImageData.size)}</span></div>
            <div>格式: <span>${compressedImageData.format}</span></div>
        `;
    }
    
    // 更新压缩统计
    function updateCompressionStats() {
        if (!originalImageData || !compressedImageData) return;
        
        const originalSize = originalImageData.size;
        const compressedSize = compressedImageData.size;
        const reduction = originalSize - compressedSize;
        
        // 计算压缩率（百分比）
        const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        
        // 计算压缩比（原大小/压缩后大小）
        const factor = originalSize > 0 ? (originalSize / compressedSize).toFixed(2) : "1.00";
        
        sizeReduction.textContent = formatFileSize(reduction);
        compressionRatio.textContent = `${ratio}%`;
        compressionFactor.textContent = `${factor}倍`;
    }
    
    // 批量压缩
    function compressBatch() {
        console.log('开始批量压缩');
        if (batchImages.length === 0) {
            showNotification('请先选择多张图片', 'error');
            return;
        }
        
        batchResultsContainer.style.display = 'block';
        batchResults.innerHTML = '正在处理...';
        
        const results = [];
        let processed = 0;
        
        batchImages.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext('2d');
                    const format = formatSelect.value === 'original' ? 
                        getFileExtension(file.name) : formatSelect.value;
                    const quality = parseInt(qualitySlider.value) / 100;
                    
                    // 处理PNG透明背景
                    if (format === 'jpeg' || format === 'jpg') {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, img.width, img.height);
                    }
                    
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const originalSize = file.size;
                            const compressedSize = blob.size;
                            const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
                            const factor = originalSize > 0 ? (originalSize / compressedSize).toFixed(2) : "1.00";
                            
                            results.push({
                                name: file.name,
                                originalSize: originalSize,
                                compressedSize: compressedSize,
                                ratio: ratio,
                                factor: factor,
                                blob: blob
                            });
                        }
                        
                        processed++;
                        
                        // 更新进度
                        batchResults.innerHTML = `已处理 ${processed}/${batchImages.length} 张图片...`;
                        
                        if (processed === batchImages.length) {
                            displayBatchResults(results);
                        }
                    }, `image/${format === 'jpg' ? 'jpeg' : format}`, quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    
    // 显示批量结果
    function displayBatchResults(results) {
        let html = '<div class="batch-results">';
        let totalOriginal = 0;
        let totalCompressed = 0;
        
        results.forEach((result, index) => {
            totalOriginal += result.originalSize;
            totalCompressed += result.compressedSize;
            
            html += `
                <div class="batch-item">
                    <div class="batch-file">${result.name}</div>
                    <div class="batch-stats">
                        <span>${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}</span>
                        <span class="batch-ratio">${result.ratio}%</span>
                    </div>
                    <button class="btn btn-small" data-index="${index}">下载</button>
                </div>
            `;
        });
        
        const totalRatio = totalOriginal > 0 ? ((1 - totalCompressed / totalOriginal) * 100).toFixed(1) : "0.0";
        const totalFactor = totalCompressed > 0 ? (totalOriginal / totalCompressed).toFixed(2) : "1.00";
        
        html += `
            <div class="batch-summary">
                <div>总计: ${formatFileSize(totalOriginal)} → ${formatFileSize(totalCompressed)}</div>
                <div>总压缩率: <strong>${totalRatio}%</strong> (${totalFactor}倍)</div>
            </div>
        `;
        
        batchResults.innerHTML = html;
        
        // 为下载按钮添加事件
        batchResults.querySelectorAll('.btn-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                downloadCompressedImage(results[index].blob, results[index].name);
            });
        });
    }
    
    // 下载压缩后的图片
    function downloadCompressedImage(blob, filename) {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        const format = formatSelect.value === 'original' ? 
            getFileExtension(filename) : formatSelect.value;
        
        a.download = `${nameWithoutExt}_compressed.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // 重置UI
    function resetUI() {
        console.log('重置UI');
        currentImage = null;
        originalImageData = null;
        compressedImageData = null;
        
        originalPreview.innerHTML = '<p class="preview-placeholder">原始图片预览</p>';
        compressedPreview.innerHTML = '<p class="preview-placeholder">压缩后图片预览</p>';
        
        originalInfo.innerHTML = `
            <div>尺寸: <span>--</span> × <span>--</span> px</div>
            <div>大小: <span>--</span></div>
            <div>格式: <span>--</span></div>
        `;
        
        compressedInfo.innerHTML = `
            <div>尺寸: <span>--</span> × <span>--</span> px</div>
            <div>大小: <span>--</span></div>
            <div>格式: <span>--</span></div>
        `;
        
        sizeReduction.textContent = '--';
        compressionRatio.textContent = '--%';
        compressionFactor.textContent = '--倍';
        
        if (downloadBtn) downloadBtn.disabled = true;
        if (batchResultsContainer) batchResultsContainer.style.display = 'none';
        
        // 隐藏文件信息
        if (fileInfo) fileInfo.style.display = 'none';
        
        batchImages = [];
    }
    
    // 工具函数
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    }
    
    function showNotification(message, type = 'success') {
        console.log('显示通知:', message, type);
        const notification = document.createElement('div');
        notification.className = `copy-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    // 事件监听
    if (compressBtn) {
        compressBtn.addEventListener('click', compressCurrentImage);
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (compressedImageData && compressedImageData.blob) {
                downloadCompressedImage(compressedImageData.blob, currentFileName);
            }
        });
    }
    
    if (batchBtn) {
        batchBtn.addEventListener('click', compressBatch);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', resetUI);
    }
    
    // 初始化
    console.log('图片压缩工具加载完成');
});