// ===========================
// 스크롤 관련 변수
// ===========================
let targetSpeed = 0;
let currentSpeed = 0;
const maxSpeed = 5;
const acceleration = 0.2;
const margin = 100;

// ===========================
// SoundCloud 트랙 링크 배열
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
// SoundCloud client_id
// (미리 얻은 client_id 입력)
const clientId = "cclLlwXxVF8m2AFHEEibPwBnLTESYcgj"; // ⭐ 여기에 입력

// ===========================
// SoundCloud 트랙에서 아트워크 가져오는 함수
// ===========================
async function getArtwork(trackUrl) {
    const resolveUrl = `https://api.soundcloud.com/resolve?url=${encodeURIComponent(trackUrl)}&client_id=${clientId}`;
    try {
        const response = await fetch(resolveUrl);
        const trackData = await response.json();
        if (trackData.artwork_url) {
            return trackData.artwork_url.replace("-large", "-t500x500");
        } else {
            return "https://via.placeholder.com/200?text=No+Artwork";
        }
    } catch (error) {
        console.error("Artwork 로딩 실패:", error);
        return "https://via.placeholder.com/200?text=Error";
    }
}

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
// 텍스트 박스 클릭 시 SoundCloud 임베드 + 아트워크 띄우기
// ===========================
document.querySelectorAll('.textbox').forEach((box, index) => {
    box.addEventListener('click', async function() {
        if (index < links.length) {
            const trackUrl = links[index];
            const artworkUrl = await getArtwork(trackUrl);

            const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23ff5500&inverse=false&auto_play=true&show_user=true`;

            const playerContainer = document.getElementById('player');
            playerContainer.innerHTML = `
                <img src="${artworkUrl}" alt="Artwork">
                <iframe scrolling="no" frameborder="no" allow="autoplay"
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
    const boxHeight = 300 + 40 * 2 + 100;
    const initialScroll = boxHeight * 1.5;
    window.scrollTo(0, initialScroll);
});
