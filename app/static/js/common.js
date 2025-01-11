document.addEventListener('DOMContentLoaded', () => {
    // 创建过渡动画元素
    const transitionEl = document.createElement('div');
    transitionEl.className = 'page-transition';
    transitionEl.innerHTML = `
        <div class="transition-container">
            <div class="loading-circle"></div>
            <div class="loading-text">
                <span>加</span>
                <span>载</span>
                <span>中</span>
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </div>
        </div>
    `;
    document.body.appendChild(transitionEl);

    // 为所有链接添加过渡动画
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // 忽略外部链接和特殊链接
            if (link.target === '_blank' || 
                link.getAttribute('data-no-transition') === 'true' ||
                link.href.startsWith('javascript:') ||
                link.href.startsWith('#')) {
                return;
            }

            e.preventDefault();
            const targetUrl = link.href;
            
            // 显示过渡动画
            transitionEl.classList.add('active');
            
            // 延迟后跳转
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 1000);
        });
    });
}); 