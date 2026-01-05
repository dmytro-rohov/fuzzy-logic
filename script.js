
// variables - DOM elements

const tempSlider = document.getElementById('temp');
const roomSlider = document.getElementById('room');

const tempValue = document.getElementById('tempValue');
const roomValue = document.getElementById('roomValue');

const powerBar = document.getElementById('powerBar');
const powerValue = document.getElementById('powerValue');

const hotIcon = document.querySelector('.placeholder-icon--hot');
const coldIcon = document.querySelector('.placeholder-icon--cold');


// fuzzy - temp

function fuzzyCold(t) {
    if (t <= 18) return 1;
    if (t >= 24) return 0;
    return (24 - t) / (24 - 18);
}

// function fuzzyWarm(t) {
//     if (t <= 18 || t >= 30) return 0;
//     if (t === 24) return 1;
//     if (t < 24) return (t - 18) / (24 - 18);
//     return (30 - t) / (30 - 24);
// }

function fuzzyHot(t) {
    if (t <= 24) return 0;
    if (t >= 30) return 1;
    return (t - 24) / (30 - 24);
}


// fuzzy - size

function fuzzySmall(r) {
    if (r <= 20) return 1;
    if (r >= 35) return 0;
    return (35 - r) / (35 - 20);
}

function fuzzyMedium(r) {
    if (r <= 20 || r >= 50) return 0;
    if (r === 35) return 1;
    if (r < 35) return (r - 20) / (35 - 20);
    return (50 - r) / (50 - 35);
}

function fuzzyBig(r) {
    if (r <= 35) return 0;
    if (r >= 50) return 1;
    return (r - 35) / (50 - 35);
}

// 

function coolingDemand(t) {
  return fuzzyHot(t);
}

function heatingDemand(t) {
  return fuzzyCold(t);
}

// depends on room size

function roomFactor(r) {
  const small = fuzzySmall(r);
  const medium = fuzzyMedium(r);
  const big = fuzzyBig(r);

  const sum = small + medium + big;

  if (sum === 0) return 0;

  return Math.max(
    small * 0.4,
    medium * 0.7,
    big * 1.0
  ) / sum;
}


// driver hvca

function calculateHVAC(t, r) {
  const cool = coolingDemand(t);
  const heat = heatingDemand(t);
  const factor = roomFactor(r);

  if (cool > heat) {
    return {
      mode: 'cool',
      power: Math.min(cool * factor, 1)
    };
  } else {
    return {
      mode: 'heat',
      power: Math.min(heat * factor, 1)
    };
  }
}


function update() {
    const t = Number(tempSlider.value);
    const r = Number(roomSlider.value);

    tempValue.innerText = t + '°C';
    roomValue.innerText = r + ' m²';

    const result = calculateHVAC(t, r);
    const percent = Math.round(result.power * 100);

    hotIcon.classList.remove('active');
    coldIcon.classList.remove('active');

    if (result.mode === 'cool') {
        coldIcon.classList.add('active');
    } else {
        hotIcon.classList.add('active');
    }

    powerBar.style.width = percent + '%';
    powerValue.innerText = percent + '%';

    if (result.mode === 'cool') {
        const blue = Math.round(255 * result.power);
        document.body.style.backgroundColor = `rgb(80, 120, ${blue})`;
    } else {
        const red = Math.round(255 * result.power);
        document.body.style.backgroundColor = `rgb(${red}, 120, 80)`;
    }
}

tempSlider.addEventListener('input', update);
roomSlider.addEventListener('input', update);

update();