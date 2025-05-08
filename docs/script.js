// ===========================
// 스크롤 관련 변수
// ===========================
let targetSpeed = 0;
let currentSpeed = 0;
const maxSpeed = 5;
const acceleration = 0.2;
const margin = 100;

// ===========================
// SoundCloud 링크 배열
// ===========================
const links = [
    "https://soundcloud.com/username/track1",
    "https://soundcloud.com/username/track2",
    "https://soundcloud.com/username/track3",
    "https://soundcloud.com/username/track4",
    "https://soundcloud.com/username/track5",
    "https://soundcloud.com/username/track6"
];

// ===========================
// 마우스 움직임에 따른 targetSpeed 설정
// ===========================
document.addEventListener('mousemove', function(e) {
    let y = e.clientY;
    let height = window.innerHeight;

    if (y < height * 0.25) {
        targetSpeed = -maxSpeed; // 위쪽으로 스크롤
    } else if (y > height * 0.75) {
        targetSpeed = maxSpeed; // 아래쪽으로 스크롤
    } else {
        targetSpeed = 0; // 가운데 영역에서는 멈춤
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
// 텍스트 박스 클릭 시 SoundCloud 트랙 재생
// ===========================
document.querySelectorAll('.textbox').forEach((box, index) => {
    box.addEventListener('click', function() {
        if (index < links.length) {
            const trackUrl = links[index];
            const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23ff5500&inverse=false&auto_play=true&show_user=true`;

            const playerContainer = document.getElementById('player');
            playerContainer.innerHTML = `
                <iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay"
                src="${embedUrl}"></iframe>
            `;
        } else {
            console.error('links 배열에 해당 인덱스가 없습니다.');
        }
    });
});

// ===========================
// 사이트 로드 시 초기 스크롤 위치 조정
// ===========================
window.addEventListener('load', () => {
    const boxHeight = 300 + 40 * 2 + 100; // 박스 높이 + 패딩 + 간격
    const initialScroll = boxHeight * 1.5; // 2~5번 박스가 보이도록
    window.scrollTo(0, initialScroll);
});
