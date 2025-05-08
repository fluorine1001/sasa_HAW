// --- 기본 전역 변수들 ---
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
let loopMode = false;
let loopStart = 0;
let loopEnd = links.length - 1;
let loopActive = Array(links.length).fill(true);
let currentPlayingIndex = 0;

// --- 아트워크 가져오기 ---
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

// --- 시간 포맷팅 ---
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// --- 마우스 이동에 따라 자동 스크롤 ---
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

// --- 텍스트 박스 클릭: player 전체 생성 ---
document.querySelectorAll('.textbox').forEach((box, index) => {
    box.addEventListener('click', async function() {
        if (index < links.length) {
            currentPlayingIndex = index;

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
                <div id="controls">
                    <button id="prev">&lt;</button>
                    <button id="play-pause">⏸</button>
                    <button id="next">&gt;</button>
                    <button id="loop-button">⟳</button>
                </div>
                <iframe id="sc-widget" scrolling="no" frameborder="no" allow="autoplay" src="${embedUrl}"></iframe>
            `;

            setTimeout(() => playerContainer.classList.add('active'), 10);
            document.getElementById('close-button').style.display = 'flex';

            widget = SC.Widget(document.getElementById('sc-widget'));

            setupControls(); // 버튼 이벤트 연결
            highlightCurrentTextbox(index); // 텍스트 박스 강조

            if (timeUpdater) clearInterval(timeUpdater);
            timeUpdater = setInterval(() => {
                widget.getPosition(pos => {
                    widget.getDuration(dur => {
                        document.querySelector('.track-time').innerText = `(${formatTime(pos)} / ${formatTime(dur)})`;
                    });
                });
            }, 1000);

            widget.bind(SC.Widget.Events.FINISH, () => {
                if (loopMode) {
                    playNextInLoop();
                }
            });
        }
    });
});

// --- 플레이어 제어 버튼 설정 ---
function setupControls() {
    const prevBtn = document.getElementById('prev');
    const playPauseBtn = document.getElementById('play-pause');
    const nextBtn = document.getElementById('next');
    const loopBtn = document.getElementById('loop-button');

    let isPlaying = true;

    prevBtn.addEventListener('click', () => {
        widget.getPosition(pos => {
            widget.seekTo(Math.max(pos - 5000, 0));
        });
    });

    nextBtn.addEventListener('click', () => {
        widget.getPosition(pos => {
            widget.getDuration(dur => {
                widget.seekTo(Math.min(pos + 5000, dur));
            });
        });
    });

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            widget.pause();
            playPauseBtn.innerText = "▶";
        } else {
            widget.play();
            playPauseBtn.innerText = "⏸";
        }
        isPlaying = !isPlaying;
    });

    loopBtn.addEventListener('click', () => {
        loopMode = !loopMode;
        loopBtn.classList.toggle('active', loopMode);

        if (loopMode) {
            showLoopUI();
        } else {
            hideLoopUI();
        }
    });
}

// --- 현재 재생 중인 텍스트박스 강조 표시 ---
function highlightCurrentTextbox(index) {
    const boxes = document.querySelectorAll('.textbox');
    boxes.forEach((box, i) => {
        box.classList.toggle('active', i === index);
    });
}

// --- 루프 모드 재생: 다음 활성화된 트랙 재생 ---
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
        console.warn('루프 구간에 활성화된 트랙이 없습니다.');
        return;
    }
    playTrack(nextIndex);
}

// --- 트랙 재생 함수 (iframe 교체) ---
function playTrack(index) {
    if (index < 0 || index >= links.length) return;

    currentPlayingIndex = index;
    const trackUrl = links[index];
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23ff5500&inverse=false&auto_play=true&show_user=true`;

    const iframeElement = document.getElementById('sc-widget');
    if (iframeElement) {
        iframeElement.src = embedUrl;
    }

    highlightCurrentTextbox(index);
}

// --- 루프 UI 표시/숨기기 ---
function showLoopUI() {
    const container = document.getElementById('container');
    let loopLine = document.createElement('div');
    loopLine.id = 'loop-line';
    loopLine.style.height = `${container.offsetHeight}px`;
    document.body.appendChild(loopLine);

    let topDot = document.createElement('div');
    topDot.id = 'top-dot';
    topDot.className = 'loop-dot';
    loopLine.appendChild(topDot);

    let bottomDot = document.createElement('div');
    bottomDot.id = 'bottom-dot';
    bottomDot.className = 'loop-dot';
    loopLine.appendChild(bottomDot);

    positionDots();
    setupDotDragging('top-dot');
    setupDotDragging('bottom-dot');

    document.querySelectorAll('.textbox').forEach((box, index) => {
        let rect = box.getBoundingClientRect();
        let boxDiv = document.createElement('div');
        boxDiv.className = 'loop-box';
        boxDiv.style.top = `${rect.top + window.scrollY + box.offsetHeight / 2 - 7}px`;
        boxDiv.dataset.index = index;
        boxDiv.addEventListener('click', () => {
            boxDiv.classList.toggle('inactive');
            loopActive[index] = !loopActive[index];
        });
        loopLine.appendChild(boxDiv);
    });

    loopLine.style.display = 'block';
}

function hideLoopUI() {
    const loopLine = document.getElementById('loop-line');
    if (loopLine) loopLine.remove();
}

function positionDots() {
    const boxes = document.querySelectorAll('.textbox');
    if (boxes.length === 0) return;

    const firstBox = boxes[loopStart];
    const lastBox = boxes[loopEnd];

    const topDot = document.getElementById('top-dot');
    const bottomDot = document.getElementById('bottom-dot');

    const rect1 = firstBox.getBoundingClientRect();
    const rect2 = lastBox.getBoundingClientRect();

    topDot.style.top = `${rect1.top + window.scrollY + firstBox.offsetHeight / 2 - 5}px`;
    bottomDot.style.top = `${rect2.top + window.scrollY + lastBox.offsetHeight / 2 - 5}px`;
}

function setupDotDragging(dotId) {
    const dot = document.getElementById(dotId);
    const boxes = document.querySelectorAll('.textbox');

    dot.addEventListener('mousedown', (e) => {
        e.preventDefault();

        const moveHandler = (eMove) => {
            let closestIndex = 0;
            let minDist = Infinity;

            boxes.forEach((box, index) => {
                const rect = box.getBoundingClientRect();
                const centerY = rect.top + window.scrollY + box.offsetHeight / 2;
                const dist = Math.abs(centerY - eMove.clientY - window.scrollY);
                if (dist < minDist) {
                    minDist = dist;
                    closestIndex = index;
                }
            });

            if (dotId === 'top-dot') {
                if (closestIndex <= loopEnd) loopStart = closestIndex;
            } else if (dotId === 'bottom-dot') {
                if (closestIndex >= loopStart) loopEnd = closestIndex;
            }

            positionDots();
        };

        const upHandler = () => {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', upHandler);
        };

        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', upHandler);
    });
}

// --- X 버튼 눌렀을 때 닫기 ---
document.getElementById('close-button').addEventListener('click', function() {
    const playerContainer = document.getElementById('player');
    playerContainer.classList.remove('active');
    setTimeout(() => {
        playerContainer.innerHTML = '';
        this.style.display = 'none';
    }, 500);

    if (timeUpdater) clearInterval(timeUpdater);
});

// --- 사이트 로드시 초기 스크롤 조정 ---
window.addEventListener('load', () => {
    const boxHeight = 300 + 40 * 2 + 70;
    const initialScroll = boxHeight * 1.5;
    window.scrollTo(0, initialScroll);
});
