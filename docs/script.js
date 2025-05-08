let targetSpeed = 0;
let currentSpeed = 0;
const maxSpeed = 5;
const acceleration = 0.2;
const margin = 100;

const links = [
    "https://soundcloud.com/username/track1",
    "https://soundcloud.com/username/track2",
    "https://soundcloud.com/username/track3",
    "https://soundcloud.com/username/track4",
    "https://soundcloud.com/username/track5",
    "https://soundcloud.com/username/track6"
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
let loopMode = false;
let loopStart = 0;
let loopEnd = links.length - 1;
let loopActive = Array(links.length).fill(true);
let currentPlayingIndex = 0;

async function getArtwork(trackUrl) {
    const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(trackUrl)}`;
    try {
        const response = await fetch(oembedUrl);
        const data = await response.json();
        return data.thumbnail_url;
    } catch (error) {
        console.error("Artwork 로딩 실패:", error);
        return "https://via.placeholder.com/400?text=Error";
    }
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

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
        newScroll = Math.max(-margin, Math.min(newScroll, maxScroll + margin));
        window.scrollTo(0, newScroll);
    }

    requestAnimationFrame(scrollPage);
}
requestAnimationFrame(scrollPage);

document.querySelectorAll('.textbox').forEach((box, index) => {
    box.addEventListener('click', async function() {
        if (index < links.length) {
            currentPlayingIndex = index;
            playTrack(index);
            highlightCurrentTextbox(index);
        }
    });
});

function playTrack(index) {
    if (index < 0 || index >= links.length) return;

    currentPlayingIndex = index;
    const trackUrl = links[index];
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23ff5500&inverse=false&auto_play=true&show_user=true`;

    const playerContainer = document.getElementById('player');
    const iframeElement = document.getElementById('sc-widget');

    if (iframeElement) {
        iframeElement.src = embedUrl;
    }

    highlightCurrentTextbox(index);

    widget = SC.Widget(document.getElementById('sc-widget'));
    widget.bind(SC.Widget.Events.FINISH, () => {
        if (loopMode) {
            playNextInLoop();
        }
    });
}

function highlightCurrentTextbox(index) {
    const boxes = document.querySelectorAll('.textbox');
    boxes.forEach((box, i) => {
        box.classList.toggle('active', i === index);
    });
}

function playNextInLoop() {
    let nextIndex = currentPlayingIndex + 1;

    if (nextIndex > loopEnd) {
        nextIndex = loopStart;
    }

    while (nextIndex <= loopEnd && !loopActive[nextIndex]) {
        nextIndex++;
        if (nextIndex > loopEnd) {
            nextIndex = loopStart;
        }
    }

    if (!loopActive[nextIndex]) {
        console.warn('루프 범위에 활성화된 곡이 없습니다.');
        return;
    }

    playTrack(nextIndex);
}

// (여기까지 1단계, 2단계, 3단계 모두 통합 완성입니다.)

