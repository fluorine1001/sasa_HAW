// 자동 스크롤 기능
let container = document.getElementById('container');
let speed = 0;

document.addEventListener('mousemove', function(e) {
    let y = e.clientY;
    let height = window.innerHeight;
    if (y < height * 0.2) {
        speed = -2; // 위로 이동
    } else if (y > height * 0.8) {
        speed = 2; // 아래로 이동
    } else {
        speed = 0;
    }
});

function scrollContainer() {
    container.style.top = (parseFloat(container.style.top) + speed) + 'px';
    requestAnimationFrame(scrollContainer);
}
requestAnimationFrame(scrollContainer);

// 텍스트 박스 클릭 시 오디오 재생
document.querySelectorAll('.textbox').forEach(box => {
    box.addEventListener('click', function() {
        let audioFile = this.getAttribute('data-audio');
        let audio = new Audio(audioFile);
        audio.play();
    });
});
