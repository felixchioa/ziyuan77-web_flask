document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchDescription = document.getElementById('search-description');
    const searchParams = document.getElementById('search-params');
    const commands = document.querySelectorAll('.command');

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const includeDescription = searchDescription.checked;
        const includeParams = searchParams.checked;

        commands.forEach(command => {
            const title = command.querySelector('h2').textContent.toLowerCase();
            const description = command.querySelector('p').textContent.toLowerCase();
            const params = Array.from(command.querySelectorAll('li'))
                .map(li => li.textContent.toLowerCase());

            let matches = title.includes(searchTerm);
            
            if (includeDescription) {
                matches = matches || description.includes(searchTerm);
            }
            
            if (includeParams) {
                matches = matches || params.some(param => param.includes(searchTerm));
            }

            command.classList.toggle('hidden', !matches);

            // 移除旧的高亮
            command.innerHTML = command.innerHTML.replace(
                /<mark class="highlight">(.*?)<\/mark>/g, '$1'
            );

            // 添加新的高亮
            if (matches && searchTerm) {
                const regex = new RegExp(searchTerm, 'gi');
                const highlightText = '<mark class="highlight">$&</mark>';
                
                if (includeDescription) {
                    const elements = command.querySelectorAll('h2, p, li');
                    elements.forEach(element => {
                        element.innerHTML = element.innerHTML.replace(regex, highlightText);
                    });
                } else {
                    const titleElement = command.querySelector('h2');
                    titleElement.innerHTML = titleElement.innerHTML.replace(regex, highlightText);
                }
            }
        });
    }

    const debouncedSearch = debounce(performSearch, 300);

    searchInput.addEventListener('input', debouncedSearch);
    searchDescription.addEventListener('change', debouncedSearch);
    searchParams.addEventListener('change', debouncedSearch);
}); 