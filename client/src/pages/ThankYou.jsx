import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import API_BASE_URL from '../config';
import Logo from '../components/Logo';
import { 
    Music, Wand2, Cake, Heart, Utensils, RotateCcw, 
    Send, Share2, Link as LinkIcon, Sparkles,
    Smile, PartyPopper, MessageCircle, 
    ArrowLeft, ShieldCheck, Flame
} from 'lucide-react';
import './ThankYou.css';

export default function ThankYou() {
    // State for Reactions & Wishes
    const [reactions, setReactions] = useState({
        love: 142,
        cake: 98,
        cheers: 120,
        fire: 86,
        crown: 74
    });
    const [wishes, setWishes] = useState([]);
    const [wishName, setWishName] = useState('');
    const [wishMsg, setWishMsg] = useState('');
    const [isSubmittingWish, setIsSubmittingWish] = useState(false);

    // Cartoon Mascot & Cake Ceremony States
    // Stages: 'entering' | 'blowing' | 'slicing' | 'celebrating'
    const [mascotStage, setMascotStage] = useState('entering');
    const [candleBlown, setCandleBlown] = useState(false);
    const [cakeCut, setCakeCut] = useState(false);
    const [smokeActive, setSmokeActive] = useState(false);
    const [showPatakaBanner, setShowPatakaBanner] = useState(false);
    const [patakaSparks, setPatakaSparks] = useState([]);
    const [cakeStatus, setCakeStatus] = useState("🎉 Welcome! Cartoon mascot is preparing the cake ceremony...");
    
    // Reveal State: Hero section revealed ONLY AFTER cake is cut!
    const [isRevealed, setIsRevealed] = useState(false);

    // Audio & Toast State (BGM ON by default)
    const [isBgmPlaying, setIsBgmPlaying] = useState(true);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [burstEmojis, setBurstEmojis] = useState([]);

    // Stats Counter Animation
    const [statLove, setStatLove] = useState(0);
    const [statCalories, setStatCalories] = useState(0);
    const [statHappiness, setStatHappiness] = useState(0);

    // Refs
    const audioCtxRef = useRef(null);
    const bgmIntervalRef = useRef(null);
    const toastTimeoutRef = useRef(null);
    const sequenceTimersRef = useRef([]);

    // Web Audio Synthesizer Functions
    const getAudioContext = () => {
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    };

    const playTone = (freq, type = 'sine', duration = 0.25, gainVal = 0.15) => {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(gainVal, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {}
    };

    const playBlowSound = () => {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const bufferSize = ctx.sampleRate * 0.4;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(900, ctx.currentTime);
            filter.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start();
        } catch(e) {}
    };

    // Realistic Firecracker / Pataka Boom Explosion Sound
    const playFirecrackerBoom = () => {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            // 1. Deep Sub-Bass Thud (Boom)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.45);
            gain.gain.setValueAtTime(0.6, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.45);

            // 2. High-Frequency Sparkle Crackle Noise
            const bufferSize = ctx.sampleRate * 0.6;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1600, ctx.currentTime);
            filter.Q.setValueAtTime(2.0, ctx.currentTime);
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.4, ctx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start();

            // 3. Follow-up celebratory fanfare notes
            setTimeout(() => {
                [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
                    setTimeout(() => playTone(freq, 'triangle', 0.35, 0.22), idx * 75);
                });
            }, 120);
        } catch (e) {}
    };

    // Confetti Fireworks Burst
    const launchMultiFireworksConfetti = () => {
        if (typeof confetti !== 'function') return;

        // Center Explosion
        confetti({
            particleCount: 110,
            spread: 95,
            origin: { y: 0.55 },
            startVelocity: 50,
            zIndex: 99999,
            colors: ['#ff4500', '#ffd700', '#ff1493', '#8b5cf6', '#00e5ff']
        });

        // Left Cannon
        setTimeout(() => {
            confetti({
                particleCount: 65,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.65 },
                zIndex: 99999,
                colors: ['#f97316', '#ec4899', '#f59e0b']
            });
        }, 180);

        // Right Cannon
        setTimeout(() => {
            confetti({
                particleCount: 65,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.65 },
                zIndex: 99999,
                colors: ['#8b5cf6', '#3b82f6', '#10b981']
            });
        }, 320);
    };

    // Spawn Exploding Screen Sparks
    const triggerPatakaSparks = () => {
        const emojis = ['💥', '🎆', '🎇', '✨', '🍰', '🎊', '👑', '🔥', '🌟', '💥', '🎇', '✨'];
        const newSparks = emojis.map((emoji, idx) => {
            const angle = (idx / emojis.length) * 2 * Math.PI;
            const dist = 70 + Math.random() * 85;
            return {
                id: Date.now() + idx + Math.random(),
                emoji,
                tx: `${Math.cos(angle) * dist}px`,
                ty: `${Math.sin(angle) * dist}px`,
                left: '50%',
                top: '40%'
            };
        });
        setPatakaSparks(newSparks);
        setTimeout(() => setPatakaSparks([]), 1300);
    };

    // AUTOMATIC CARTOON MASCOT CELEBRATION TIMELINE
    const startCelebrationSequence = (resetReveal = false) => {
        // Clear previous timers if any
        sequenceTimersRef.current.forEach(clearTimeout);
        sequenceTimersRef.current = [];

        // Reset ceremony state
        if (resetReveal) setIsRevealed(false);
        setMascotStage('entering');
        setCandleBlown(false);
        setCakeCut(false);
        setSmokeActive(false);
        setShowPatakaBanner(false);
        setCakeStatus("👀 Mascot aa raha hai candle blow karne...");

        // T+800ms: Mascot approaches candle and puffs cheeks
        const t1 = setTimeout(() => {
            setMascotStage('blowing');
            setCakeStatus("🌬️ Cartoon Mascot candle blow kar raha hai...");
        }, 800);

        // T+1500ms: Candle extinguished with smoke & sound
        const t2 = setTimeout(() => {
            setCandleBlown(true);
            setSmokeActive(true);
            playBlowSound();
            if (typeof confetti === 'function') {
                confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 }, zIndex: 99999 });
            }
            setCakeStatus("✨ Candle blown! Ab cake cut hone jaa raha hai! 🔪");
        }, 1500);

        // T+2300ms: Mascot raises knife to slice cake
        const t3 = setTimeout(() => {
            setMascotStage('slicing');
            setCakeStatus("🔪 Cake cutting in action...");
        }, 2300);

        // T+2800ms: Cake cut + PATAKA BLAST + SWEET REVEAL OF HERO THANK YOU CARD!
        const t4 = setTimeout(() => {
            setCakeCut(true);
            setMascotStage('celebrating');
            setShowPatakaBanner(true);
            setIsRevealed(true); // REVEAL UPPER THANK YOU CARD & SHIFT CAKE DOWN!
            
            // Sounds & Confetti & Sparks
            playFirecrackerBoom();
            launchMultiFireworksConfetti();
            triggerPatakaSparks();

            setCakeStatus("🎉 WOOHOO! Ankit Chaudhary's Cake Cut & Pataka Blasted! 🍰💥🥳");
            triggerToast("💥 BOOM! Pataka Blasted & Thank You Note Unlocked! 🍰🎉");
        }, 2800);

        sequenceTimersRef.current = [t1, t2, t3, t4];
    };

    // Auto-play celebration sequence on mount
    useEffect(() => {
        let isMounted = true;
        fetch(`${API_BASE_URL}/api/thankyou`)
            .then(res => res.json())
            .then(data => {
                if (isMounted && data.success) {
                    if (data.reactions) setReactions(data.reactions);
                    if (data.wishes && data.wishes.length > 0) setWishes(data.wishes);
                }
            })
            .catch(() => {});

        // Start Party BGM by default
        startBgm();

        const handleFirstInteraction = () => {
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
            if (!bgmIntervalRef.current) {
                startBgm();
            }
        };
        window.addEventListener('click', handleFirstInteraction, { once: true });
        window.addEventListener('touchstart', handleFirstInteraction, { once: true });
        window.addEventListener('keydown', handleFirstInteraction, { once: true });

        // Start automated cartoon ceremony 500ms after load!
        const initialTimer = setTimeout(() => {
            startCelebrationSequence(true);
        }, 500);

        // Animate stats numbers
        let count = 0;
        const interval = setInterval(() => {
            count += 4;
            if (count <= 100) {
                setStatLove(count);
                setStatHappiness(count);
                setStatCalories(Math.floor((count / 100) * 999));
            } else {
                setStatLove(100);
                setStatHappiness(100);
                setStatCalories(999);
                clearInterval(interval);
            }
        }, 30);

        return () => {
            isMounted = false;
            clearTimeout(initialTimer);
            sequenceTimersRef.current.forEach(clearTimeout);
            clearInterval(interval);
            if (bgmIntervalRef.current) clearInterval(bgmIntervalRef.current);
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
        };
    }, []);

    // Show Toast Helper
    const triggerToast = (msg) => {
        setToastMessage(msg);
        setShowToast(true);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
            setShowToast(false);
        }, 2800);
    };

    const startBgm = () => {
        if (bgmIntervalRef.current) return;
        getAudioContext();
        setIsBgmPlaying(true);
        const melody = [
            { f: 523.25, d: 0.3 }, // C5
            { f: 587.33, d: 0.3 }, // D5
            { f: 659.25, d: 0.4 }, // E5
            { f: 783.99, d: 0.5 }, // G5
            { f: 880.00, d: 0.4 }, // A5
            { f: 1046.50, d: 0.6 } // C6
        ];
        let noteIdx = 0;
        bgmIntervalRef.current = setInterval(() => {
            const note = melody[noteIdx % melody.length];
            playTone(note.f, 'sine', note.d, 0.08);
            noteIdx++;
        }, 600);
    };

    const stopBgm = () => {
        setIsBgmPlaying(false);
        if (bgmIntervalRef.current) {
            clearInterval(bgmIntervalRef.current);
            bgmIntervalRef.current = null;
        }
    };

    const toggleBgm = () => {
        if (!isBgmPlaying) {
            startBgm();
            triggerToast("Party BGM: Playing 🎶");
        } else {
            stopBgm();
            triggerToast("BGM Paused 🔇");
        }
    };

    // Reaction click with floating emoji burst
    const handleReactionClick = (key, emoji, event) => {
        setReactions(prev => ({
            ...prev,
            [key]: (prev[key] || 0) + 1
        }));
        playTone(600 + Math.random() * 200, 'sine', 0.12, 0.1);

        // Send reaction to API
        fetch(`${API_BASE_URL}/api/thankyou/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reaction: key })
        }).catch(() => {});

        // Spawn 3 bursting floating emojis
        const rect = event.currentTarget.getBoundingClientRect();
        const posX = rect.left + rect.width / 2;
        const posY = rect.top + rect.height / 2;

        const newBursts = [1, 2, 3].map((_, i) => ({
            id: Date.now() + i + Math.random(),
            emoji,
            x: posX,
            y: posY,
            randX: (Math.random() - 0.5) * 120,
            randY: (Math.random() - 0.5) * 60
        }));

        setBurstEmojis(prev => [...prev, ...newBursts]);
        setTimeout(() => {
            setBurstEmojis(prev => prev.filter(b => !newBursts.find(nb => nb.id === b.id)));
        }, 1200);
    };

    // Submit Wish to Wall
    const handlePostWish = async (e) => {
        if (e) e.preventDefault();
        const name = wishName.trim() || 'Dost';
        const msg = wishMsg.trim();
        if (!msg) {
            triggerToast("Ankit bhai ke liye koi wish likho! ✍️");
            return;
        }

        setIsSubmittingWish(true);
        const newWishItem = {
            id: 'local_' + Date.now(),
            name,
            message: msg,
            avatar: ['🎉', '✨', '👑', '🎂', '💖', '🌟'][Math.floor(Math.random() * 6)]
        };

        // Optimistic UI update
        setWishes(prev => [newWishItem, ...prev]);
        setWishName('');
        setWishMsg('');
        playFirecrackerBoom();
        triggerToast("Wish posted to Ankit's wall! 🎉");

        try {
            const res = await fetch(`${API_BASE_URL}/api/thankyou/wish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, message: msg })
            });
            const data = await res.json();
            if (data.success && data.wish) {
                setWishes(prev => [data.wish, ...prev.filter(w => w.id !== newWishItem.id)]);
            }
        } catch (err) {} finally {
            setIsSubmittingWish(false);
        }
    };

    // Share link handlers
    const handleShareLink = () => {
        const shareUrl = window.location.href;
        navigator.clipboard.writeText(shareUrl).then(() => {
            triggerToast("Link Copied! 🔗");
        }).catch(() => {
            triggerToast("Share: " + shareUrl);
        });
    };

    const handleNativeShare = () => {
        const shareUrl = window.location.href;
        const shareText = `🎉 Hey guys! Aaj Ankit Chaudhary ka Birthday hai! Sabhi pyare wishes aur blessings ke liye Ankit ne ye special celebration portal banaya hai. Check out karo & virtual cake cut karo! 🎂✨`;

        if (navigator.share) {
            navigator.share({
                title: 'Ankit Chaudhary Birthday Special 🎉',
                text: shareText,
                url: shareUrl
            }).catch(() => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
            });
        } else {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
        }
    };

    return (
        <div className="thankyou-page-container">
            {/* Background Animated Canvas & Glow Orbs */}
            <div className="thankyou-bg-mesh">
                <div className="thankyou-glow-orb thankyou-orb-1"></div>
                <div className="thankyou-glow-orb thankyou-orb-2"></div>
                <div className="thankyou-glow-orb thankyou-orb-3"></div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="thankyou-floating-container">
                {['🎈', '✨', '🎉', '💖', '🎂', '🥳', '🌟', '🥂', '🍰', '🎈', '✨', '🎉', '💖', '🎂'].map((emoji, idx) => (
                    <div 
                        key={idx} 
                        className="thankyou-floating-item"
                        style={{
                            left: `${(idx * 7.2) % 92}%`,
                            animationDuration: `${8 + (idx % 5) * 2}s`,
                            animationDelay: `${(idx * 0.7) % 5}s`,
                            fontSize: `${1.1 + (idx % 4) * 0.3}rem`
                        }}
                    >
                        {emoji}
                    </div>
                ))}
            </div>

            {/* Bursting Click Emojis */}
            {burstEmojis.map(burst => (
                <div 
                    key={burst.id}
                    className="thankyou-burst-emoji"
                    style={{
                        left: `${burst.x}px`,
                        top: `${burst.y}px`,
                        '--rand-x': burst.randX,
                        '--rand-y': burst.randY
                    }}
                >
                    {burst.emoji}
                </div>
            ))}

            {/* Main Application Wrapper */}
            <div className="thankyou-app-wrapper">
                
                {/* Official CS Corp Mobile App Bar */}
                <header className="thankyou-mobile-app-bar">
                    <div className="thankyou-brand-group">
                        <Link to="/" className="thankyou-home-pill" title="Back to CS Corp Home">
                            <ArrowLeft size={14} />
                            <span>CS Corp</span>
                        </Link>
                        <Logo variant="thanks" className="thankyou-navbar-logo" />
                    </div>
                    <div className="thankyou-app-bar-actions">
                        <button 
                            onClick={toggleBgm} 
                            className={`thankyou-icon-toggle-btn ${isBgmPlaying ? 'playing' : ''}`} 
                            title={isBgmPlaying ? "Mute BGM" : "Play Party Music"} 
                            aria-label="Toggle Music"
                        >
                            <Music size={18} />
                        </button>
                        <button 
                            onClick={() => {
                                playFirecrackerBoom();
                                launchMultiFireworksConfetti();
                                triggerToast("🎊 Pataka Blasted!");
                            }} 
                            className="thankyou-glow-pill-btn" 
                            title="Blast Confetti & Pataka!"
                        >
                            <Wand2 size={16} />
                            <span>Party 💥</span>
                        </button>
                    </div>
                </header>

                {/* =========================================================
                    1. HERO THANK YOU CARD (SWEET REVEAL UPON CAKE CUT!)
                   ========================================================= */}
                {isRevealed && (
                    <section className="thankyou-hero-card thankyou-glass-card sweet-bloom-enter">
                        {/* Ankit Crown Halo Avatar */}
                        <div className="thankyou-avatar-ring">
                            <div className="thankyou-avatar-halo"></div>
                            <div className="thankyou-avatar-badge">
                                <span className="thankyou-avatar-crown">👑</span>
                                <span className="thankyou-avatar-initials">AC</span>
                            </div>
                            <div className="thankyou-sparkle thankyou-s-left">✨</div>
                            <div className="thankyou-sparkle thankyou-s-right">🎉</div>
                        </div>

                        <div className="thankyou-tag">
                            <Cake size={14} /> OFFICIAL BIRTHDAY THANKS • ANKIT CHAUDHARY
                        </div>

                        <h1 className="thankyou-hero-title">
                            <span className="thankyou-name-highlight">Ankit Chaudhary Ki Taraf Se</span>
                            <span className="thankyou-gradient-text">Dil Se Thank You!</span> ❤️
                        </h1>

                        <p className="thankyou-hero-subtitle">
                            Aap sabke messages, phone calls, warm blessings aur stickers ne mere is birthday ko bohot yaadgar bana diya! ✨
                        </p>

                        <div className="thankyou-hero-host">
                            <Sparkles size={14} /> Celebrant: Ankit Chaudhary (Founder @ CS Corp)
                        </div>

                        {/* Quick Jump Pills */}
                        <div className="thankyou-quick-pills">
                            <a href="#cake-section" className="thankyou-pill-chip">
                                <Utensils size={14} /> Cut Cake Again
                            </a>
                            <a href="#reaction-wall" className="thankyou-pill-chip">
                                <Heart size={14} /> Shower Love & Wish
                            </a>
                            <a href="#share-section" className="thankyou-pill-chip">
                                <Share2 size={14} /> Share Page
                            </a>
                        </div>
                    </section>
                )}

                {/* =========================================================
                    2. CAKE CEREMONY WITH CARTOON MASCOT (MOVES BELOW HERO!)
                   ========================================================= */}
                <section id="cake-section" className={`thankyou-cake-section thankyou-glass-card ${!isRevealed ? 'spotlight-mode' : ''}`}>
                    
                    {/* Floating Pataka Banner */}
                    <div className={`pataka-blast-banner ${showPatakaBanner ? 'active' : ''}`}>
                        💥🎆 PATAKA BLAST! HAPPY BIRTHDAY ANKIT! 🍰🎉
                    </div>

                    <div className="thankyou-section-tag">
                        <Sparkles size={14} /> {!isRevealed ? 'OPENING CEREMONY 🎂' : 'CELEBRATION STAGE'}
                    </div>
                    <h2 className="thankyou-section-title">
                        {!isRevealed ? "Ankit's Birthday Cake Ceremony 🎂" : "Cake & Mascot Stage 🍰"}
                    </h2>
                    <p className="thankyou-section-desc">
                        {!isRevealed 
                            ? "Mascot candle bujhayega aur cake cut karega, tab Thank You message unlock hoga!"
                            : "Cartoon mascot ne candle blow karke cake cut kiya aur pataka blast hua!"}
                    </p>

                    <div className="thankyou-cake-stage">
                        
                        {/* ANIMATED CARTOON MASCOT CHARACTER */}
                        <div 
                            className={`cartoon-mascot mascot-${mascotStage}`}
                            onClick={() => startCelebrationSequence(false)}
                            title="Click Mascot to replay celebration!"
                        >
                            <div className="mascot-body-wrapper">
                                <div className="mascot-party-hat">🥳</div>
                                <div className="mascot-face">
                                    <div className="mascot-eyes">
                                        {mascotStage === 'blowing' ? '👀' : mascotStage === 'celebrating' ? '🤩' : '😊'}
                                    </div>
                                    <div className="mascot-mouth">
                                        {mascotStage === 'blowing' ? '😮' : mascotStage === 'celebrating' ? '😄' : '😋'}
                                    </div>
                                </div>
                                <div className="mascot-wind-gust">🌬️💨</div>
                                <div className="mascot-knife-hand">🔪</div>
                            </div>
                            <span className="mascot-label">
                                {mascotStage === 'blowing' ? 'Blowing Candle... 🌬️' :
                                 mascotStage === 'slicing' ? 'Cutting Cake... 🔪' :
                                 mascotStage === 'celebrating' ? 'YAY! Cake Cut! 🍰🎉' :
                                 'Party Mascot 🥳'}
                            </span>
                        </div>

                        {/* Pataka Sparks Explosion Particles */}
                        {patakaSparks.length > 0 && (
                            <div className="pataka-sparks-container">
                                {patakaSparks.map(spark => (
                                    <div 
                                        key={spark.id}
                                        className="pataka-spark"
                                        style={{
                                            left: spark.left,
                                            top: spark.top,
                                            '--tx': spark.tx,
                                            '--ty': spark.ty
                                        }}
                                    >
                                        {spark.emoji}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 3D CSS Interactive Cake */}
                        <div 
                            className="thankyou-cake-wrapper" 
                            onClick={() => startCelebrationSequence(false)}
                        >
                            {/* Candle */}
                            <div className="thankyou-candle">
                                <div className={`thankyou-flame ${candleBlown ? 'extinguished' : ''}`}></div>
                                <div className={`candle-smoke-puff ${smokeActive ? 'active' : ''}`}>💨</div>
                            </div>
                            
                            {/* Cake Layers */}
                            <div className="thankyou-cake-layer thankyou-layer-top">
                                <div className="thankyou-strawberry">🍓</div>
                                <div className="thankyou-strawberry">🍓</div>
                                <div className="thankyou-strawberry">🍓</div>
                                <div className="thankyou-cream-drip"></div>
                            </div>
                            
                            <div className="thankyou-cake-layer thankyou-layer-middle"></div>
                            
                            <div className="thankyou-cake-layer thankyou-layer-bottom">
                                <span className="thankyou-cake-text">THANK YOU ANKIT ❤️</span>
                            </div>

                            {/* Cut Slice Effect */}
                            <div className={`thankyou-cake-slice-cut ${cakeCut ? 'active' : ''}`}>
                                <span>🍰</span>
                            </div>

                            <div className="thankyou-cake-plate"></div>
                        </div>
                    </div>

                    {/* Cake Interaction Controls */}
                    <div className="thankyou-cake-controls">
                        <button onClick={() => startCelebrationSequence(false)} className="thankyou-tap-btn primary-glow">
                            <RotateCcw size={16} /> Re-Play Cake & Pataka Blast 💥
                        </button>
                        <button 
                            onClick={() => {
                                playFirecrackerBoom();
                                launchMultiFireworksConfetti();
                                triggerToast("💥 Pataka Burst!");
                            }} 
                            className="thankyou-tap-btn"
                        >
                            <Sparkles size={16} /> Firecracker Blast 🎆
                        </button>
                    </div>
                    
                    <div className="thankyou-cake-status">
                        {cakeStatus}
                    </div>
                </section>

                {/* =========================================================
                    3. PARTY STATS & WISH WALL (REVEALED TOGETHER!)
                   ========================================================= */}
                {isRevealed && (
                    <>
                        {/* Mobile Party Stats Grid */}
                        <section className="thankyou-stats-section">
                            <div className="thankyou-stats-grid">
                                <div className="thankyou-stat-card thankyou-glass-card">
                                    <div className="thankyou-stat-icon stat-love"><Heart size={20} /></div>
                                    <div className="thankyou-stat-info">
                                        <h3>{statLove}%</h3>
                                        <p>Love & Good Vibes</p>
                                    </div>
                                </div>

                                <div className="thankyou-stat-card thankyou-glass-card">
                                    <div className="thankyou-stat-icon stat-cake"><Cake size={20} /></div>
                                    <div className="thankyou-stat-info">
                                        <h3>{statCalories}+</h3>
                                        <p>Sweet Calories</p>
                                    </div>
                                </div>

                                <div className="thankyou-stat-card thankyou-glass-card">
                                    <div className="thankyou-stat-icon stat-smile"><Smile size={20} /></div>
                                    <div className="thankyou-stat-info">
                                        <h3>Level {statHappiness}</h3>
                                        <p>Happiness Meter</p>
                                    </div>
                                </div>

                                <div className="thankyou-stat-card thankyou-glass-card">
                                    <div className="thankyou-stat-icon stat-party"><PartyPopper size={20} /></div>
                                    <div className="thankyou-stat-info">
                                        <h3>Party Mode</h3>
                                        <p>Active 🍻</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Tap Reaction Wall & Wish Board */}
                        <section id="reaction-wall" className="thankyou-glass-card">
                            <div className="thankyou-section-tag">
                                <Heart size={14} /> TAP FOR VIBES
                            </div>
                            <h2 className="thankyou-section-title">Shower Love on Ankit ❤️</h2>
                            <p className="thankyou-section-desc">Tap your favorite reaction to flood the screen!</p>

                            <div className="thankyou-reactions-container">
                                <button 
                                    onClick={(e) => handleReactionClick('love', '❤️', e)} 
                                    className="thankyou-reaction-bubble"
                                >
                                    <span className="thankyou-reaction-emoji">❤️</span>
                                    <span className="thankyou-reaction-title">Love</span>
                                    <span className="thankyou-reaction-count">{reactions.love}</span>
                                </button>

                                <button 
                                    onClick={(e) => handleReactionClick('cake', '🎂', e)} 
                                    className="thankyou-reaction-bubble"
                                >
                                    <span className="thankyou-reaction-emoji">🎂</span>
                                    <span className="thankyou-reaction-title">Cake</span>
                                    <span className="thankyou-reaction-count">{reactions.cake}</span>
                                </button>

                                <button 
                                    onClick={(e) => handleReactionClick('cheers', '🍻', e)} 
                                    className="thankyou-reaction-bubble"
                                >
                                    <span className="thankyou-reaction-emoji">🍻</span>
                                    <span className="thankyou-reaction-title">Cheers</span>
                                    <span className="thankyou-reaction-count">{reactions.cheers}</span>
                                </button>

                                <button 
                                    onClick={(e) => handleReactionClick('fire', '🔥', e)} 
                                    className="thankyou-reaction-bubble"
                                >
                                    <span className="thankyou-reaction-emoji">🔥</span>
                                    <span className="thankyou-reaction-title">Banger</span>
                                    <span className="thankyou-reaction-count">{reactions.fire}</span>
                                </button>

                                <button 
                                    onClick={(e) => handleReactionClick('crown', '👑', e)} 
                                    className="thankyou-reaction-bubble"
                                >
                                    <span className="thankyou-reaction-emoji">👑</span>
                                    <span className="thankyou-reaction-title">Star</span>
                                    <span className="thankyou-reaction-count">{reactions.crown}</span>
                                </button>
                            </div>

                            {/* Virtual Wish Wall Input */}
                            <div className="thankyou-toast-board">
                                <h3 className="thankyou-toast-heading">
                                    <MessageCircle size={16} /> Wish Board for Ankit Chaudhary
                                </h3>
                                <form onSubmit={handlePostWish} className="thankyou-wall-input-bar">
                                    <input 
                                        type="text" 
                                        value={wishName}
                                        onChange={(e) => setWishName(e.target.value)}
                                        placeholder="Aapka Naam" 
                                        maxLength={25}
                                        className="thankyou-wall-input-name"
                                    />
                                    <input 
                                        type="text" 
                                        value={wishMsg}
                                        onChange={(e) => setWishMsg(e.target.value)}
                                        placeholder="Ankit bhai ke liye pyara sa wish likho..." 
                                        maxLength={100}
                                        className="thankyou-wall-input-msg"
                                        required
                                    />
                                    <button type="submit" disabled={isSubmittingWish} className="thankyou-wall-btn">
                                        <Send size={16} />
                                    </button>
                                </form>

                                <div className="thankyou-wishes-feed">
                                    {wishes && wishes.length > 0 ? (
                                        wishes.map((wish, index) => (
                                            <div key={wish._id || wish.id || index} className="thankyou-wish-item">
                                                <div className="thankyou-wish-avatar">{wish.avatar || '🎉'}</div>
                                                <div className="thankyou-wish-content">
                                                    <strong>{wish.name}:</strong>
                                                    <p>{wish.message}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="thankyou-wishes-empty">
                                            <div className="thankyou-wishes-empty-icon">💌</div>
                                            <p className="thankyou-wishes-empty-text">Abhi tak koi wish submit nahi hui hai.</p>
                                            <span className="thankyou-wishes-empty-sub">Upar form se Ankit Chaudhary ke liye pehla pyara message bhejein! ✨</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Share Page Section */}
                        <section id="share-section" className="thankyou-share-section">
                            <div className="thankyou-share-card thankyou-glass-card">
                                <h2>Share Ankit's Celebration Page 🚀</h2>
                                <p>Is interactive celebration page ka link apne sabhi dosto aur groups ke sath share karein!</p>
                                <div className="thankyou-action-buttons">
                                    <button onClick={handleShareLink} className="thankyou-m-btn thankyou-copy-btn">
                                        <LinkIcon size={16} /> Copy Link
                                    </button>
                                    <button onClick={handleNativeShare} className="thankyou-m-btn thankyou-wa-btn">
                                        <Share2 size={16} /> Share on WhatsApp
                                    </button>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* CS Corp Official Footer */}
                <footer className="thankyou-footer">
                    <div className="thankyou-cs-badge">
                        <ShieldCheck size={16} />
                        <span>Chaudhary & Sons (CS Corp)</span>
                    </div>
                    <p>Made with ❤️ & Birthday Smiles by Ankit Chaudhary</p>
                    <div className="thankyou-footer-links">
                        <Link to="/ankit-chaudhary">Ankit's Portfolio</Link>
                        <span>•</span>
                        <Link to="/">CS Corp Home</Link>
                        <span>•</span>
                        <Link to="/articles">Articles</Link>
                    </div>
                    <span className="thankyou-footer-small">© {new Date().getFullYear()} CS Corp • All rights reserved</span>
                </footer>
            </div>

            {/* Sticky Mobile Floating Bottom Action Bar */}
            <nav className="thankyou-sticky-bottom-bar">
                <a href="#cake-section" className="thankyou-sticky-nav-item">
                    <Cake size={18} />
                    <span>Cake</span>
                </a>
                <button 
                    onClick={() => {
                        playFirecrackerBoom();
                        launchMultiFireworksConfetti();
                        triggerToast("Party Mode ON! 🥳🎉");
                    }} 
                    className="thankyou-sticky-nav-item center-highlight"
                >
                    <Sparkles size={20} />
                    <span>Blast</span>
                </button>
                <a href="#reaction-wall" className="thankyou-sticky-nav-item">
                    <Heart size={18} />
                    <span>Wishes</span>
                </a>
                <button onClick={handleNativeShare} className="thankyou-sticky-nav-item">
                    <Share2 size={18} />
                    <span>Share</span>
                </button>
            </nav>

            {/* Toast Notification Popup */}
            <div className={`thankyou-toast ${showToast ? 'show' : ''}`}>
                {toastMessage || "Message copied to clipboard! 📋"}
            </div>
        </div>
    );
}
