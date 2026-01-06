# Sterownik klimatyzacji z wykorzystaniem logiki rozmytej

## 1. Wstęp

Projekt przedstawia prosty system sterowania klimatyzacją oparty na logice rozmytej.  
System na podstawie temperatury oraz wielkości pomieszczenia decyduje:

-> czy klimatyzacja ma grzać czy chłodzić  
-> z jaką mocą powinna pracować  

Logika rozmyta pozwala na płynne przejścia pomiędzy stanami zamiast sztywnych progów.

---

## 2. Zmienne wejściowe i wyjściowe

### Zmienne wejściowe
- temperatura pomieszczenia (suwak)
- wielkość pomieszczenia (suwak)

### Zmienne wyjściowe
- tryb pracy klimatyzacji -> grzanie / chłodzenie
- moc klimatyzacji -> 0–100%

---

## 3. Elementy DOM – wejście i wyjście systemu

```js
const tempSlider = document.getElementById('temp');
const roomSlider = document.getElementById('room');

const tempValue = document.getElementById('tempValue');
const roomValue = document.getElementById('roomValue');

const powerBar = document.getElementById('powerBar');
const powerValue = document.getElementById('powerValue');

const hotIcon = document.querySelector('.placeholder-icon--hot');
const coldIcon = document.querySelector('.placeholder-icon--cold');
```

Ten fragment:
-> pobiera wartości wejściowe od użytkownika
-> umożliwia wyświetlenie wyników działania algorytmu

## 4. Zbiory rozmyte – temperatura
Zimno (zapotrzebowanie na grzanie)

```js
function fuzzyCold(t) {
    if (t <= 18) return 1;
    if (t >= 24) return 0;
    return (24 - t) / (24 - 18);
}
```

Funkcja zwraca stopień zapotrzebowania na grzanie:
-> 1 oznacza silne grzanie
-> 0 oznacza brak grzania

Gorąco (zapotrzebowanie na chłodzenie)

```js
function fuzzyHot(t) {
    if (t <= 24) return 0;
    if (t >= 30) return 1;
    return (t - 24) / (30 - 24);
}
```

Funkcja zwraca stopień zapotrzebowania na chłodzenie:
-> 1 oznacza silne chłodzenie
-> 0 oznacza brak chłodzenia

## 5. Zbiory rozmyte – wielkość pomieszczenia

```js
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
```

Funkcje określają, w jakim stopniu pomieszczenie jest:
-> małe
-> średnie
-> duże

Jedno pomieszczenie może częściowo należeć do kilku zbiorów jednocześnie.

## 6. Zapotrzebowanie na grzanie i chłodzenie

```js
function coolingDemand(t) {
  return fuzzyHot(t);
}

function heatingDemand(t) {
  return fuzzyCold(t);
}
```

Temperatura wejściowa jest zamieniana na:
-> zapotrzebowanie na chłodzenie
-> zapotrzebowanie na grzanie

## 7. Wpływ wielkości pomieszczenia na moc

```js
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
```

Ta funkcja odpowiada za to, że:
-> im większe pomieszczenie, tym większa moc klimatyzacji
-> zmiana mocy jest płynna, bez skoków

## 8. Główna logika sterowania (HVAC)

```js
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
```

System:
-> porównuje zapotrzebowanie na grzanie i chłodzenie
-> wybiera dominujący tryb
-> oblicza końcową moc klimatyzacji

Ten fragment pełni rolę bazy reguł rozmytych.

## 9. Aktualizacja interfejsu użytkownika

```js
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
```

Funkcja update():
-> pobiera dane z interfejsu
-> uruchamia algorytm rozmyty
-> aktualizuje pasek mocy, ikony i kolor tła

## 10. Podsumowanie

Zaprojektowany system umożliwia sterowanie klimatyzacją w sposób płynny i intuicyjny.
Logika rozmyta pozwala na podejmowanie decyzji na podstawie nieostrych danych wejściowych, takich jak temperatura i wielkość pomieszczenia, bez stosowania sztywnych progów.
