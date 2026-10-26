// Dung Pham Anh: Phát tiếng bíp ngắn khi quét lỗi (cảnh báo âm thanh tại quầy, UC-07 E2)
let context;

export function beep({ frequency = 440, duration = 0.18 } = {}) {
  try {
    context = context || new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.06;
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch {
    context = null;
  }
}
