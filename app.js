'use strict';
const slides = [...document.querySelectorAll('.slide')];
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const video = document.querySelector('#product-video');
const play = document.querySelector('#play-video');
const stage = document.querySelector('#stage');
const textContent = document.querySelector('#slide-text');
const texts = [
  `<h2>SkiMotion</h2><p class="intro">Make every run count</p><p>Combining video and ski-boot sensor data<br>for technique review and instruction</p><h3>Illustrated data</h3><p>Torso / Horizontal: 84°<br>Lower Leg / Snow: 36°<br>Posture Over Time: 0s / 5s / 10s / 15s</p>`,
  `<h2>Combining video and motion data</h2><p class="intro">Match movement and data to the same turn</p><h3>Ski-boot sensors</h3><p>Tilt angle and acceleration in turns</p><h3>Skiing video</h3><p>Full-body movement and posture</p><h3>Align &amp; sync</h3><p>Dynamic 3D reconstruction and joint analysis with AI</p><h3>Skiers</h3><p>Understand movement and get clear feedback</p><h3>Instructors</h3><p>Review and explain runs, track progress</p><h3>Ski resorts</h3><p>Save and share runs, broaden resort services</p>`,
  `<h2>Product experience video</h2>`,
  `<h2>Your experience and insights</h2><h3>Product and market</h3><ol><li><strong>What similar products or technologies have you seen or used?</strong><p>If you've used any, which features did you like?<br>What could be improved?<br>If not, based on the video, would you buy this product for your own use?</p></li><li><strong>Which European country would you recommend for a pilot project?</strong><p>What are your main reasons?</p></li><li><strong>Which customer groups are most willing to pay for ski instruction?</strong><p>Which skiing skills do they usually want to improve?</p></li></ol><h3>Teaching and instructors</h3><ol start="4"><li><strong>Do instructors currently use video in their teaching?</strong><p>If so, when do they typically use it?</p></li><li><strong>Do instructors need to adapt their teaching to each student?</strong><p>What differences between students do they take into account?</p></li><li><strong>Do instructors worry about being replaced by AI?</strong><p>If so, what concerns have you observed?</p></li></ol>`,
  `<h2>Thank you for your time</h2><p>Your experience will help us assess product value<br>and guide our pilot plans</p><p>SkiMotion</p>`
];
let current = 0;
function fromHash() {
  const match = location.hash.match(/^#slide-([1-5])$/);
  return match ? Number(match[1]) - 1 : 0;
}
function show(index, updateHash = true) {
  const chosen = Math.max(0, Math.min(slides.length - 1, index));
  if (current === 2 && chosen !== 2) video.pause();
  current = chosen;
  slides.forEach((slide, i) => { slide.hidden = i !== current; });
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  document.querySelector('#page-count').textContent = `Slide ${current + 1} of ${slides.length}`;
  textContent.innerHTML = texts[current];
  document.querySelector('#video-error').hidden = current !== 2 || !video.error;
  if (updateHash) history.replaceState(null, '', `#slide-${current + 1}`);
}
previous.addEventListener('click', () => show(current - 1));
next.addEventListener('click', () => show(current + 1));
window.addEventListener('hashchange', () => show(fromHash(), false));
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('video, input, textarea, select')) return;
  const target = {ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: 4}[event.key];
  if (target === undefined) return;
  event.preventDefault();
  show(target);
});
let touch = null;
stage.addEventListener('touchstart', event => {
  if (event.touches.length !== 1 || event.target.closest('.video-frame')) { touch = null; return; }
  touch = {x: event.touches[0].clientX, y: event.touches[0].clientY};
}, {passive: true});
stage.addEventListener('touchend', event => {
  if (!touch || !event.changedTouches.length) return;
  const dx = event.changedTouches[0].clientX - touch.x;
  const dy = event.changedTouches[0].clientY - touch.y;
  touch = null;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
}, {passive: true});
stage.addEventListener('touchcancel', () => { touch = null; }, {passive: true});
play.addEventListener('click', async () => {
  try {
    if (video.ended) video.currentTime = 0;
    await video.play();
  } catch {
    play.hidden = true;
    video.focus();
    if (video.error) document.querySelector('#video-error').hidden = false;
  }
});
video.addEventListener('play', () => { play.hidden = true; });
video.addEventListener('ended', () => { play.hidden = false; });
video.addEventListener('error', () => {
  play.hidden = true;
  document.querySelector('#video-error').hidden = current !== 2;
});
document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
const fullscreen = document.querySelector('#fullscreen');
const reader = document.querySelector('#reader');
if (!reader.requestFullscreen) fullscreen.hidden = true;
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await reader.requestFullscreen();
  } catch { fullscreen.hidden = true; }
});
document.addEventListener('fullscreenchange', () => {
  const label = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
  fullscreen.setAttribute('aria-label', label);
  fullscreen.title = label;
});
show(fromHash(), false);
