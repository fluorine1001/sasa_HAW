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
    "https://soundcloud.com/41354rnjoawm/spark",
    "https://soundcloud.com/kk9gba3rypuc/card-clash",
    "https://soundcloud.com/vvkthll1ulvk/agp97mvrniud",
    "https://soundcloud.com/02uivhrz6pdr/feel-good",
    "https://soundcloud.com/bx0ucnqbgn0s/2eetpwwqo2ca",
    "https://soundcloud.com/sasaundcloud/8d0f3d77-c575-4835-b620-7c4611f53a09"
];

// ===========================
// 각 트랙에 대응하는 설명 텍스트 배열
// ===========================
const titles = [
    "트랙 1 제목",
    "트랙 2 제목",
    "트랙 3 제목",
    "트랙 4 제목",
    "트랙 5 제목",
    "트랙 6 제목"
];

// ===========================
// SoundCloud oEmbed API를 통한 아트워크 가져오기
// ===========================
async function getArtwork(trackUrl) {
    const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(trackUrl)}`;
    try {
        const response = await fetch(oembedUrl);
        const data = await response.json();
        return data.thumbnail_url;
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
// 텍스트 박스 클릭 시 아트워크 + 제목 + 임베드 표시
// ===========================
document.querySelectorAll('.textbox').forEach((box, index) => {
    box.addEventListener('click', async function() {
        if (index < links.length) {
            const trackUrl = links[index];
            const artworkUrl = await getArtwork(trackUrl);
            const title = titles[index];

            const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23ff5500&inverse=false&auto_play=true&show_user=true`;

            const playerContainer = document.getElementById('player');
            playerContainer.innerHTML = `
                <div id="artwork-container">
                    <img src="${artworkUrl}" alt="Artwork">
                </div>
                <div class="track-title">${title}</div>
                <iframe scrolling="no" frameborder="no" allow="autoplay"
                src="${embedUrl}"></iframe>
            `;

            // 🔥 아트워크가 뜨면 X 버튼 보이게
            document.getElementById('close-button').style.display = 'flex';
        } else {
            console.error('links 배열에 해당 인덱스가 없습니다.');
        }
    });
});

// ===========================
// 닫기 버튼 동작: 아트워크, 텍스트, iframe 모두 삭제
// ===========================
document.getElementById('close-button').addEventListener('click', function() {
    const playerContainer = document.getElementById('player');
    playerContainer.innerHTML = '';
    this.style.display = 'none'; // X 버튼 숨기기
});

// ===========================
// 사이트 로드 시 초기 스크롤 위치 조정
// ===========================
window.addEventListener('load', () => {
    const boxHeight = 300 + 40 * 2 + 100;
    const initialScroll = boxHeight * 1.5;
    window.scrollTo(0, initialScroll);
});
