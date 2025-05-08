let targetSpeed = 0;
let currentSpeed = 0;
const maxSpeed = 5;
const acceleration = 0.2;
const margin = 100;

const links = [
    "https://soundcloud.com/41354rnjoawm/spark",
    "https://soundcloud.com/kk9gba3rypuc/card-clash",
    "https://soundcloud.com/vvkthll1ulvk/agp97mvrniud",
    "https://soundcloud.com/02uivhrz6pdr/feel-good",
    "https://soundcloud.com/bx0ucnqbgn0s/2eetpwwqo2ca",
    "https://soundcloud.com/sasaundcloud/8d0f3d77-c575-4835-b620-7c4611f53a09"
];

const titles = [
    "트랙 1 제목",
    "트랙 2 제목",
    "트랙 3 제목",
    "트랙 4 제목",
    "트랙 5 제목",
    "트랙 6 제목"
];

let widget = null;
let timeUpdater = null;

// 아트워크 URL 가져오기
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

// 시간 포맷 (ms → m:ss)
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// 마우스 위치에 따른 스크롤 속도 설정
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

// 부드러운 등가속 스크롤
function scrollPage() {
    if (currentSpeed < targetSpeed) {
        currentSpeed = Math.min(currentSpeed + acceleration, targetSpeed);
    } else if (currentSpeed > targetSpeed) {
        currentSpeed = Math.max(currentSpeed - acceleration, targetSpeed);
    }

    if (currentSpeed !== 0) {
        let newScroll = window.scrollY + currentSpeed;
        let maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        newScroll = Math.max(-margin, Math.min(newScroll, maxScroll + margin));
        window.scrollTo(0, newScroll);
    }

    requestAnimationFrame(scrollPage);
}
requestAnimationFrame(scrollPage);

// 트랙 클릭 → 아트워크 + 텍스트 + 시간 + 숨겨진 플레이어 생성
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
                <div class="track-time">(0:00 / 0:00)</div>
                <iframe id="sc-widget" scrolling="no" frameborder="no" allow="autoplay" src="${embedUrl}"></iframe>
            `;

            // fade-in
            setTimeout(() => playerContainer.classList.add('active'), 10);
            document.getElementById('close-button').style.display = 'flex';

            const iframeElement = document.getElementById('sc-widget');
            widget = SC.Widget(iframeElement);

            if (timeUpdater) clearInterval(timeUpdater);
            timeUpdater = setInterval(() => {
                widget.getPosition(pos => {
                    widget.getDuration(dur => {
                        document.querySelector('.track-time').innerText = `(${formatTime(pos)} / ${formatTime(dur)})`;
                    });
                });
            }, 1000);
        }
    });
});

// 닫기 버튼 → fade-out + 제거
document.getElementById('close-button').addEventListener('click', function() {
    const playerContainer = document.getElementById('player');
    playerContainer.classList.remove('active');
    setTimeout(() => {
        playerContainer.innerHTML = '';
        this.style.display = 'none';
    }, 500);
    if (timeUpdater) clearInterval(timeUpdater);
});

// 사이트 진입 시 초기 스크롤
window.addEventListener('load', () => {
    const boxHeight = 300 + 40 * 2 + 100;
    const initialScroll = boxHeight * 1.5;
    window.scrollTo(0, initialScroll);
});
