// === START: Interactive Robot & Guide Script (Final Corrected Version) ===

document.addEventListener('DOMContentLoaded', () => {

    // --- ส่วนที่ 1: จัดการ Animation การเปลี่ยนหน้า ---
    const navLinks = document.querySelectorAll('.nav-links a:not([target="_blank"]), a.cta-button');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const destination = this.href;
            if (!destination || destination === window.location.href || destination.endsWith('#')) {
                return;
            }
            e.preventDefault();
            
            if (document.body.classList.contains('is-index-page')) {
                 document.body.classList.add('fade-out');
            } else {
                 document.body.style.transition = 'opacity 0.5s ease-out';
                 document.body.style.opacity = 0;
            }

            setTimeout(() => {
                window.location.href = destination;
            }, 1000); // 1 วินาทีสำหรับ Animation
        });
    });

    // --- ส่วนที่ 2: สคริปต์สำหรับหุ่นยนต์ตัวเต็ม (เฉพาะหน้าแรก) ---
    const fullRobotContainer = document.getElementById('robot-clickable-area');
    if (fullRobotContainer) {
        document.body.classList.add('is-index-page');
        
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

        const randomResponses = ["มีอะไรเหรอครับ?", "มีอะไรให้ผมช่วยหรือเปล่า?", "เรียกผมเหรอครับ?","ว่าไงครับ"];
        const teaseResponses = ["ฮั่นแน่! สนใจผมล่ะสิ","ชอบผมขนาดนั้นเลยเหรอครับ","พอแล้วครับ เดี๋ยวผมเขินนะ","ถ้าอยากคุยกันจริงจัง ไปที่หน้า Contact ได้เลยนะ"];

        document.addEventListener('mousemove', (e) => {
            const svgRect = svg.getBoundingClientRect();
            const mouse = { x: (e.clientX - svgRect.left) / svgRect.width * 200, y: (e.clientY - svgRect.top) / svgRect.height * 200 };
            const leftDelta = { x: mouse.x - leftEyeCenter.x, y: mouse.y - leftEyeCenter.y };
            const leftAngle = Math.atan2(leftDelta.y, leftDelta.x);
            leftPupil.setAttribute('cx', leftEyeCenter.x + Math.cos(leftAngle) * pupilMaxOffset);
            leftPupil.setAttribute('cy', leftEyeCenter.y + Math.sin(leftAngle) * pupilMaxOffset);
            const rightDelta = { x: mouse.x - rightEyeCenter.x, y: mouse.y - rightEyeCenter.y };
            const rightAngle = Math.atan2(rightDelta.y, rightDelta.x);
            rightPupil.setAttribute('cx', rightEyeCenter.x + Math.cos(rightAngle) * pupilMaxOffset);
            rightPupil.setAttribute('cy', rightEyeCenter.y + Math.sin(rightAngle) * pupilMaxOffset);
        });

        function robotSpeak(text, bubbleElement, mouthClosedElement, mouthOpenElement) {
            if (isSpeaking || !('speechSynthesis' in window)) return;
            isSpeaking = true;
            bubbleElement.textContent = text;
            bubbleElement.classList.add('show');
            clearTimeout(chatTimeout);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'th-TH';
            const voices = window.speechSynthesis.getVoices().filter(v => v.lang === 'th-TH');
            if (voices.length > 0) utterance.voice = voices.length > 1 && Math.random() > 0.5 ? voices[1] : voices[0];
            utterance.pitch = 1.1;
            utterance.rate = 1.1;
            let mouthAnimationInterval;
            utterance.onstart = () => {
                mouthAnimationInterval = setInterval(() => {
                    mouthClosedElement.style.visibility = 'hidden';
                    mouthOpenElement.style.visibility = 'visible';
                    setTimeout(() => {
                        mouthClosedElement.style.visibility = 'visible';
                        mouthOpenElement.style.visibility = 'hidden';
                    }, 150);
                }, 300);
            };
            utterance.onend = () => {
                clearInterval(mouthAnimationInterval);
                mouthClosedElement.style.visibility = 'visible';
                mouthOpenElement.style.visibility = 'hidden';
                isSpeaking = false;
                chatTimeout = setTimeout(() => bubbleElement.classList.remove('show'), 2500);
            };
            window.speechSynthesis.speak(utterance);
        }
        window.speechSynthesis.onvoiceschanged = () => {};

        fullRobotContainer.addEventListener('click', () => {
            clickCount++;
            let response = "";
            if (clickCount <= 3) {
                response = randomResponses[Math.floor(Math.random() * randomResponses.length)];
            } else {
                response = teaseResponses[(clickCount - 4) % teaseResponses.length];
            }
            robotSpeak(response, chatBubble, mouthClosed, mouthOpen);
        });

        setTimeout(() => robotSpeak("สวัสดีครับ ผมคือ AI ผู้ดูแลเรซูเม่ของไมค์", chatBubble, mouthClosed, mouthOpen), 1500);
    }

    // --- ส่วนที่ 3: สคริปต์สำหรับไกด์นำทาง (ทุกหน้าที่ไม่ใช่หน้าแรก) ---
    const guideContainer = document.getElementById('robot-guide');
    if (guideContainer) {
        const guideSvg = document.getElementById('robot-guide-svg');
        const guideLeftPupil = document.getElementById('left-pupil-guide');
        const guideRightPupil = document.getElementById('right-pupil-guide');
        const guideMouthClosed = document.getElementById('mouth-closed-guide');
        const guideMouthOpen = document.getElementById('mouth-open-guide');
        const guideChatBubble = document.getElementById('robot-chat-bubble-guide');
        
        const leftEyeCenterGuide = { x: 85, y: 55 };
        const rightEyeCenterGuide = { x: 115, y: 55 };
        const pupilMaxOffsetGuide = 6;

        let isGuideSpeaking = false;
        let guideChatTimeout;
        
        const pageGreetings = {
            "projects.html": "หน้านี้คือโปรเจคที่ไมค์ภูมิใจเสนอครับ",
            "skills.html": "มาดูทักษะและความสามารถของไมค์กันครับ",
            "contact.html": "สนใจร่วมงานกับไมค์ใช่ไหม? ติดต่อได้เลยครับ"
        };
        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        
        document.addEventListener('mousemove', (e) => {
             const svgRect = guideSvg.getBoundingClientRect();
             const mouse = { x: (e.clientX - svgRect.left) / svgRect.width * 200, y: (e.clientY - svgRect.top) / svgRect.height * 200 };
             const leftDelta = { x: mouse.x - leftEyeCenterGuide.x, y: mouse.y - leftEyeCenterGuide.y };
             const leftAngle = Math.atan2(leftDelta.y, leftDelta.x);
             guideLeftPupil.setAttribute('cx', leftEyeCenterGuide.x + Math.cos(leftAngle) * pupilMaxOffsetGuide);
             guideLeftPupil.setAttribute('cy', leftEyeCenterGuide.y + Math.sin(leftAngle) * pupilMaxOffsetGuide);
             const rightDelta = { x: mouse.x - rightEyeCenterGuide.x, y: mouse.y - rightEyeCenterGuide.y };
             const rightAngle = Math.atan2(rightDelta.y, rightDelta.x);
             guideRightPupil.setAttribute('cx', rightEyeCenterGuide.x + Math.cos(rightAngle) * pupilMaxOffsetGuide);
             guideRightPupil.setAttribute('cy', rightEyeCenterGuide.y + Math.sin(rightAngle) * pupilMaxOffsetGuide);
        });

        function guideSpeak(text) {
             if (isGuideSpeaking || !('speechSynthesis' in window)) return;
             isGuideSpeaking = true;
             guideChatBubble.textContent = text;
             guideChatBubble.classList.add('show');
             clearTimeout(guideChatTimeout);
             const utterance = new SpeechSynthesisUtterance(text);
             utterance.lang = 'th-TH';
             const voices = window.speechSynthesis.getVoices().filter(v => v.lang === 'th-TH');
             if (voices.length > 0) utterance.voice = voices.length > 1 && Math.random() > 0.5 ? voices[1] : voices[0];
             utterance.pitch = 1.2;
             utterance.rate = 1.1;
             let mouthAnimationInterval;
             utterance.onstart = () => {
                 mouthAnimationInterval = setInterval(() => {
                     guideMouthClosed.style.visibility = 'hidden';
                     guideMouthOpen.style.visibility = 'visible';
                     setTimeout(() => {
                         guideMouthClosed.style.visibility = 'visible';
                         guideMouthOpen.style.visibility = 'hidden';
                     }, 150);
                 }, 300);
             };
             utterance.onend = () => {
                 clearInterval(mouthAnimationInterval);
                 guideMouthClosed.style.visibility = 'visible';
                 guideMouthOpen.style.visibility = 'hidden';
                 isGuideSpeaking = false;
                 guideChatTimeout = setTimeout(() => guideChatBubble.classList.remove('show'), 3000);
             };
             window.speechSynthesis.speak(utterance);
        }
        window.speechSynthesis.onvoiceschanged = () => {};
        
        guideContainer.addEventListener('click', () => {
            guideSpeak(pageGreetings[currentPage] || "มีอะไรให้ช่วยไหมครับ?");
        });
        
        setTimeout(() => guideSpeak(pageGreetings[currentPage] || "ยินดีต้อนรับครับ"), 1500);
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