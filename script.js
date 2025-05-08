let targetSpeed = 0;
let currentSpeed = 0;
const maxSpeed = 10;
const acceleration = 0.2;
const margin = 100; // 컨테이너 패딩과 동일한 값

document.addEventListener('mousemove', function(e) {
    let y = e.clientY;
    let height = window.innerHeight;

    if (y < height * 0.25) {
        targetSpeed = -maxSpeed;
    } else if (y > height * 0.75) {
        targetSpeed = maxSpeed;
    } else {
        targetSpeed = 0;
    }
});

function scrollPage() {
    if (currentSpeed < targetSpeed) {
        currentSpeed = Math.min(currentSpeed + acceleration, targetSpeed);
    } else if (currentSpeed > targetSpeed) {
        currentSpeed = Math.max(currentSpeed - acceleration, targetSpeed);
    }

    if (currentSpeed !== 0) {
        let newScroll = window.scrollY + currentSpeed;
        let maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        if (newScroll < -margin) {
            newScroll = -margin;
        }
        if (newScroll > maxScroll + margin) {
            newScroll = maxScroll + margin;
        }

        window.scrollTo(0, newScroll);
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

// 🔥 최초 로딩 시 스크롤 위치 조정
window.addEventListener('load', () => {
    const boxHeight = 300 + 40 * 2 + 100; // (텍스트박스 높이 + 패딩*2 + gap)
    const initialScroll = boxHeight * 1.5; 
    // 1.5개 정도 스크롤 => 2~5번 상자 중심으로 보이게
    window.scrollTo(0, initialScroll);
});
