// 获取DOM元素
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const originalFormat = document.getElementById('originalFormat');
const compressedSize = document.getElementById('compressedSize');
const downloadBtn = document.getElementById('downloadBtn');

// 处理文件上传
uploadZone.addEventListener('click', () => fileInput.click());

// 拖拽上传
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#0071e3';
});

uploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#e5e5e7';
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#e5e5e7';
    handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

// 处理文件
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
    }

    // 显示原始文件信息
    originalFormat.textContent = file.type.split('/')[1].toUpperCase();
    originalSize.textContent = formatFileSize(file.size);

    // 读取并显示原图
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        compressImage(e.target.result);
        previewContainer.style.display = 'grid';
    };
    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage(src) {
    const img = new Image();
    img.onload = () => {
        // 创建画布
        const canvas = document.createElement('canvas');
        canvas.width = 700;
        canvas.height = 900;
        const ctx = canvas.getContext('2d');

        // 计算裁剪区域
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) * 0.5;
        const y = (canvas.height - img.height * scale) * 0.5;

        // 绘制图片
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // 转换为JPG格式
        let quality = 0.8;
        let compressedDataUrl;
        
        // 循环压缩直到文件小于100KB
        do {
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            quality -= 0.1;
        } while (getBase64Size(compressedDataUrl) > 100 * 1024 && quality > 0.1);

        // 显示压缩后的图片
        compressedImage.src = compressedDataUrl;
        compressedSize.textContent = formatFileSize(getBase64Size(compressedDataUrl));

        // 设置下载按钮
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.download = 'compressed_image.jpg';
            link.href = compressedDataUrl;
            link.click();
        };
    };
    img.src = src;
}

// 工具函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// 工具函数：获取Base64图片大小
function getBase64Size(base64String) {
    const padding = base64String.endsWith('==') ? 2 : 1;
    return (base64String.length * 3) / 4 - padding;
} 