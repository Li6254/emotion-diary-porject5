
document.addEventListener('DOMContentLoaded', function() {
    // 初始化设置
    initApp();
    
    // 事件监听
    setupEventListeners();
});

// 初始化应用
function initApp() {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    document.getElementById('moodDate').value = formattedDate;
    loadMoodHistory();
}
// 设置所有事件监听
function setupEventListeners() {
    // 基础心情按钮点击
    document.querySelectorAll('.mood-levels button').forEach(btn => {
        btn.addEventListener('click', function() {
            selectMood(this);
        });
    });
    
    // 自定义心情按钮点击
    document.getElementById('customMoodBtn').addEventListener('click', function() {
        document.querySelector('.custom-mood-input').classList.remove('hidden');
    });
    
    // 保存自定义心情
    document.getElementById('saveCustomMoodBtn').addEventListener('click', saveCustomMood);
    
    // 表单提交
    document.getElementById('moodForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMoodEntry();
    });
    
    // 搜索功能
    document.getElementById('searchBtn').addEventListener('click', searchEntries);
    document.getElementById('resetSearchBtn').addEventListener('click', resetSearch);
}

// 选择心情
function selectMood(button) {
    // 移除所有按钮的active类
    document.querySelectorAll('.mood-levels button').forEach(b => {
        b.classList.remove('active');
    });
    
    // 添加active类到当前按钮
    button.classList.add('active');
    
    // 设置隐藏的moodLevel值
    document.getElementById('moodLevel').value = button.dataset.level;
    document.getElementById('moodCustomName').value = '';
    
    // 隐藏自定义输入框
    document.querySelector('.custom-mood-input').classList.add('hidden');
}

// 保存自定义心情
function saveCustomMood() {
    const name = document.getElementById('newMoodName').value.trim();
    if (!name) {
        alert('请输入心情名称');
        return;
    }
    
    // 设置隐藏值
    document.getElementById('moodLevel').value = 'custom';
    document.getElementById('moodCustomName').value = name;
    
    // 重置输入框
    document.getElementById('newMoodName').value = '';
    document.querySelector('.custom-mood-input').classList.add('hidden');
    
    // 添加到搜索选项
    addToSearchOptions(name);
}

// 添加到搜索选项
function addToSearchOptions(name) {
    const searchSelect = document.getElementById('searchMood');
    const optionId = 'custom_' + name;
    
    // 检查是否已存在
    if (!document.getElementById(optionId)) {
        const option = document.createElement('option');
        option.value = optionId;
        option.id = optionId;
        option.textContent = `✨ ${name}`;
        searchSelect.appendChild(option);
    }
}

// 保存心情记录
function saveMoodEntry() {
    const date = document.getElementById('moodDate').value;
    const level = document.getElementById('moodLevel').value;
    const customName = document.getElementById('moodCustomName').value;
    const note = document.getElementById('moodNote').value;
    // 验证
    if (!date) {
        alert('请选择日期');
        return;
    }
    
    if (!level) {
        alert('请选择心情');
        return;
    }
    
    if (!note) {
        alert('请填写日记内容');
        return;
    }
    
    // 创建记录对象
    const entry = {
        date: date,
        level: level,
        customName: customName,
        note: note,
        createdAt: new Date().getTime()
    };
    
    // 获取现有记录
    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    // 添加新记录
    history.push(entry);
    
    // 按日期排序（新到旧）
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 保存到本地存储
    localStorage.setItem('moodHistory', JSON.stringify(history));
    
    // 刷新显示
    loadMoodHistory();
    
    // 重置表单
    resetForm();
}

// 加载历史记录
function loadMoodHistory() {
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const container = document.getElementById('moodHistory');
    
    if (history.length === 0) {
        container.innerHTML = '<p class="empty">暂无记录，开始记录你的心情吧！</p>';
        return;
    }
    
    container.innerHTML = renderHistory(history);
}

// 渲染历史记录
function renderHistory(history) {
    return history.map((entry, index) => {
        const moodText = getMoodText(entry);
        return `
            <div class="mood-entry mood-${entry.level === 'custom' ? 'custom' : entry.level}">
                <button class="delete-btn" data-index="${index}">× 删除</button>
                <div class="mood-date">${formatDate(entry.date)}</div>
                <div class="mood-tag">${moodText}</div>
                <div class="mood-content">${entry.note}</div>
            </div>
        `;
    }).join('');
}

// 获取心情显示文本
function getMoodText(entry) {
    if (entry.level === 'custom') {
        return `✨ ${entry.customName}`;
    }
    
    const moods = {
        '1': '😞 很差',
        '2': '😕 一般',
        '3': '😐 普通',
        '4': '🙂 不错',
        '5': '😊 超棒'
    };
    
    return moods[entry.level] || entry.level;
}

// 搜索功能
function searchEntries() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const moodOption = document.getElementById('searchMood').value;
    
    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    if (keyword || moodOption) {
        history = history.filter(entry => {
            const matchText = entry.note.toLowerCase().includes(keyword);
            const matchMood = moodOption ? 
                (moodOption.startsWith('custom_') ? 
                    entry.level === 'custom' && entry.customName === moodOption.replace('custom_', '') :
                    entry.level === moodOption) : 
                true;
            return matchText && matchMood;
        });
    }
    
    document.getElementById('moodHistory').innerHTML = history.length > 0 ? 
        renderHistory(history) : 
        '<p class="empty">没有找到匹配的记录</p>';
}

// 重置搜索
function resetSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchMood').value = '';
    loadMoodHistory();
}

// 重置表单
function resetForm() {
    document.getElementById('moodForm').reset();
    document.getElementById('moodDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('moodLevel').value = '';
    document.getElementById('moodCustomName').value = '';
    document.querySelectorAll('.mood-levels button').forEach(b => b.classList.remove('active'));
    document.querySelector('.custom-mood-input').classList.add('hidden');
}

// 日期格式化
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('zh-CN', options);
}

// 删除记录（事件委托）
document.body.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        const index = e.target.dataset.index;
        deleteEntry(index);
    }
});

// 删除记录
function deleteEntry(index) {
    if (confirm('确定要删除这条记录吗？')) {
        let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
        history.splice(index, 1);
        localStorage.setItem('moodHistory', JSON.stringify(history));
        loadMoodHistory();
    }
}