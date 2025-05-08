let targetSpeed = 0;
let currentSpeed = 0;
const maxSpeed = 5;
const acceleration = 0.2;
const margin = 100;

// information 파일에서 읽어온 줄들
let lines = [];

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

// 🔥 information.txt 파일 읽어오기
fetch('information.txt')
    .then(response => response.text())
    .then(text => {
        lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    })
    .catch(error => {
        console.error('information 파일 로딩 실패:', error);
    });

// 🔥 텍스트 박스 클릭하면 해당 줄의 mp3 파일 재생
document.querySelectorAll('.textbox').forEach((box, index) => {
    box.addEventListener('click', function() {
        if (index < lines.length) {
            let filename = lines[index]; // x번째 줄 가져오기
            let audio = new Audio(filename + '.mp3'); // 예: "hello.mp3"
            audio.play();
        } else {
            console.error('lines에 해당 인덱스가 없습니다.');
        }
    });
});

// 🔥 초기 스크롤 조정
window.addEventListener('load', () => {
    const boxHeight = 300 + 40 * 2 + 100;
    const initialScroll = boxHeight * 1.5;
    window.scrollTo(0, initialScroll);
});
