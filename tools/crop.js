// 图片裁剪工具
document.addEventListener('DOMContentLoaded', function() {
    console.log('图片裁剪工具开始加载...');
    
    // 工具元素
    const cropImageUpload = document.getElementById('cropImageUpload');
    const cropUploadArea = document.getElementById('cropUploadArea');
    const cropContainer = document.getElementById('cropContainer');
    const cropImage = document.getElementById('cropImage');
    const cropBox = document.getElementById('cropBox');
    const cropInfo = document.getElementById('cropInfo');
    const cropDimensions = document.getElementById('cropDimensions');
    const imageDimensions = document.getElementById('imageDimensions');
    
    // 选项元素
    const aspectRatioBtns = document.querySelectorAll('.aspect-btn');
    const rotateSlider = document.getElementById('rotateSlider');
    const rotateValue = document.getElementById('rotateValue');
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const resetRotateBtn = document.getElementById('resetRotateBtn');
    const scaleSlider = document.getElementById('scaleSlider');
    const scaleValue = document.getElementById('scaleValue');
    const flipHorizontalBtn = document.getElementById('flipHorizontalBtn');
    const flipVerticalBtn = document.getElementById('flipVerticalBtn');
    const outputFormat = document.getElementById('outputFormat');
    const outputQuality = document.getElementById('outputQuality');
    const qualityValue = document.getElementById('qualityValue');
    
    // 按钮元素
    const resetCropBtn = document.getElementById('resetCropBtn');
    const cropApplyBtn = document.getElementById('cropApplyBtn');
    const clearCropBtn = document.getElementById('clearCropBtn');
    const downloadCropBtn = document.getElementById('downloadCropBtn');
    const editAgainBtn = document.getElementById('editAgainBtn');
    
    // 结果元素
    const cropResultSection = document.getElementById('cropResultSection');
    const resultCanvas = document.getElementById('resultCanvas');
    const resultFileSize = document.getElementById('resultFileSize');
    
    // 全局变量
    let originalImage = null;
    let currentRotation = 0;
    let currentScale = 100;
    let currentFlipH = false;
    let currentFlipV = false;
    let aspectRatio = 0;
    let isDraggingCrop = false;
    let isResizingCrop = false;
    let isDrawingCrop = false;
    let dragStart = { x: 0, y: 0 };
    let resizeHandle = null;
    let croppedImageData = null;
    let cropBoxCreated = false;
    
    // ===== 文件上传处理 =====
    function handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                originalImage = {
                    src: e.target.result,
                    width: img.width,
                    height: img.height
                };
                
                displayCropImage();
                cropContainer.style.display = 'block';
                cropInfo.style.display = 'block';
                cropBox.style.display = 'block';
                cropResultSection.style.display = 'none';
                resetCropBtn.disabled = false;
                clearCropBtn.disabled = false;
                cropBoxCreated = true;
                
                // 更新图片尺寸显示
                imageDimensions.textContent = `${img.width} x ${img.height}`;
                
                // 自动生成默认裁剪框
                setTimeout(() => {
                    initializeCropBox();
                }, 100);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // 显示裁剪图片
    function displayCropImage() {
        if (!originalImage) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置canvas大小
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        
        // 存储最新的变换后canvas用于裁剪
        window.transformedCanvas = canvas;
        
        // 创建新图像用于应用变换
        const tempImg = new Image();
        tempImg.src = originalImage.src;
        tempImg.onload = function() {
            // 清空canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 保存当前状态
            ctx.save();
            
            // 移到中心进行旋转和缩放
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((currentRotation * Math.PI) / 180);
            ctx.scale(currentFlipH ? -1 : 1, currentFlipV ? -1 : 1);
            ctx.scale(currentScale / 100, currentScale / 100);
            
            // 绘制图像
            ctx.drawImage(tempImg, -canvas.width / 2, -canvas.height / 2);
            ctx.restore();
            
            cropImage.src = canvas.toDataURL();
        };
    }
    
    // 初始化裁剪框
    function initializeCropBox() {
        if (!originalImage) return;
        
        const wrapper = document.querySelector('.crop-image-wrapper');
        const wrapperRect = wrapper.getBoundingClientRect();
        
        // 获取图片实际显示的宽高
        const imgActualWidth = cropImage.offsetWidth;
        const imgActualHeight = cropImage.offsetHeight;
        
        // 裁剪框大小为图片的60%
        const width = imgActualWidth * 0.6;
        const height = imgActualHeight * 0.6;
        
        // 图片在wrapper中的偏移（因为flex居中显示）
        const imgOffsetX = (wrapperRect.width - imgActualWidth) / 2;
        const imgOffsetY = (wrapperRect.height - imgActualHeight) / 2;
        
        // 裁剪框在图片中央
        const left = imgOffsetX + (imgActualWidth - width) / 2;
        const top = imgOffsetY + (imgActualHeight - height) / 2;
        
        cropBox.style.left = left + 'px';
        cropBox.style.top = top + 'px';
        cropBox.style.width = width + 'px';
        cropBox.style.height = height + 'px';
        
        updateCropInfo();
        attachCropBoxEvents();
    }
    
    // ===== 在图片上绘制裁剪框 =====
    function attachImageDrawEvents() {
        const wrapper = document.querySelector('.crop-image-wrapper');
        wrapper.addEventListener('mousedown', handleImageMouseDown);
    }
    
    function handleImageMouseDown(e) {
        if (cropBoxCreated) return;
        if (e.target !== cropImage) return;
        
        const wrapper = document.querySelector('.crop-image-wrapper');
        const wrapperRect = wrapper.getBoundingClientRect();
        const imgRect = cropImage.getBoundingClientRect();
        
        isDrawingCrop = true;
        const startX = e.clientX - wrapperRect.left;
        const startY = e.clientY - wrapperRect.top;
        
        const handleMouseMove = (moveEvent) => {
            if (!isDrawingCrop) return;
            
            const currentX = moveEvent.clientX - wrapperRect.left;
            const currentY = moveEvent.clientY - wrapperRect.top;
            
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            
            if (width > 20 && height > 20) {
                cropBox.style.left = left + 'px';
                cropBox.style.top = top + 'px';
                cropBox.style.width = width + 'px';
                cropBox.style.height = height + 'px';
                cropBox.style.display = 'block';
                
                updateCropInfo();
            }
        };
        
        const handleMouseUp = () => {
            isDrawingCrop = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            if (parseFloat(cropBox.style.width) > 20 && parseFloat(cropBox.style.height) > 20) {
                cropBoxCreated = true;
                cropInfo.style.display = 'block';
                attachCropBoxEvents();
            }
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    // ===== 裁剪框事件处理 =====
    function attachCropBoxEvents() {
        cropBox.addEventListener('mousedown', handleCropBoxMouseDown);
        document.addEventListener('mousemove', handleCropBoxMouseMove);
        document.addEventListener('mouseup', handleCropBoxMouseUp);
    }
    
    function handleCropBoxMouseDown(e) {
        const rect = cropBox.getBoundingClientRect();
        const wrapper = document.querySelector('.crop-image-wrapper');
        const wrapperRect = wrapper.getBoundingClientRect();
        const handle = e.target.closest('.crop-handle');
        
        if (handle) {
            isResizingCrop = true;
            const classList = handle.className;
            if (classList.includes('nw')) resizeHandle = 'nw';
            else if (classList.includes('ne')) resizeHandle = 'ne';
            else if (classList.includes('sw')) resizeHandle = 'sw';
            else if (classList.includes('se')) resizeHandle = 'se';
            else if (classList.includes('n')) resizeHandle = 'n';
            else if (classList.includes('s')) resizeHandle = 's';
            else if (classList.includes('w')) resizeHandle = 'w';
            else if (classList.includes('e')) resizeHandle = 'e';
        } else {
            isDraggingCrop = true;
        }
        
        dragStart = {
            x: e.clientX,
            y: e.clientY,
            boxLeft: rect.left - wrapperRect.left,
            boxTop: rect.top - wrapperRect.top,
            boxWidth: rect.width,
            boxHeight: rect.height
        };
        
        e.preventDefault();
    }
    
    function handleCropBoxMouseMove(e) {
        if (!isDraggingCrop && !isResizingCrop) return;
        
        const wrapper = document.querySelector('.crop-image-wrapper');
        const wrapperRect = wrapper.getBoundingClientRect();
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        if (isDraggingCrop) {
            const newLeft = Math.max(0, Math.min(dragStart.boxLeft + dx, wrapperRect.width - dragStart.boxWidth));
            const newTop = Math.max(0, Math.min(dragStart.boxTop + dy, wrapperRect.height - dragStart.boxHeight));
            
            cropBox.style.left = newLeft + 'px';
            cropBox.style.top = newTop + 'px';
        } else if (isResizingCrop) {
            resizeCropBox(dx, dy, wrapperRect);
        }
        
        updateCropInfo();
    }
    
    function handleCropBoxMouseUp() {
        isDraggingCrop = false;
        isResizingCrop = false;
        resizeHandle = null;
    }
    
    function resizeCropBox(dx, dy, wrapperRect) {
        let newLeft = dragStart.boxLeft;
        let newTop = dragStart.boxTop;
        let newWidth = dragStart.boxWidth;
        let newHeight = dragStart.boxHeight;
        const aspectRatioValue = dragStart.boxWidth / dragStart.boxHeight;
        
        switch(resizeHandle) {
            case 'nw': {
                // 对角拖动：保持长宽比
                newLeft += dx;
                newWidth -= dx;
                newHeight = newWidth / aspectRatioValue;
                newTop = dragStart.boxTop - (newHeight - dragStart.boxHeight);
                break;
            }
            case 'ne': {
                // 对角拖动：保持长宽比
                newWidth += dx;
                newHeight = newWidth / aspectRatioValue;
                newTop = dragStart.boxTop - (newHeight - dragStart.boxHeight);
                break;
            }
            case 'sw': {
                // 对角拖动：保持长宽比
                newLeft += dx;
                newWidth -= dx;
                newHeight = newWidth / aspectRatioValue;
                break;
            }
            case 'se': {
                // 对角拖动：保持长宽比
                newWidth += dx;
                newHeight = newWidth / aspectRatioValue;
                break;
            }
            case 'n': {
                // 上边：鼠标跟随上边移动，改变高度
                newTop = dragStart.boxTop + dy;
                newHeight = dragStart.boxHeight - dy;
                break;
            }
            case 's': {
                // 下边：鼠标跟随下边移动，改变高度
                newHeight = dragStart.boxHeight + dy;
                break;
            }
            case 'w': {
                // 左边：鼠标跟随左边移动，改变宽度
                newLeft = dragStart.boxLeft + dx;
                newWidth = dragStart.boxWidth - dx;
                break;
            }
            case 'e': {
                // 右边：鼠标跟随右边移动，改变宽度
                newWidth = dragStart.boxWidth + dx;
                break;
            }
        }
        
        // 限制最小大小
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);
        
        // 对于上边和左边，如果尺寸被限制到最小值，调整位置以保证右下角相对位置不变
        if (resizeHandle === 'n' && newHeight < 50) {
            newTop = dragStart.boxTop + dragStart.boxHeight - 50;
        }
        if (resizeHandle === 'w' && newWidth < 50) {
            newLeft = dragStart.boxLeft + dragStart.boxWidth - 50;
        }
        
        // 限制边界
        newLeft = Math.max(0, Math.min(newLeft, wrapperRect.width - newWidth));
        newTop = Math.max(0, Math.min(newTop, wrapperRect.height - newHeight));
        
        cropBox.style.left = newLeft + 'px';
        cropBox.style.top = newTop + 'px';
        cropBox.style.width = newWidth + 'px';
        cropBox.style.height = newHeight + 'px';
    }
    
    function updateCropInfo() {
        const width = Math.round(parseFloat(cropBox.style.width));
        const height = Math.round(parseFloat(cropBox.style.height));
        cropDimensions.textContent = `${width} x ${height}`;
        cropApplyBtn.disabled = false;
    }
    
    // ===== 纵横比处理 =====
    aspectRatioBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            aspectRatioBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const ratio = this.dataset.ratio;
            if (ratio === '0') {
                aspectRatio = 0;
            } else {
                const parts = ratio.split('/');
                aspectRatio = parseFloat(parts[0]) / parseFloat(parts[1]);
            }
            
            // 根据纵横比重新调整裁剪框
            const wrapper = document.querySelector('.crop-image-wrapper');
            const wrapperRect = wrapper.getBoundingClientRect();
            const currentWidth = parseFloat(cropBox.style.width);
            
            if (aspectRatio > 0) {
                const newHeight = currentWidth / aspectRatio;
                cropBox.style.height = Math.min(newHeight, wrapperRect.height) + 'px';
                updateCropInfo();
            }
        });
    });
    
    // ===== 旋转处理 =====
    rotateSlider.addEventListener('input', function() {
        currentRotation = parseInt(this.value);
        rotateValue.textContent = currentRotation;
        displayCropImage();
        initializeCropBox();
    });
    
    rotateLeftBtn.addEventListener('click', function() {
        currentRotation = (currentRotation - 90 + 360) % 360;
        rotateSlider.value = currentRotation;
        rotateValue.textContent = currentRotation;
        displayCropImage();
        initializeCropBox();
    });
    
    rotateRightBtn.addEventListener('click', function() {
        currentRotation = (currentRotation + 90) % 360;
        rotateSlider.value = currentRotation;
        rotateValue.textContent = currentRotation;
        displayCropImage();
        initializeCropBox();
    });
    
    resetRotateBtn.addEventListener('click', function() {
        currentRotation = 0;
        rotateSlider.value = 0;
        rotateValue.textContent = 0;
        displayCropImage();
        initializeCropBox();
    });
    
    // ===== 缩放处理 =====
    scaleSlider.addEventListener('input', function() {
        currentScale = parseInt(this.value);
        scaleValue.textContent = currentScale;
        displayCropImage();
        initializeCropBox();
    });
    
    // ===== 翻转处理 =====
    flipHorizontalBtn.addEventListener('click', function() {
        currentFlipH = !currentFlipH;
        displayCropImage();
        initializeCropBox();
    });
    
    flipVerticalBtn.addEventListener('click', function() {
        currentFlipV = !currentFlipV;
        displayCropImage();
        initializeCropBox();
    });
    
    // ===== 输出质量处理 =====
    outputQuality.addEventListener('input', function() {
        qualityValue.textContent = this.value;
    });
    
    // ===== 操作按钮处理 =====
    resetCropBtn.addEventListener('click', function() {
        currentRotation = 0;
        currentScale = 100;
        currentFlipH = false;
        currentFlipV = false;
        rotateSlider.value = 0;
        rotateValue.textContent = 0;
        scaleSlider.value = 100;
        scaleValue.textContent = 100;
        
        displayCropImage();
        
        // 重新初始化默认裁剪框
        initializeCropBox();
        
        // 重置纵横比按钮
        aspectRatioBtns.forEach(b => b.classList.remove('active'));
        aspectRatioBtns[0].classList.add('active');
        aspectRatio = 0;
    });
    
    cropApplyBtn.addEventListener('click', applyCrop);
    clearCropBtn.addEventListener('click', clearCrop);
    downloadCropBtn.addEventListener('click', downloadCroppedImage);
    editAgainBtn.addEventListener('click', editAgain);
    
    function applyCrop() {
        if (!originalImage || !window.transformedCanvas) return;
        
        const imgRect = cropImage.getBoundingClientRect();
        const boxRect = cropBox.getBoundingClientRect();
        const wrapper = document.querySelector('.crop-image-wrapper');
        const wrapperRect = wrapper.getBoundingClientRect();
        
        // 计算裁剪框相对于图片的像素位置（基于显示大小的比例）
        const offsetLeft = boxRect.left - imgRect.left;
        const offsetTop = boxRect.top - imgRect.top;
        
        // 根据图片显示大小和原始大小的比例，计算在原始图片上的像素位置
        const scaleX = window.transformedCanvas.width / imgRect.width;
        const scaleY = window.transformedCanvas.height / imgRect.height;
        
        const cropPixelX = Math.round(offsetLeft * scaleX);
        const cropPixelY = Math.round(offsetTop * scaleY);
        const cropPixelWidth = Math.round(boxRect.width * scaleX);
        const cropPixelHeight = Math.round(boxRect.height * scaleY);
        
        // 从转换后的canvas上裁剪
        resultCanvas.width = cropPixelWidth;
        resultCanvas.height = cropPixelHeight;
        const resultCtx = resultCanvas.getContext('2d');
        
        resultCtx.drawImage(window.transformedCanvas,
            cropPixelX, cropPixelY, cropPixelWidth, cropPixelHeight,
            0, 0, cropPixelWidth, cropPixelHeight);
        
        // 转换为图片数据用于下载
        croppedImageData = resultCanvas.toDataURL(outputFormat.value, parseInt(outputQuality.value) / 100);
        
        const fileSize = (croppedImageData.length * 0.75 / 1024).toFixed(2);
        resultFileSize.textContent = `文件大小: ${fileSize} KB`;
        
        cropResultSection.style.display = 'block';
    }
    
    function clearCrop() {
        originalImage = null;
        currentRotation = 0;
        currentScale = 100;
        currentFlipH = false;
        currentFlipV = false;
        cropContainer.style.display = 'none';
        cropInfo.style.display = 'none';
        cropBox.style.display = 'none';
        cropResultSection.style.display = 'none';
        cropImageUpload.value = '';
        resetCropBtn.disabled = true;
        cropApplyBtn.disabled = true;
        clearCropBtn.disabled = true;
        cropBoxCreated = false;
    }
    
    function downloadCroppedImage() {
        if (!croppedImageData) return;
        
        const link = document.createElement('a');
        link.href = croppedImageData;
        const ext = outputFormat.value.split('/')[1] || 'png';
        link.download = `cropped_image_${Date.now()}.${ext}`;
        link.click();
    }
    
    function editAgain() {
        cropResultSection.style.display = 'none';
        cropContainer.style.display = 'block';
        cropInfo.style.display = 'block';
    }
    
    // ===== 拖拽上传处理 =====
    cropUploadArea.addEventListener('click', () => cropImageUpload.click());
    
    cropImageUpload.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleImageUpload(this.files[0]);
        }
    });
    
    cropUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        cropUploadArea.classList.add('drag-over');
    });
    
    cropUploadArea.addEventListener('dragleave', () => {
        cropUploadArea.classList.remove('drag-over');
    });
    
    cropUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        cropUploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    });
    
    // 初始化
    resetCropBtn.disabled = true;
    cropApplyBtn.disabled = true;
    clearCropBtn.disabled = true;
});
