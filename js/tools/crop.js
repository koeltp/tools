// 图片裁剪工具
document.addEventListener('DOMContentLoaded', function() {
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
    
    // ===== 滑块处理函数 =====
    function updateSliderProgress(slider, tooltipId, valueId) {
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const value = parseInt(slider.value);
        
        // 确保值在有效范围内
        const clampedValue = Math.max(min, Math.min(max, value));
        if (value !== clampedValue) {
            slider.value = clampedValue;
        }
        
        // 使用修正后的值计算进度
        const finalValue = clampedValue;
        const progress = ((finalValue - min) / (max - min)) * 100;
        
        // 确保进度在0-100%范围内
        const clampedProgress = Math.max(0, Math.min(100, progress));
        
        // 设置CSS自定义属性
        slider.style.setProperty('--progress', `${clampedProgress}%`);
        
        // 更新工具提示位置
        const tooltip = document.getElementById(tooltipId);
        if (tooltip) {
            tooltip.style.setProperty('--thumb-position', `${clampedProgress}%`);
        }
        
        // 更新刻度活动状态
        const ticksContainer = slider.closest('.option-group').querySelector('.slider-ticks');
        if (ticksContainer) {
            const ticks = ticksContainer.querySelectorAll('span');
            ticks.forEach(span => span.classList.remove('active'));
            
            // 计算最接近的刻度
            const tickValues = Array.from(ticks).map(tick => {
                const text = tick.textContent;
                return parseInt(text.replace(/[^\d-]/g, ''));
            });
            
            let closestIndex = 0;
            let minDiff = Math.abs(finalValue - tickValues[0]);
            for (let i = 1; i < tickValues.length; i++) {
                const diff = Math.abs(finalValue - tickValues[i]);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = i;
                }
            }
            
            ticks[closestIndex].classList.add('active');
        }
    }
    
    // 为每个滑块添加事件监听
    function setupSlider(sliderId, tooltipId, valueId, cssVarName) {
        const slider = document.getElementById(sliderId);
        const tooltip = document.getElementById(tooltipId);
        const valueDisplay = document.getElementById(valueId);
        
        if (!slider) return;
        
        // 初始化
        updateSliderProgress(slider, tooltipId, valueId);
        
        // 跟踪是否正在拖动
        let isDragging = false;
        let lastValidValue = parseInt(slider.value);
        
        slider.addEventListener('mousedown', function() {
            isDragging = true;
            lastValidValue = parseInt(this.value);
        });
        
        slider.addEventListener('touchstart', function() {
            isDragging = true;
            lastValidValue = parseInt(this.value);
        },{ passive: false });
        
        slider.addEventListener('input', function() {
            if (!isDragging) return;
            
            const min = parseInt(this.min);
            const max = parseInt(this.max);
            let newValue = parseInt(this.value);
            
            // 确保值在有效范围内
            if (newValue < min) {
                newValue = min;
                this.value = min;
            } else if (newValue > max) {
                newValue = max;
                this.value = max;
            }
            
            // 更新数值显示
            if (valueDisplay) {
                if (sliderId === 'rotateSlider') {
                    valueDisplay.textContent = `${newValue}°`;
                } else if (sliderId === 'scaleSlider' || sliderId === 'outputQuality') {
                    valueDisplay.textContent = `${newValue}%`;
                }
            }
            
            // 更新工具提示文本
            if (tooltip) {
                if (sliderId === 'rotateSlider') {
                    tooltip.textContent = `${newValue}°`;
                } else if (sliderId === 'scaleSlider' || sliderId === 'outputQuality') {
                    tooltip.textContent = `${newValue}%`;
                }
            }
            
            // 更新进度条
            updateSliderProgress(this, tooltipId, valueId);
            
            // 设置CSS变量供样式使用
            if (cssVarName) {
                document.documentElement.style.setProperty(`--${cssVarName}`, newValue);
            }
            
            // 触发对应的功能
            if (sliderId === 'rotateSlider') {
                currentRotation = newValue;
                displayCropImage();
                initializeCropBox();
            } else if (sliderId === 'scaleSlider') {
                currentScale = newValue;
                displayCropImage();
                initializeCropBox();
            }
            
            lastValidValue = newValue;
        });
        
        // 添加鼠标移动监听，但只在滑块范围内处理
        slider.addEventListener('mousemove', function(e) {
            if (!isDragging) {
                // 只显示悬停值，不更新实际值
                if (tooltip) {
                    const rect = this.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    const min = parseInt(this.min);
                    const max = parseInt(this.max);
                    const hoverValue = Math.round(min + (max - min) * percent);
                    
                    // 限制悬停值在范围内
                    const clampedHoverValue = Math.max(min, Math.min(max, hoverValue));
                    
                    if (sliderId === 'rotateSlider') {
                        tooltip.textContent = `${clampedHoverValue}°`;
                    } else if (sliderId === 'scaleSlider' || sliderId === 'outputQuality') {
                        tooltip.textContent = `${clampedHoverValue}%`;
                    }
                }
                return;
            }
            
            // 拖动时，检查鼠标是否在滑块轨道范围内
            const rect = this.getBoundingClientRect();
            let clientX = e.clientX;
            
            // 如果鼠标在轨道外，限制到轨道边界
            if (clientX < rect.left) {
                clientX = rect.left;
            } else if (clientX > rect.right) {
                clientX = rect.right;
            }
            
            // 计算基于鼠标位置的新值
            const percent = (clientX - rect.left) / rect.width;
            const min = parseInt(this.min);
            const max = parseInt(this.max);
            let newValue = Math.round(min + (max - min) * percent);
            
            // 确保值在有效范围内
            newValue = Math.max(min, Math.min(max, newValue));
            
            // 只有当值发生变化时才更新
            if (newValue !== lastValidValue) {
                this.value = newValue;
                
                // 手动触发input事件
                const event = new Event('input', { bubbles: true });
                this.dispatchEvent(event);
            }
        });
        
        // 鼠标和触摸结束事件
        const endDrag = function() {
            isDragging = false;
            // 确保最终值在有效范围内
            const min = parseInt(slider.min);
            const max = parseInt(slider.max);
            let finalValue = parseInt(slider.value);
            
            if (finalValue < min) {
                slider.value = min;
                finalValue = min;
            } else if (finalValue > max) {
                slider.value = max;
                finalValue = max;
            }
            
            // 触发一次最终更新
            const event = new Event('input', { bubbles: true });
            slider.dispatchEvent(event);
        };
        
        slider.addEventListener('mouseup', endDrag);
        slider.addEventListener('touchend', endDrag);
        document.addEventListener('mouseup', function(e) {
            if (isDragging && !slider.contains(e.target)) {
                endDrag();
            }
        });
        
        // 文档级别的鼠标移动，用于在鼠标离开滑块后继续控制
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            // 检查鼠标是否仍然在滑块上
            const rect = slider.getBoundingClientRect();
            let clientX = e.clientX;
            
            // 如果鼠标在轨道外，限制到轨道边界
            if (clientX < rect.left) {
                clientX = rect.left;
            } else if (clientX > rect.right) {
                clientX = rect.right;
            }
            
            // 计算基于鼠标位置的新值
            const percent = (clientX - rect.left) / rect.width;
            const min = parseInt(slider.min);
            const max = parseInt(slider.max);
            let newValue = Math.round(min + (max - min) * percent);
            
            // 确保值在有效范围内
            newValue = Math.max(min, Math.min(max, newValue));
            
            // 只有当值发生变化时才更新
            if (newValue !== lastValidValue) {
                slider.value = newValue;
                
                // 手动触发input事件
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });
        
        // 鼠标离开滑块时，如果正在拖动，确保值有效
        slider.addEventListener('mouseleave', function() {
            if (isDragging) {
                // 当鼠标离开滑块区域时，我们仍然可以继续拖动
                // 但我们需要确保鼠标移动事件仍然能捕获到
            }
        });
    }
    
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
        // 绑定到裁剪框本身
        cropBox.addEventListener('mousedown', handleCropBoxMouseDown);
        
        // 也绑定到每个控制点，确保它们都能捕获事件
        const handles = cropBox.querySelectorAll('.crop-handle');
        handles.forEach(handle => {
            handle.addEventListener('mousedown', handleCropBoxMouseDown);
        });
        
        document.addEventListener('mousemove', handleCropBoxMouseMove);
        document.addEventListener('mouseup', handleCropBoxMouseUp);
    }
    
    function handleCropBoxMouseDown(e) {
        const rect = cropBox.getBoundingClientRect();
        const wrapper = document.querySelector('.crop-image-wrapper');
        const wrapperRect = wrapper.getBoundingClientRect();
        const handle = e.target.closest('.crop-handle');
        
        // 检查是否点击了控制点
        if (handle) {
            isResizingCrop = true;
            // 获取控制点的类名
            const classList = Array.from(handle.classList);
            
            // 确定是哪个控制点
            if (classList.includes('crop-handle-e')) {
                resizeHandle = 'e';
            } else if (classList.includes('crop-handle-w')) {
                resizeHandle = 'w';
            } else if (classList.includes('crop-handle-n')) {
                resizeHandle = 'n';
            } else if (classList.includes('crop-handle-s')) {
                resizeHandle = 's';
            } else if (classList.includes('crop-handle-nw')) {
                resizeHandle = 'nw';
            } else if (classList.includes('crop-handle-ne')) {
                resizeHandle = 'ne';
            } else if (classList.includes('crop-handle-sw')) {
                resizeHandle = 'sw';
            } else if (classList.includes('crop-handle-se')) {
                resizeHandle = 'se';
            }
        } 
        // 检查是否点击了裁剪框本身（不是控制点）
        else if (e.target === cropBox) {
            isDraggingCrop = true;
        }
        
        // 记录起始位置
        dragStart = {
            x: e.clientX,
            y: e.clientY,
            boxLeft: rect.left - wrapperRect.left,
            boxTop: rect.top - wrapperRect.top,
            boxWidth: rect.width,
            boxHeight: rect.height
        };
        
        e.preventDefault();
        e.stopPropagation(); // 防止事件冒泡
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
        
        // 获取当前的右边框和下边框位置
        const currentRight = newLeft + newWidth;
        const currentBottom = newTop + newHeight;
        
        // 计算当前的纵横比（用于对角拖动时保持比例）
        const currentAspectRatio = newWidth / newHeight;
        
        // 根据不同的控制点进行不同的调整
        switch(resizeHandle) {
            case 'nw': // 左上角：按比例缩放，右下角不动
                if (aspectRatio > 0) {
                    // 有固定纵横比
                    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
                    newWidth = Math.max(50, dragStart.boxWidth - delta);
                    newHeight = newWidth / aspectRatio;
                    newLeft = currentRight - newWidth;
                    newTop = currentBottom - newHeight;
                } else {
                    // 自由模式，保持当前纵横比
                    const deltaX = -dx;
                    const deltaY = -dy;
                    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
                    newWidth = Math.max(50, dragStart.boxWidth + delta);
                    newHeight = newWidth / currentAspectRatio;
                    newLeft = currentRight - newWidth;
                    newTop = currentBottom - newHeight;
                }
                break;
                
            case 'ne': // 右上角：按比例缩放，左下角不动
                if (aspectRatio > 0) {
                    // 有固定纵横比
                    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
                    newWidth = Math.max(50, dragStart.boxWidth + delta);
                    newHeight = newWidth / aspectRatio;
                    newTop = currentBottom - newHeight;
                } else {
                    // 自由模式，保持当前纵横比
                    const deltaX = dx;
                    const deltaY = -dy;
                    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
                    newWidth = Math.max(50, dragStart.boxWidth + delta);
                    newHeight = newWidth / currentAspectRatio;
                    newTop = currentBottom - newHeight;
                }
                break;
                
            case 'sw': // 左下角：按比例缩放，右上角不动
                if (aspectRatio > 0) {
                    // 有固定纵横比
                    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
                    newWidth = Math.max(50, dragStart.boxWidth - delta);
                    newHeight = newWidth / aspectRatio;
                    newLeft = currentRight - newWidth;
                } else {
                    // 自由模式，保持当前纵横比
                    const deltaX = -dx;
                    const deltaY = dy;
                    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
                    newWidth = Math.max(50, dragStart.boxWidth + delta);
                    newHeight = newWidth / currentAspectRatio;
                    newLeft = currentRight - newWidth;
                }
                break;
                
            case 'se': // 右下角：按比例缩放，左上角不动
                if (aspectRatio > 0) {
                    // 有固定纵横比
                    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
                    newWidth = Math.max(50, dragStart.boxWidth + delta);
                    newHeight = newWidth / aspectRatio;
                } else {
                    // 自由模式，保持当前纵横比
                    const deltaX = dx;
                    const deltaY = dy;
                    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
                    newWidth = Math.max(50, dragStart.boxWidth + delta);
                    newHeight = newWidth / currentAspectRatio;
                }
                break;
                
            case 'n': // 上边框：改变上边框位置，下边框不动
                newTop = Math.min(dragStart.boxTop + dy, currentBottom - 50);
                newHeight = currentBottom - newTop;
                
                if (aspectRatio > 0) {
                    // 有固定纵横比，调整宽度以保持比例
                    newWidth = newHeight * aspectRatio;
                    // 保持中心位置，所以左边框也需要调整
                    newLeft = currentRight - newWidth - (dragStart.boxWidth - newWidth) / 2;
                }
                break;
                
            case 's': // 下边框：改变下边框位置，上边框不动
                newHeight = Math.max(50, dragStart.boxHeight + dy);
                
                if (aspectRatio > 0) {
                    // 有固定纵横比，调整宽度以保持比例
                    newWidth = newHeight * aspectRatio;
                    // 保持中心位置，所以左边框也需要调整
                    newLeft = dragStart.boxLeft - (newWidth - dragStart.boxWidth) / 2;
                }
                break;
                
            case 'w': // 左边框：改变左边框位置，右边框不动
                newLeft = Math.min(dragStart.boxLeft + dx, currentRight - 50);
                newWidth = currentRight - newLeft;
                
                if (aspectRatio > 0) {
                    // 有固定纵横比，调整高度以保持比例
                    newHeight = newWidth / aspectRatio;
                    // 保持中心位置，所以上边框也需要调整
                    newTop = currentBottom - newHeight - (dragStart.boxHeight - newHeight) / 2;
                }
                break;
                
            case 'e': // 右边框：改变右边框位置，左边框不动
                newWidth = Math.max(50, dragStart.boxWidth + dx);
                
                if (aspectRatio > 0) {
                    // 有固定纵横比，调整高度以保持比例
                    newHeight = newWidth / aspectRatio;
                    // 保持中心位置，所以上边框也需要调整
                    newTop = dragStart.boxTop - (newHeight - dragStart.boxHeight) / 2;
                }
                break;
        }
        
        // 确保尺寸不会小于最小值
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);
        
        // 限制裁剪框不超出图片边界
        newLeft = Math.max(0, Math.min(newLeft, wrapperRect.width - newWidth));
        newTop = Math.max(0, Math.min(newTop, wrapperRect.height - newHeight));
        
        // 确保右边框不超出边界
        if (newLeft + newWidth > wrapperRect.width) {
            newWidth = wrapperRect.width - newLeft;
            // 如果有纵横比，调整高度
            if (aspectRatio > 0) {
                newHeight = newWidth / aspectRatio;
            }
        }
        
        // 确保下边框不超出边界
        if (newTop + newHeight > wrapperRect.height) {
            newHeight = wrapperRect.height - newTop;
            // 如果有纵横比，调整宽度
            if (aspectRatio > 0) {
                newWidth = newHeight * aspectRatio;
            }
        }
        
        // 确保裁剪框仍然在边界内
        newLeft = Math.max(0, Math.min(newLeft, wrapperRect.width - newWidth));
        newTop = Math.max(0, Math.min(newTop, wrapperRect.height - newHeight));
        
        // 更新裁剪框
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
                console.log('切换到自由模式');
            } else {
                const parts = ratio.split('/');
                aspectRatio = parseFloat(parts[0]) / parseFloat(parts[1]);
                console.log('切换到纵横比:', aspectRatio);
                
                // 立即应用新的纵横比
                if (cropBoxCreated) {
                    adjustCropBoxToAspectRatio(aspectRatio);
                }
            }
        });
    });
    
    // 调整裁剪框到指定纵横比（修复版）
    function adjustCropBoxToAspectRatio(newAspectRatio) {
        if (!cropBoxCreated || newAspectRatio <= 0) return;
        
        const wrapper = document.querySelector('.crop-image-wrapper');
        const wrapperRect = wrapper.getBoundingClientRect();
        const currentLeft = parseFloat(cropBox.style.left);
        const currentTop = parseFloat(cropBox.style.top);
        const currentWidth = parseFloat(cropBox.style.width);
        const currentHeight = parseFloat(cropBox.style.height);
        
        console.log('调整纵横比:', newAspectRatio);
        console.log('当前尺寸:', currentWidth, 'x', currentHeight);
        console.log('容器尺寸:', wrapperRect.width, 'x', wrapperRect.height);
        
        // 计算当前中心点
        const centerX = currentLeft + currentWidth / 2;
        const centerY = currentTop + currentHeight / 2;
        
        let newWidth, newHeight;
        
        // 简单直接的方法：保持当前面积，计算新的尺寸
        const currentArea = currentWidth * currentHeight;
        newHeight = Math.sqrt(currentArea / newAspectRatio);
        newWidth = newHeight * newAspectRatio;
        
        console.log('计算后的尺寸:', newWidth, 'x', newHeight);
        
        // 如果新尺寸超出容器，则按比例缩小
        if (newWidth > wrapperRect.width || newHeight > wrapperRect.height) {
            const widthRatio = wrapperRect.width / newWidth;
            const heightRatio = wrapperRect.height / newHeight;
            const scaleRatio = Math.min(widthRatio, heightRatio) * 0.95; // 留一些边距
            
            newWidth = newWidth * scaleRatio;
            newHeight = newHeight * scaleRatio;
            
            console.log('缩放后的尺寸:', newWidth, 'x', newHeight);
        }
        
        // 确保最小尺寸
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);
        
        // 计算新的左上角位置（保持中心不变）
        let newLeft = centerX - newWidth / 2;
        let newTop = centerY - newHeight / 2;
        
        // 限制边界
        newLeft = Math.max(0, Math.min(newLeft, wrapperRect.width - newWidth));
        newTop = Math.max(0, Math.min(newTop, wrapperRect.height - newHeight));
        
        console.log('最终位置:', newLeft, newTop);
        console.log('最终尺寸:', newWidth, 'x', newHeight);
        
        // 更新裁剪框
        cropBox.style.left = newLeft + 'px';
        cropBox.style.top = newTop + 'px';
        cropBox.style.width = newWidth + 'px';
        cropBox.style.height = newHeight + 'px';
        
        updateCropInfo();
    }
    
    // ===== 旋转处理 =====
    rotateLeftBtn.addEventListener('click', function() {
        currentRotation = (currentRotation - 90 + 360) % 360;
        rotateSlider.value = currentRotation;
        rotateValue.textContent = `${currentRotation}°`;
        updateSliderProgress(rotateSlider, 'rotateTooltip', 'rotateValue');
        displayCropImage();
        initializeCropBox();
    });
    
    rotateRightBtn.addEventListener('click', function() {
        currentRotation = (currentRotation + 90) % 360;
        rotateSlider.value = currentRotation;
        rotateValue.textContent = `${currentRotation}°`;
        updateSliderProgress(rotateSlider, 'rotateTooltip', 'rotateValue');
        displayCropImage();
        initializeCropBox();
    });
    
    resetRotateBtn.addEventListener('click', function() {
        currentRotation = 0;
        rotateSlider.value = 0;
        rotateValue.textContent = '0°';
        updateSliderProgress(rotateSlider, 'rotateTooltip', 'rotateValue');
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
    
    // ===== 操作按钮处理 =====
    resetCropBtn.addEventListener('click', function() {
        currentRotation = 0;
        currentScale = 100;
        currentFlipH = false;
        currentFlipV = false;
        
        // 重置滑块
        rotateSlider.value = 0;
        rotateValue.textContent = '0°';
        scaleSlider.value = 100;
        scaleValue.textContent = '100%';
        outputQuality.value = 85;
        qualityValue.textContent = '85%';
        
        // 更新滑块进度
        updateSliderProgress(rotateSlider, 'rotateTooltip', 'rotateValue');
        updateSliderProgress(scaleSlider, 'scaleTooltip', 'scaleValue');
        updateSliderProgress(outputQuality, 'qualityTooltip', 'qualityValue');
        
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
        const quality = parseInt(outputQuality.value) / 100;
        croppedImageData = resultCanvas.toDataURL(outputFormat.value, quality);
        
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
        
        // 重置滑块
        rotateSlider.value = 0;
        rotateValue.textContent = '0°';
        scaleSlider.value = 100;
        scaleValue.textContent = '100%';
        outputQuality.value = 85;
        qualityValue.textContent = '85%';
        
        // 更新滑块进度
        updateSliderProgress(rotateSlider, 'rotateTooltip', 'rotateValue');
        updateSliderProgress(scaleSlider, 'scaleTooltip', 'scaleValue');
        updateSliderProgress(outputQuality, 'qualityTooltip', 'qualityValue');
        
        // 重置纵横比按钮
        aspectRatioBtns.forEach(b => b.classList.remove('active'));
        aspectRatioBtns[0].classList.add('active');
        aspectRatio = 0;
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
    
    // 初始化滑块
    setupSlider('rotateSlider', 'rotateTooltip', 'rotateValue', 'rotation');
    setupSlider('scaleSlider', 'scaleTooltip', 'scaleValue', 'scale');
    setupSlider('outputQuality', 'qualityTooltip', 'qualityValue', 'quality');
    
    // 设置滑块初始CSS变量
    document.documentElement.style.setProperty('--rotation', rotateSlider.value);
    document.documentElement.style.setProperty('--scale', scaleSlider.value);
    document.documentElement.style.setProperty('--quality', outputQuality.value);
    
    // 初始化按钮状态
    resetCropBtn.disabled = true;
    cropApplyBtn.disabled = true;
    clearCropBtn.disabled = true;
});