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
    "Spark | 홍준표",
    "Card Clash | 이지민",
    "음악 자료 | 이서우",
    "Feel Good | 조용준",
    "밤과 방 안의 우리들 | 이정윤",
    "자정 | 고은규"
];

let widget = null;
let timeUpdater = null;

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
                </div>
                <iframe id="sc-widget" scrolling="no" frameborder="no" allow="autoplay" src="${embedUrl}"></iframe>
            `;

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

            setupControls();
        }
    });
});

function setupControls() {
    const prevBtn = document.getElementById('prev');
    const playPauseBtn = document.getElementById('play-pause');
    const nextBtn = document.getElementById('next');

    // 🔥 루프 버튼 추가
    if (!document.getElementById('loop-button')) {
        const loopBtn = document.createElement('button');
        loopBtn.id = "loop-button";
        loopBtn.innerText = "⟳";
        document.getElementById('controls').appendChild(loopBtn);

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
}

function showLoopUI() {
    const container = document.getElementById('container');

    let loopLine = document.createElement('div');
    loopLine.id = 'loop-line';
    loopLine.style.height = `${container.offsetHeight}px`;
    document.body.appendChild(loopLine);

    // 위 점
    let topDot = document.createElement('div');
    topDot.className = 'loop-dot';
    topDot.style.top = `${100}px`;
    loopLine.appendChild(topDot);

    // 아래 점
    let bottomDot = document.createElement('div');
    bottomDot.className = 'loop-dot';
    bottomDot.style.bottom = `${100}px`;
    loopLine.appendChild(bottomDot);

    // 중간 사각형들
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

document.getElementById('close-button').addEventListener('click', function() {
    const playerContainer = document.getElementById('player');
    playerContainer.classList.remove('active');
    setTimeout(() => {
        playerContainer.innerHTML = '';
        this.style.display = 'none';
    }, 500);

    if (timeUpdater) clearInterval(timeUpdater);
});

window.addEventListener('load', () => {
    const boxHeight = 300 + 40 * 2 + 70;
    const initialScroll = boxHeight * 1.5;
    window.scrollTo(0, initialScroll);
});
