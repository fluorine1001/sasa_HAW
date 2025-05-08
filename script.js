let targetSpeed = 0; // 목표 속도
let currentSpeed = 0; // 현재 속도
const maxSpeed = 5; // 최고 속도 (픽셀/frame)
const acceleration = 0.2; // 가속도 (픽셀/frame²)
const margin = 100; // 추가 여유 (위/아래 여백)

document.addEventListener('mousemove', function(e) {
    let y = e.clientY;
    let height = window.innerHeight;

    if (y < height * 0.25) {
        targetSpeed = -maxSpeed; // 위로 스크롤
    } else if (y > height * 0.75) {
        targetSpeed = maxSpeed; // 아래로 스크롤
    } else {
        targetSpeed = 0; // 가운데에서는 멈춤
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

        // 위쪽 한계 처리
        if (newScroll < -margin) {
            newScroll = -margin;
        }
        // 아래쪽 한계 처리
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
