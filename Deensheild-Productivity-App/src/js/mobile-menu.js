// Mobile Menu JavaScript Code
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            // Create mobile menu if it doesn't exist
            let mobileMenu = document.getElementById('mobileMenu');
            
            if (!mobileMenu) {
                // Create the mobile menu
                mobileMenu = document.createElement('div');
                mobileMenu.id = 'mobileMenu';
                mobileMenu.className = 'mobile-menu';
                
                // Style the menu
                mobileMenu.style.position = 'fixed';
                mobileMenu.style.top = '0';
                mobileMenu.style.right = '0';
                mobileMenu.style.width = '80%';
                mobileMenu.style.maxWidth = '300px';
                mobileMenu.style.height = '100%';
                mobileMenu.style.backgroundColor = 'white';
                mobileMenu.style.boxShadow = '-5px 0 15px rgba(0,0,0,0.15)';
                mobileMenu.style.zIndex = '1001';
                mobileMenu.style.transform = 'translateX(100%)';
                mobileMenu.style.transition = 'transform 0.3s ease';
                mobileMenu.style.display = 'flex';
                mobileMenu.style.flexDirection = 'column';
                mobileMenu.style.padding = '60px 20px 20px';
                
                // Create close button
                const closeBtn = document.createElement('button');
                closeBtn.className = 'mobile-menu-close-btn';
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                closeBtn.style.position = 'absolute';
                closeBtn.style.top = '15px';
                closeBtn.style.right = '15px';
                closeBtn.style.background = 'none';
                closeBtn.style.border = 'none';
                closeBtn.style.fontSize = '24px';
                closeBtn.style.cursor = 'pointer';
                
                // Add menu items
                const menuItems = [
                    { icon: 'fa-image', text: 'Backgrounds' },
                    { icon: 'fa-music', text: 'Audio' },
                    { icon: 'fa-crown', text: 'Premium' },
                    { icon: 'fa-user', text: 'Login' },
                    { icon: 'fa-download', text: 'Install App' },
                    { icon: 'fa-cog', text: 'Settings' },
                    { icon: 'fa-moon', text: 'Dark Mode' }
                ];
                
                // Add menu items
                menuItems.forEach(item => {
                    const menuItem = document.createElement('button');
                    menuItem.className = 'mobile-menu-item';
                    menuItem.innerHTML = `<i class="fas ${item.icon}"></i> ${item.text}`;
                    menuItem.style.display = 'flex';
                    menuItem.style.alignItems = 'center';
                    menuItem.style.padding = '15px 0';
                    menuItem.style.borderBottom = '1px solid #eee';
                    menuItem.style.background = 'none';
                    menuItem.style.border = 'none';
                    menuItem.style.textAlign = 'left';
                    menuItem.style.width = '100%';
                    menuItem.style.fontSize = '16px';
                    
                    // Add icon styling
                    const icon = menuItem.querySelector('i');
                    if (icon) {
                        icon.style.marginRight = '15px';
                        icon.style.width = '24px';
                        icon.style.textAlign = 'center';
                    }
                    
                    mobileMenu.appendChild(menuItem);
                });
                
                // Append close button
                mobileMenu.appendChild(closeBtn);
                
                // Add overlay
                const overlay = document.createElement('div');
                overlay.id = 'mobileMenuOverlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                overlay.style.zIndex = '1000';
                overlay.style.opacity = '0';
                overlay.style.visibility = 'hidden';
                overlay.style.transition = 'opacity 0.3s ease';
                
                // Append menu and overlay to body
                document.body.appendChild(overlay);
                document.body.appendChild(mobileMenu);
                
                // Handle close button click
                closeBtn.addEventListener('click', function() {
                    mobileMenu.style.transform = 'translateX(100%)';
                    overlay.style.opacity = '0';
                    
                    setTimeout(() => {
                        overlay.style.visibility = 'hidden';
                    }, 300);
                });
                
                // Handle overlay click
                overlay.addEventListener('click', function() {
                    mobileMenu.style.transform = 'translateX(100%)';
                    overlay.style.opacity = '0';
                    
                    setTimeout(() => {
                        overlay.style.visibility = 'hidden';
                    }, 300);
                });
            }
            
            // Show the menu
            mobileMenu.style.transform = 'translateX(0)';
            const overlay = document.getElementById('mobileMenuOverlay');
            overlay.style.visibility = 'visible';
            overlay.style.opacity = '1';
        });
    }
});
