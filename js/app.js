// 主应用逻辑

let chapters = [];
let characters = {};
let currentChapter = 0;
let isLoading = true;

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
    showLoading();
    await loadData();
    initChapterList();
    initEventListeners();
    hideLoading();
});

// 加载数据
async function loadData() {
    try {
        const response = await fetch('js/chapters.json');
        const data = await response.json();
        chapters = data.chapters;
        characters = data.characters || {};
        document.title = data.title || '西游记 - 儿童故事';
    } catch (error) {
        console.error('加载数据失败:', error);
        // 备用：内联数据
        chapters = getFallbackChapters();
    }
}

// 获取备用数据
function getFallbackChapters() {
    return [
        {
            id: 1,
            title: "第一回",
            subtitle: "灵根孕育源流出",
            image: "mountain",
            content: "<p>数据加载中...</p>"
        }
    ];
}

// 初始化事件监听
function initEventListeners() {
    // 键盘导航
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') prevChapter();
        if (e.key === 'ArrowRight') nextChapter();
    });
    
    // 触摸滑动
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextChapter();
            else prevChapter();
        }
    }
}

// 初始化章节列表
function initChapterList() {
    const list = document.getElementById('chapterList');
    if (!list) return;
    
    list.innerHTML = '';
    chapters.forEach((ch, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="chapter-num">${i + 1}</span><span>${ch.title} ${ch.subtitle || ''}</span>`;
        li.onclick = () => goToChapter(i);
        list.appendChild(li);
    });
}

// 显示封面
function showCover() {
    document.getElementById('cover').style.display = 'block';
    document.getElementById('chapterContainer').innerHTML = '';
    document.getElementById('bottomNav').style.display = 'none';
    updateProgress(0);
    currentChapter = 0;
    toggleSidebar();
    updateChapterListHighlight();
}

// 开始阅读
function startReading() {
    currentChapter = 0;
    showChapter(0);
}

// 跳转到指定章节
function goToChapter(index) {
    toggleSidebar();
    showChapter(index);
}

// 显示章节
function showChapter(index) {
    if (index < 0 || index >= chapters.length) return;
    
    currentChapter = index;
    
    // 隐藏封面，显示章节
    document.getElementById('cover').style.display = 'none';
    
    // 创建章节内容
    const container = document.getElementById('chapterContainer');
    container.innerHTML = '';
    
    const ch = chapters[index];
    const chapterDiv = document.createElement('div');
    chapterDiv.className = 'chapter-content active';
    
    // 图片/SVG
    let imageHtml = '';
    if (ch.image) {
        imageHtml = `<div class="chapter-images">
            <svg viewBox="0 0 100 100" class="chapter-svg">
                ${getSVGContent(ch.image)}
            </svg>
        </div>`;
    } else if (ch.images && Array.isArray(ch.images)) {
        imageHtml = '<div class="chapter-images">' + 
            ch.images.map(img => `<span class="emoji">${img}</span>`).join('') + 
            '</div>';
    }
    
    chapterDiv.innerHTML = `
        <div class="chapter-header">
            <h2 class="chapter-title">${ch.title} ${ch.subtitle || ''}</h2>
            <p class="chapter-meta">第 ${index + 1} 章，共 ${chapters.length} 章</p>
        </div>
        ${imageHtml}
        <div class="story-text">${ch.content}</div>
    `;
    container.appendChild(chapterDiv);
    
    // 显示底部导航
    document.getElementById('bottomNav').style.display = 'flex';
    updateNavButtons();
    updateProgress((index + 1) / chapters.length * 100);
    updateChapterListHighlight();
    
    // 滚动到顶部
    window.scrollTo(0, 0);
}

// 获取SVG内容
function getSVGContent(name) {
    const svgs = {
        'mountain': '<path d="M10 90 L30 40 L50 70 L70 30 L90 90 Z" fill="#4a5568" opacity="0.6"/><path d="M20 90 L40 50 L60 80 L80 40 L90 90 Z" fill="#2d3748" opacity="0.4"/>',
        'monkey': '<circle cx="50" cy="40" r="25" fill="#8B4513"/><circle cx="40" cy="35" r="5" fill="white"/><circle cx="60" cy="35" r="5" fill="white"/><circle cx="40" cy="35" r="2" fill="black"/><circle cx="60" cy="35" r="2" fill="black"/><ellipse cx="50" cy="50" rx="10" fill="#DEB887"/><path d="M45 55 Q50 60 55 55" stroke="black" fill="none"/>',
        'pig': '<ellipse cx="50" cy="50" rx="30" ry="25" fill="#FFB6C1"/><circle cx="35" cy="40" r="8" fill="#FFB6C1"/><circle cx="65" cy="40" r="8" fill="#FFB6C1"/><ellipse cx="50" cy="55" rx="8" ry="5" fill="#FF69B4"/><circle cx="45" cy="52" r="2" fill="black"/><circle cx="55" cy="52" r="2" fill="black"/>',
        'fish': '<ellipse cx="50" cy="50" rx="30" ry="15" fill="#4169E1"/><polygon points="80,50 70,40 70,60" fill="#4169E1"/><circle cx="35" cy="45" r="3" fill="white"/><circle cx="35" cy="45" r="1" fill="black"/>',
        'tiger': '<path d="M20 80 L30 30 L50 20 L70 30 L80 80 Z" fill="#FF8C00"/><circle cx="35" cy="45" r="8" fill="white"/><circle cx="65" cy="45" r="8" fill="white"/><circle cx="35" cy="45" r="3" fill="black"/><circle cx="65" cy="45" r="3" fill="black"/><ellipse cx="50" cy="60" rx="8" ry="5" fill="#FF4500"/>',
        'dragon': '<path d="M10 50 Q30 20 50 50 Q70 80 90 50 Q70 20 50 50 Q30 80 10 50" fill="#228B22"/><circle cx="30" cy="40" r="5" fill="white"/><circle cx="30" cy="40" r="2" fill="black"/><polygon points="10,50 0,40 0,60" fill="#228B22"/><polygon points="90,50 100,40 100,60" fill="#228B22"/>',
        'cloud': '<ellipse cx="30" cy="50" rx="20" ry="15" fill="white" opacity="0.6"/><ellipse cx="50" cy="45" rx="25" ry="18" fill="white" opacity="0.6"/><ellipse cx="70" cy="50" rx="20" ry="15" fill="white" opacity="0.6"/>',
        'fire': '<path d="M50 10 Q30 40 40 60 Q50 80 60 60 Q70 40 50 10" fill="#FF4500"/><path d="M50 20 Q40 40 45 55 Q50 70 55 55 Q60 40 50 20" fill="#FFD700"/>',
        'water': '<path d="M10 70 Q30 50 50 70 Q70 90 90 70" stroke="#4169E1" fill="none" stroke-width="3"/><path d="M10 50 Q30 30 50 50 Q70 70 90 50" stroke="#4169E1" fill="none" stroke-width="3"/><path d="M10 30 Q30 10 50 30 Q70 50 90 30" stroke="#4169E1" fill="none" stroke-width="3"/>',
        'default': '<circle cx="50" cy="50" r="30" fill="#4a5568" opacity="0.5"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="20">?</text>'
    };
    
    return svgs[name] || svgs['default'];
}

// 上一章
function prevChapter() {
    if (currentChapter > 0) {
        showChapter(currentChapter - 1);
    }
}

// 下一章
function nextChapter() {
    if (currentChapter < chapters.length - 1) {
        showChapter(currentChapter + 1);
    }
}

// 更新导航按钮状态
function updateNavButtons() {
    document.getElementById('prevBtn').disabled = currentChapter === 0;
    document.getElementById('nextBtn').disabled = currentChapter === chapters.length - 1;
    document.getElementById('chapterIndicator').textContent = `${currentChapter + 1} / ${chapters.length}`;
}

// 更新进度条
function updateProgress(percent) {
    document.getElementById('progress').style.width = percent + '%';
}

// 更新章节列表高亮
function updateChapterListHighlight() {
    const list = document.getElementById('chapterList');
    if (!list) return;
    
    const items = list.querySelectorAll('li');
    items.forEach((item, i) => {
        item.classList.toggle('active', i === currentChapter);
    });
}

// 切换侧边栏
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('active');
}

// 显示人物介绍
function showCharacter(name) {
    const char = characters[name];
    if (char) {
        document.getElementById('charAvatar').textContent = char.avatar || '👤';
        document.getElementById('charName').textContent = name;
        document.getElementById('charDesc').textContent = char.desc || '';
        document.getElementById('characterModal').classList.add('active');
    }
}

// 关闭人物介绍
function closeCharacter() {
    document.getElementById('characterModal').classList.remove('active');
}

// 显示加载
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

// 隐藏加载
function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}
