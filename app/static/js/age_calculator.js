// 获取DOM元素
const birthDate = document.getElementById('birth-date');
const calcDateRadios = document.getElementsByName('calc-date');
const calcDate = document.getElementById('calc-date');
const calculateBtn = document.getElementById('calculate-btn');

// 结果显示元素
const years = document.getElementById('years');
const months = document.getElementById('months');
const days = document.getElementById('days');
const totalMonths = document.getElementById('total-months');
const totalDays = document.getElementById('total-days');
const totalHours = document.getElementById('total-hours');
const nextBirthday = document.getElementById('next-birthday');
const birthdayCountdown = document.getElementById('birthday-countdown');
const chineseZodiac = document.getElementById('chinese-zodiac');
const zodiacSign = document.getElementById('zodiac-sign');

// 生肖数组
const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 星座数据
const zodiacSigns = [
    { name: '摩羯座', start: '12-22', end: '01-19' },
    { name: '水瓶座', start: '01-20', end: '02-18' },
    { name: '双鱼座', start: '02-19', end: '03-20' },
    { name: '白羊座', start: '03-21', end: '04-19' },
    { name: '金牛座', start: '04-20', end: '05-20' },
    { name: '双子座', start: '05-21', end: '06-21' },
    { name: '巨蟹座', start: '06-22', end: '07-22' },
    { name: '狮子座', start: '07-23', end: '08-22' },
    { name: '处女座', start: '08-23', end: '09-22' },
    { name: '天秤座', start: '09-23', end: '10-23' },
    { name: '天蝎座', start: '10-24', end: '11-21' },
    { name: '射手座', start: '11-22', end: '12-21' }
];

// 添加事件监听
calcDateRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        calcDate.disabled = radio.value === 'today';
        if (radio.value === 'today') {
            calcDate.value = new Date().toISOString().split('T')[0];
        }
    });
});

calculateBtn.addEventListener('click', calculateAge);

// 计算年龄
function calculateAge() {
    const birthDateValue = new Date(birthDate.value);
    const calcDateValue = document.querySelector('input[name="calc-date"]:checked').value === 'today'
        ? new Date()
        : new Date(calcDate.value);
    
    if (!birthDate.value) {
        alert('请选择出生日期！');
        return;
    }
    
    if (birthDateValue > calcDateValue) {
        alert('出生日期不能晚于计算日期！');
        return;
    }
    
    // 计算年龄
    const yearDiff = calcDateValue.getFullYear() - birthDateValue.getFullYear();
    const monthDiff = calcDateValue.getMonth() - birthDateValue.getMonth();
    const dayDiff = calcDateValue.getDate() - birthDateValue.getDate();
    
    let ageYears = yearDiff;
    let ageMonths = monthDiff;
    let ageDays = dayDiff;
    
    if (dayDiff < 0) {
        ageMonths--;
        const lastMonth = new Date(calcDateValue.getFullYear(), calcDateValue.getMonth(), 0);
        ageDays = lastMonth.getDate() + dayDiff;
    }
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        ageYears--;
        ageMonths += 12;
    }
    
    // 更新显示
    years.textContent = ageYears;
    months.textContent = ageMonths;
    days.textContent = ageDays;
    
    // 计算总时间
    const totalMonthsValue = ageYears * 12 + ageMonths;
    const totalDaysValue = Math.floor((calcDateValue - birthDateValue) / (1000 * 60 * 60 * 24));
    const totalHoursValue = Math.floor((calcDateValue - birthDateValue) / (1000 * 60 * 60));
    
    totalMonths.textContent = totalMonthsValue;
    totalDays.textContent = totalDaysValue;
    totalHours.textContent = totalHoursValue;
    
    // 计算下次生日
    calculateNextBirthday(birthDateValue);
    
    // 计算生肖和星座
    calculateZodiac(birthDateValue);
}

// 计算下次生日
function calculateNextBirthday(birthDate) {
    const today = new Date();
    let nextBirthdayDate = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    if (nextBirthdayDate < today) {
        nextBirthdayDate.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntilBirthday = Math.ceil((nextBirthdayDate - today) / (1000 * 60 * 60 * 24));
    
    nextBirthday.textContent = nextBirthdayDate.toLocaleDateString('zh-CN');
    birthdayCountdown.textContent = `还有 ${daysUntilBirthday} 天`;
}

// 计算生肖和星座
function calculateZodiac(birthDate) {
    // 计算生肖
    const zodiacIndex = (birthDate.getFullYear() - 4) % 12;
    chineseZodiac.textContent = zodiacAnimals[zodiacIndex];
    
    // 计算星座
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const birthString = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    const sign = zodiacSigns.find(sign => {
        const [startMonth, startDay] = sign.start.split('-').map(Number);
        const [endMonth, endDay] = sign.end.split('-').map(Number);
        
        if (startMonth > endMonth) {
            return (month === startMonth && day >= startDay) || 
                   (month === endMonth && day <= endDay) ||
                   (month > startMonth) ||
                   (month < endMonth);
        } else {
            return (month === startMonth && day >= startDay) ||
                   (month === endMonth && day <= endDay) ||
                   (month > startMonth && month < endMonth);
        }
    });
    
    zodiacSign.textContent = sign.name;
}

// 初始化
function init() {
    // 设置默认计算日期为今天
    calcDate.value = new Date().toISOString().split('T')[0];
    
    // 如果有本地存储的出生日期，则恢复
    const savedBirthDate = localStorage.getItem('birth-date');
    if (savedBirthDate) {
        birthDate.value = savedBirthDate;
        calculateAge();
    }
}

// 保存出生日期
birthDate.addEventListener('change', () => {
    localStorage.setItem('birth-date', birthDate.value);
});

// 初始化
init(); 