let speed = 0;

document.addEventListener('mousemove', function(e) {
    let y = e.clientY;
    let height = window.innerHeight;
    
    if (y < height * 0.25) {
        speed = -5; // 위로 스크롤 (조금 빠르게)
    } else if (y > height * 0.75) {
        speed = 5; // 아래로 스크롤
    } else {
        speed = 0; // 중간 영역에서는 스크롤 멈춤
    }
});

function scrollPage() {
    if (speed !== 0) {
        window.scrollBy(0, speed);
    }
    requestAnimationFrame(scrollPage);
}
requestAnimationFrame(scrollPage);

// 텍스트 박스 클릭 시 오디오 재생
document.querySelectorAll('.textbox').forEach(box => {
    box.addEventListener('click', function() {
        let audioFile = this.getAttribute('data-audio');
        let audio = new Audio(audioFile);
        audio.play();
    });
});
