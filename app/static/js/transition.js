// 获取URL参数中的目标地址
const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get('target') || '/';

// 等待1.5秒后跳转
setTimeout(() => {
    document.querySelector('.transition-container').classList.add('fade-out');
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 500);
}, 1500); 