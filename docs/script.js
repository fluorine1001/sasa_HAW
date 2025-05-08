// ===========================
// 스크롤 관련 변수
// ===========================
let targetSpeed = 0;
let currentSpeed = 0;
const maxSpeed = 5;
const acceleration = 0.2;
const margin = 100;

// ===========================
// information.txt 파일 읽기
// ===========================
let lines = [];

fetch('information.txt')
    .then(response => response.text())
    .then(text => {
        lines = text.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
    })
    .catch(error => {
        console.error('information 파일 로딩 실패:', error);
    });

// ===========================
// 마우스 움직임에 따른 targetSpeed 설정
// ===========================
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

// ===========================
// 부드러운 등가속 스크롤
// ===========================
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

// ===========================
// 텍스트 박스 클릭 시 mp3 파일 재생
// ===========================
document.querySelectorAll('.textbox').forEach((box, index) => {
    box.addEventListener('click', function() {
        if (index < lines.length) {
            let filename = lines[index];
            let safeFilename = encodeURIComponent(filename); // 🔥 URL 인코딩 적용
            let audio = new Audio(safeFilename + '.mp3');
            audio.play();
        } else {
            console.error('lines 배열에 해당 인덱스가 없습니다.');
        }
    });
});

// ===========================
// 사이트 로드 시 초기 스크롤 위치 조정
// ===========================
window.addEventListener('load', () => {
    const boxHeight = 300 + 40 * 2 + 100; // 텍스트 박스 높이 + padding + gap
    const initialScroll = boxHeight * 1.5; // 2번 ~ 5번 상자가 보이도록 스크롤
    window.scrollTo(0, initialScroll);
});
