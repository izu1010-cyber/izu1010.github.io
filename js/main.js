document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Highlight active link based on current path
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
        const href = link.getAttribute('href');
        // Simple check: if href is part of the path or if it's the home page
        if (href === '/' || href === 'index.html' || href === './index.html') {
            if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
                link.classList.add('active');
            }
        } else {
            // Clean up href to match part of the path (e.g., './pages/gameroom.html' -> 'gameroom.html')
            const cleanHref = href.replace('./pages/', '').replace('pages/', '');
            if (currentPath.includes(cleanHref)) {
                link.classList.add('active');
            }
        }
    });


    // --------------------------
    // Kidroom Photo Board Logic
    // --------------------------
    const photoUploadInput = document.getElementById('photo-upload');
    const photoGrid = document.getElementById('photo-grid');

    if (photoUploadInput && photoGrid) {
        photoUploadInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            Array.from(files).forEach(file => {
                if (!file.type.startsWith('image/')) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const imgUrl = event.target.result;
                    createPhotoItem(imgUrl, "My Art");

                    // Optional: Save to localStorage (simple persistence for demo)
                    // Note: This has strict size limits
                    // saveToStorage(imgUrl);
                };
                reader.readAsDataURL(file);
            });

            // Clear input so same file can be selected again
            photoUploadInput.value = '';
        });
    }

    function createPhotoItem(url, caption) {
        const item = document.createElement('div');
        item.classList.add('photo-item');
        item.innerHTML = `
            <img src="${url}" alt="User Photo">
            <div class="photo-caption">${caption}</div>
        `;
        // Insert after the first item (placeholder) or at the beginning
        // photoGrid.appendChild(item); 
        // Let's prepend to show newest first, but keep placeholder first if we want? 
        // Actually, let's just append or prepend depending on design.
        // Let's insert after the "Welcome" placeholder if it exists, otherwise prepend.
        const placeholder = photoGrid.querySelector('.placeholder-item');
        if (placeholder) {
            placeholder.after(item);
        } else {
            photoGrid.prepend(item);
        }
    }
});
