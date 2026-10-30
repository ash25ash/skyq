/**
 * Interactive SkyQ Roulette Wheel Engine
 * HTML5 Canvas + Web Audio API Tick Sounds + Physical Easing
 */
class SkyQRoulette {
  constructor(canvasId, onPrizeSelected) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.onPrizeSelected = onPrizeSelected;

    this.prizes = [];
    this.currentRotation = 0; // in radians
    this.isSpinning = false;
    this.audioCtx = null;
    this.lastTickSegment = -1;

    this.initAudio();
    this.setupCanvasDpi();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }

  playTickSound() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  playWinFanfare() {
    if (!this.audioCtx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
          gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start();
          osc.stop(this.audioCtx.currentTime + 0.38);
        }, idx * 120);
      });
    } catch (e) {}
  }

  setupCanvasDpi() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = (rect.width || 420) * dpr;
    this.canvas.height = (rect.height || 420) * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width || 420;
    this.height = rect.height || 420;
  }

  setPrizes(prizes) {
    this.prizes = prizes;
    this.draw();
  }

  draw() {
    if (!this.ctx || this.prizes.length === 0) return;

    const ctx = this.ctx;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(centerX, centerY) - 15;
    const sliceAngle = (Math.PI * 2) / this.prizes.length;

    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.currentRotation);

    // Outer wheel border with shadow
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#0a2540';
    ctx.stroke();

    // Draw slices
    this.prizes.forEach((prize, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius - 2, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color || (i % 2 === 0 ? '#0284c7' : '#0a2540');
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Text and icons
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = prize.textColor || '#ffffff';
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      // Slice label text (truncated if too long)
      const label = prize.title || prize.title_en || `Prize ${i + 1}`;
      const shortLabel = label.length > 22 ? label.substring(0, 20) + '...' : label;
      ctx.fillText(shortLabel, radius - 28, 5);

      // Decorative dots on slice border
      ctx.beginPath();
      ctx.arc(radius - 12, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.fill();

      ctx.restore();
    });

    // Center Hub
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fillStyle = '#0a2540';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // Center Airplane Icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✈️', 0, 0);

    ctx.restore();

    // Fixed Top Pointer / Needle (pointing downwards to top edge of wheel)
    this.drawPointer(centerX, centerY - radius + 5);
  }

  drawPointer(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Pointer shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // Pointer shape
    ctx.beginPath();
    ctx.moveTo(0, 18);   // bottom point pointing into wheel
    ctx.lineTo(-14, -10); // top left
    ctx.lineTo(14, -10);  // top right
    ctx.closePath();
    ctx.fillStyle = '#ef4444'; // Red pointer
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Pointer pivot pin
    ctx.beginPath();
    ctx.arc(0, -5, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();

    ctx.restore();
  }

  spin(targetPrizeId) {
    if (this.isSpinning || this.prizes.length === 0) return;
    this.isSpinning = true;

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    // Determine target index
    let targetIndex = this.prizes.findIndex(p => p.id === targetPrizeId);
    if (targetIndex === -1) {
      targetIndex = Math.floor(Math.random() * this.prizes.length);
    }

    const numSlices = this.prizes.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    // Pointer is at the top (-PI / 2 radians)
    // To land on targetIndex under the top pointer:
    // rotation = -PI/2 - (targetIndex * sliceAngle + sliceAngle/2)
    const targetSliceAngle = targetIndex * sliceAngle + sliceAngle / 2;
    const baseTargetAngle = (Math.PI * 1.5) - targetSliceAngle;

    // Normalize base target angle
    const normalizedBase = ((baseTargetAngle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);

    // Add 6 to 9 full spins for suspense
    const extraSpins = (6 + Math.floor(Math.random() * 3)) * Math.PI * 2;
    // Add tiny random jitter within slice
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.6);

    const startRotation = this.currentRotation % (Math.PI * 2);
    const totalRotation = extraSpins + normalizedBase + jitter;
    const finalRotation = this.currentRotation + totalRotation;

    const duration = 4800; // ms
    const startTime = performance.now();

    const animateSpin = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic ease-out for ultra realistic friction
      const easeOut = 1 - Math.pow(1 - progress, 4);

      this.currentRotation = startRotation + totalRotation * easeOut;
      this.draw();

      // Tick sound calculation
      const currentAngle = this.currentRotation % (Math.PI * 2);
      const activeSegment = Math.floor((currentAngle / (Math.PI * 2)) * numSlices);
      if (activeSegment !== this.lastTickSegment) {
        this.playTickSound();
        this.lastTickSegment = activeSegment;
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        this.isSpinning = false;
        this.playWinFanfare();
        if (window.confettiCannon) {
          window.confettiCannon.burst(150);
        }
        if (this.onPrizeSelected) {
          this.onPrizeSelected(this.prizes[targetIndex]);
        }
      }
    };

    requestAnimationFrame(animateSpin);
  }
}
