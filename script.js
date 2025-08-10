document.addEventListener('DOMContentLoaded', () => {
    const robotContainer = document.getElementById('robot-clickable-area');
    if (robotContainer) {
        const svg = document.getElementById('robot-svg');
        const leftPupil = document.getElementById('left-pupil');
        const rightPupil = document.getElementById('right-pupil');
        const mouthClosed = document.getElementById('mouth-closed');
        const mouthOpen = document.getElementById('mouth-open');
        const chatBubble = document.getElementById('robot-chat-bubble');

        const leftEyeCenter = { x: 85, y: 55 };
        const rightEyeCenter = { x: 115, y: 55 };
        const pupilMaxOffset = 4;

        let isSpeaking = false;
        let clickCount = 0;
        let chatTimeout;

        // NEW: Expanded personality responses
        const randomResponses = [
            "มีอะไรเหรอครับ?", 
            "มีอะไรให้ผมช่วยหรือเปล่า?", 
            "เรียกผมเหรอครับ?",
            "ว่าไงครับ"
        ];
        const teaseResponses = [
            "ฮั่นแน่! สนใจผมล่ะสิ",
            "สนใจผมเหรอ? ผมก็สนใจคุณนะ",
            "พอแล้วครับ เดี๋ยวผมเขินนะ",
            "ถ้าอยากคุยกันจริงจัง ไปที่หน้า Contact ได้เลยนะ"
        ];

        // --- 1. Eye Tracking --- (No changes here)
        document.addEventListener('mousemove', (e) => {
            const svgRect = svg.getBoundingClientRect();
            const mouse = {
                x: (e.clientX - svgRect.left) / svgRect.width * 200,
                y: (e.clientY - svgRect.top) / svgRect.height * 200
            };
            const leftDelta = { x: mouse.x - leftEyeCenter.x, y: mouse.y - leftEyeCenter.y };
            const leftAngle = Math.atan2(leftDelta.y, leftDelta.x);
            const leftOffsetX = Math.cos(leftAngle) * pupilMaxOffset;
            const leftOffsetY = Math.sin(leftAngle) * pupilMaxOffset;
            leftPupil.setAttribute('cx', leftEyeCenter.x + leftOffsetX);
            leftPupil.setAttribute('cy', leftEyeCenter.y + leftOffsetY);

            const rightDelta = { x: mouse.x - rightEyeCenter.x, y: mouse.y - rightEyeCenter.y };
            const rightAngle = Math.atan2(rightDelta.y, rightDelta.x);
            const rightOffsetX = Math.cos(rightAngle) * pupilMaxOffset;
            const rightOffsetY = Math.sin(rightAngle) * pupilMaxOffset;
            rightPupil.setAttribute('cx', rightEyeCenter.x + rightOffsetX);
            rightPupil.setAttribute('cy', rightEyeCenter.y + rightOffsetY);
        });

        // --- 2. Upgraded Speech & Chat Bubble Function ---
        function robotSpeak(text) {
    if (isSpeaking || !('speechSynthesis' in window)) {
        return;
    }
    isSpeaking = true;

    // Show chat bubble
    chatBubble.textContent = text;
    chatBubble.classList.add('show');
    clearTimeout(chatTimeout);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang === 'th-TH');
    if (voices.length > 0) {
        utterance.voice = voices.length > 1 && Math.random() > 0.5 ? voices[1] : voices[0];
    }

    utterance.pitch = 1.1;
    utterance.rate = 1.1;

    let mouthAnimationInterval;

    utterance.onstart = () => {
        mouthAnimationInterval = setInterval(() => {
            mouthClosed.style.visibility = 'hidden';
            mouthOpen.style.visibility = 'visible';
            setTimeout(() => {
                mouthClosed.style.visibility = 'visible';
                mouthOpen.style.visibility = 'hidden';
            }, 150);
        }, 300);
    };

    utterance.onend = () => {
        clearInterval(mouthAnimationInterval);
        mouthClosed.style.visibility = 'visible';
        mouthOpen.style.visibility = 'hidden';
        isSpeaking = false;
        // Hide chat bubble after speech ends
        chatTimeout = setTimeout(() => {
            chatBubble.classList.remove('show');
        }, 2500); // เพิ่มเวลาให้มองเห็นนานขึ้นเล็กน้อย
    };
    
    window.speechSynthesis.speak(utterance);
}
        
        // Ensure voices are loaded
        window.speechSynthesis.onvoiceschanged = () => {
            console.log("Voices loaded");
        };


        // --- 3. Upgraded Click Event Logic ---
        robotContainer.addEventListener('click', () => {
            clickCount++;
            
            if (clickCount <= 3) {
                const randomIndex = Math.floor(Math.random() * randomResponses.length);
                robotSpeak(randomResponses[randomIndex]);
            } else {
                const teaseIndex = (clickCount - 4) % teaseResponses.length; // Loop through tease responses
                robotSpeak(teaseResponses[teaseIndex]);
            }
        });

        // --- 4. Automatic Greeting ---
        function autoGreet() {
            setTimeout(() => {
                robotSpeak("สวัสดีครับ ผมคือเฟิง ผู้ดูแลเรซูเม่ของไมค์");
            }, 1500);
            
            setInterval(() => {
                robotSpeak("ผมคือเฟิง ผู้ดูแลเรซูเม่ของไมค์");
            }, 30000);
        }
        
        autoGreet();
    }
});

// ทำให้พื้นหลังเลื่อนลงตอน scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.bg-shapes');
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});


// --- ส่วนนี้สำหรับเอฟเฟกต์ Ripple เมื่อคลิกบนองค์ประกอบ .glass ---

document.querySelectorAll('.glass').forEach(element => {
    element.addEventListener('click', function(e) {
        // ป้องกันไม่ให้ ripple เกิดบน link ที่กำลังจะเปลี่ยนหน้า หรือปุ่ม submit
        if (e.target.tagName === 'A' || e.target.closest('a') || e.target.type === 'submit') {
            return;
        }

        const ripple = document.createElement('div');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: 1000;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// เพิ่ม Keyframes ของ animation ripple เข้าไปใน style
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


// --- ส่วนนี้สำหรับจัดการฟอร์มในหน้า Contact ---
// เราจะตรวจสอบก่อนว่าในหน้านั้นมีฟอร์มอยู่หรือไม่ เพื่อไม่ให้เกิด error ในหน้าอื่น

const contactForm = document.querySelector('form');

if (contactForm) {
    // เพิ่ม Keyframes ของ animation fadeIn สำหรับข้อความแจ้งเตือน
    const fadeStyle = document.createElement('style');
    fadeStyle.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(fadeStyle);

    // จัดการเมื่อมีการกดส่งฟอร์ม
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // ป้องกันไม่ให้หน้าเว็บโหลดใหม่

        // สร้างข้อความแจ้งว่าส่งสำเร็จ
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(46, 204, 113, 0.95);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            z-index: 10000;
            animation: fadeIn 0.4s ease-out;
            text-align: center;
        `;
        successMsg.textContent = 'ส่งข้อความเรียบร้อยแล้วครับ!';

        document.body.appendChild(successMsg);

        // ลบข้อความออกหลังจาก 3 วินาที
        setTimeout(() => {
            successMsg.remove();
        }, 3000);

        // ล้างข้อมูลในฟอร์ม
        this.reset();
    });
}