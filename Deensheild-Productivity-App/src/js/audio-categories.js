// Audio categories functionality
function showAudioCategories() {
    let html = '<div class="audio-categories-modal" style="background:#fff;padding:2rem;border-radius:16px;box-shadow:0 8px 32px rgba(10,37,64,0.18);max-width:400px;margin:2rem auto;">';
    html += '<h3 style="font-size:1.5rem;margin-bottom:1.5rem;color:#0A2540;font-weight:700;">Audio Library</h3>';
    
    // Audio categories
    const categories = [
        { id: 'quran', name: 'Quran Recitations', icon: 'fas fa-quran' },
        { id: 'nasheeds', name: 'Nasheeds', icon: 'fas fa-music' },
        { id: 'taqreers', name: 'Islamic Lectures (Taqreers)', icon: 'fas fa-microphone-alt' }
    ];
    
    categories.forEach(cat => {
        html += `<button class="audio-category-btn" data-category="${cat.id}" style="display:flex;align-items:center;gap:12px;width:100%;padding:16px;margin-bottom:10px;background:#f5f8fb;border:none;border-radius:12px;text-align:left;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(10,37,64,0.05);">`;
        html += `<i class="${cat.icon}" style="font-size:1.5rem;color:#4A90E2;width:30px;text-align:center;"></i>`;
        html += `<div><strong style="display:block;font-size:1.1rem;margin-bottom:4px;">${cat.name}</strong>`;
        
        if (cat.id === 'quran') {
            html += `<span style="font-size:0.9rem;color:#666;">Listen to beautiful recitations</span>`;
        } else if (cat.id === 'nasheeds') {
            html += `<span style="font-size:0.9rem;color:#666;">Islamic songs and hymns</span>`;
        } else {
            html += `<span style="font-size:0.9rem;color:#666;">Knowledge and guidance</span>`;
        }
        
        html += `</div></button>`;
    });
    
    html += '<button class="close-modal-btn" style="margin-top:16px;background:#D32F2F;color:#fff;padding:10px 20px;border:none;border-radius:8px;cursor:pointer;width:100%;">Close</button></div>';
    
    let modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(10,37,64,0.18)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.innerHTML = html;
    
    document.body.appendChild(modal);
    
    // Add click handlers for category buttons
    modal.querySelectorAll('.audio-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            showAudioPlayer(category);
            document.body.removeChild(modal);
        });
    });
    
    modal.querySelector('.close-modal-btn').addEventListener('click', () => document.body.removeChild(modal));
}

// Show audio player with selected category content
function showAudioPlayer(category) {
    const audioPlayer = document.getElementById('audioPlayer');
    if (!audioPlayer) return;
    
    const surahNameEl = audioPlayer.querySelector('.surah-name');
    const reciterEl = audioPlayer.querySelector('.reciter');
    
    // Update player UI based on selected category
    if (category === 'quran') {
        surahNameEl.textContent = 'Surat Al-Waqiah';
        reciterEl.textContent = 'Quran • 1 of 96';
    } else if (category === 'nasheeds') {
        surahNameEl.textContent = 'Ya Nabi Salam Alayka';
        reciterEl.textContent = 'Nasheed • 1 of 24';
    } else if (category === 'taqreers') {
        surahNameEl.textContent = 'Virtues of Patience';
        reciterEl.textContent = 'Lecture • 1 of 15';
    }
    
    // Show the player
    audioPlayer.style.display = 'block';
}

// Add event listener to the nasheeds button (now renamed to Audio)
document.addEventListener('DOMContentLoaded', function() {
    const audioBtn = document.querySelector('.nasheeds-btn');
    if (audioBtn) {
        audioBtn.addEventListener('click', showAudioCategories);
    }
});
