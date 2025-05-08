let container = document.getElementById('container');
let speed = 0;

document.addEventListener('mousemove', function(e) {
    let y = e.clientY;
    let height = window.innerHeight;
    if (y < height * 0.2) {
        speed = -3; // 위로 더 빠르게
    } else if (y > height * 0.8) {
        speed = 3; // 아래로 더 빠르게
    } else {
        speed = 0;
    }
});

function scrollContainer() {
    container.style.top = (parseFloat(container.style.top) + speed) + 'px';
    requestAnimationFrame(scrollContainer);
}
requestAnimationFrame(scrollContainer);

// 오디오 재생 부분은 그대로 유지
document.querySelectorAll('.textbox').forEach(box => {
    box.addEventListener('click', function() {
        let audioFile = this.getAttribute('data-audio');
        let audio = new Audio(audioFile);
        audio.play();
    });
});
