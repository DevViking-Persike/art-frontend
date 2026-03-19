export function startPocketWatchAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const size = 800;

    // Config
    const TICK_HZ = 5; // 5 ticks per second for a classic mechanical feel
    let startTime = Date.now();

    function draw() {
        const now = Date.now();
        // Force a seamless 60-second loop
        const loopDuration = 60000;
        let elapsedTotal = now - startTime;
        let elapsed = (elapsedTotal % loopDuration) / 1000; // 0.0 to 59.999...

        // 5 ticks per second
        const totalTicks = Math.floor(elapsed * TICK_HZ);
        const tickCycle = (elapsed * TICK_HZ) % 1; // 0.0 to 1.0 within a single tick
        
        // Micro-vibrations exactly on the "tick"
        // The energy is released abruptly in the first 10% of the tick
        const vibrationIntensity = Math.max(0, 1 - tickCycle * 15);
        const vibX = (Math.random() - 0.5) * vibrationIntensity * 1.5;
        const vibY = (Math.random() - 0.5) * vibrationIntensity * 1.5;

        // Base background to avoid transparency issues
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, size, size);

        ctx.save();
        ctx.translate(size / 2 + vibX, size / 2 + vibY);

        // 1. Outer Case
        drawOuterCase(ctx);

        // 2. The Internal Movement (Deep skeleton)
        drawMovement(ctx, elapsed, totalTicks, tickCycle);

        // 3. Dial Ring
        drawDialRing(ctx);

        // 4. Hands
        drawHands(ctx, elapsed, totalTicks);

        // 5. Glass Reflection
        drawGlass(ctx);

        ctx.restore();
        requestAnimationFrame(draw);
    }

    function drawOuterCase(ctx) {
        // Crown and Bow
        ctx.save();
        ctx.translate(0, -360);
        
        // Crown Body
        const crownG = ctx.createLinearGradient(-35, 0, 35, 0);
        crownG.addColorStop(0, '#795548');
        crownG.addColorStop(0.2, '#d7ccc8');
        crownG.addColorStop(0.5, '#ffd54f'); // Gold gleam
        crownG.addColorStop(0.8, '#a1887f');
        crownG.addColorStop(1, '#4e342e');
        
        ctx.fillStyle = crownG;
        ctx.beginPath();
        ctx.roundRect(-30, -30, 60, 40, 5);
        ctx.fill();
        
        // Crown Texture
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        for(let i = -24; i <= 24; i += 6) {
            ctx.beginPath(); ctx.moveTo(i, -30); ctx.lineTo(i, 10); ctx.stroke();
        }

        // Bow (Ring)
        ctx.strokeStyle = '#bcaaa4';
        ctx.lineWidth = 12;
        ctx.beginPath(); ctx.arc(0, -35, 35, 0, Math.PI, true); ctx.stroke();
        
        // Highlighting bow for metallic look
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, -35, 30, 0, Math.PI, true); ctx.stroke();
        
        ctx.restore();

        // Main Bezel
        const caseRadius = 370;
        const caseG = ctx.createRadialGradient(-100, -100, caseRadius * 0.5, 0, 0, caseRadius * 1.1);
        caseG.addColorStop(0, '#efebe9'); // Silver reflection
        caseG.addColorStop(0.3, '#8d6e63'); // Copper/bronze
        caseG.addColorStop(0.7, '#4e342e');
        caseG.addColorStop(1, '#212121');
        
        ctx.beginPath(); ctx.arc(0, 0, caseRadius, 0, Math.PI * 2);
        ctx.fillStyle = caseG; ctx.fill();

        // Inner bezel shadow
        ctx.beginPath(); ctx.arc(0, 0, 340, 0, Math.PI * 2);
        ctx.lineWidth = 4; ctx.strokeStyle = '#261914'; ctx.stroke();
        
        // Outer case screws
        drawScrewsOnRing(ctx, 355, 6, 6);
    }

    function drawMovement(ctx, elapsed, totalTicks, tickCycle) {
        ctx.save();
        ctx.beginPath(); ctx.arc(0, 0, 340, 0, Math.PI * 2); ctx.clip();

        // Base Plate
        ctx.fillStyle = '#1c1c1c';
        ctx.fill();
        
        // Decorative engraving on base plate
        ctx.strokeStyle = '#2b2b2b';
        ctx.lineWidth = 1;
        for (let i = 0; i < 40; i++) {
            ctx.beginPath(); ctx.arc(0, 0, i * 15, 0, Math.PI * 2); ctx.stroke();
        }

        // --- Deep Gears ---
        // Large slow gear (turns 1 cycle per 60s)
        drawGear(ctx, -80, -90, 140, (elapsed / 60) * Math.PI * 2, '#424242', 40, true);
        drawRubyPin(ctx, -80, -90);

        // Medium gear (turns faster)
        drawGear(ctx, 110, 80, 100, -(elapsed / 15) * Math.PI * 2, '#8d6e63', 24, true);
        drawRubyPin(ctx, 110, 80);

        // Central gear (seconds bridge)
        drawGear(ctx, 0, 0, 80, (elapsed / 60) * Math.PI * 6, '#bcaaa4', 20, false);
        drawRubyPin(ctx, 0, 0);

        // --- Escapement and Balance Assembly ---
        drawEscapementSystem(ctx, -120, 140, elapsed, totalTicks, tickCycle);

        // Bridge plate covering some gears
        drawBridge(ctx);

        ctx.restore();
    }

    function drawEscapementSystem(ctx, x, y, elapsed, totalTicks, tickCycle) {
        ctx.save();
        ctx.translate(x, y);

        // Escapement Wheel (Moves in discrete ticks)
        // 1 tick = 1 tooth advance
        const teeth = 15;
        // Smoothing the tick visually
        const smoothTick = totalTicks + Math.pow(tickCycle, 0.4); 
        
        ctx.save();
        ctx.translate(60, -60);
        const escapeRotation = (smoothTick / teeth) * Math.PI * 2;
        drawEscapementWheel(ctx, 0, 0, 50, escapeRotation, '#ffd54f', teeth);
        drawRubyPin(ctx, 0, 0);
        ctx.restore();

        // Pallet Fork (Oscillates back and forth every tick)
        ctx.save();
        ctx.translate(30, -30);
        const forkOsc = Math.sin(smoothTick * Math.PI) * 0.15;
        ctx.rotate(forkOsc - Math.PI / 4);
        
        // Draw fork
        ctx.fillStyle = '#cfd8dc';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(40, -15);
        ctx.lineTo(40, 15);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = '#546e7a'; ctx.stroke();
        
        // Pallet stones (rubies)
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(35, -18, 5, 8);
        ctx.fillRect(35, 10, 5, 8);
        drawRubyPin(ctx, 0, 0);
        ctx.restore();

        // Balance Wheel (oscillates back and forth)
        // Spring frequency is synced with ticks
        ctx.save();
        const balanceOsc = Math.cos(elapsed * TICK_HZ * Math.PI) * 1.5;
        ctx.rotate(balanceOsc);
        
        // Balance Rim
        ctx.strokeStyle = '#ffb300';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.stroke();
        
        // Balance Screws
        for(let j = 0; j < 12; j++) {
            const ba = (j / 12) * Math.PI * 2;
            const bx = Math.cos(ba) * 63;
            const by = Math.sin(ba) * 63;
            ctx.fillStyle = '#eceff1';
            ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill();
        }

        // Spokes
        ctx.beginPath();
        ctx.moveTo(-60, 0); ctx.lineTo(60, 0);
        ctx.moveTo(0, -60); ctx.lineTo(0, 60);
        ctx.stroke();

        // Hairspring (coiling and uncoiling)
        const springLayers = 5;
        ctx.strokeStyle = '#b0bec5';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2 * springLayers; a += 0.1) {
            // Expansion/contraction factor based on oscillation
            const r = 5 + (a / (Math.PI * 2)) * 8 + (balanceOsc * a * 0.1);
            const sx = Math.cos(a) * r;
            const sy = Math.sin(a) * r;
            if (a === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        drawRubyPin(ctx, 0, 0);
        
        ctx.restore();

        ctx.restore();
    }

    function drawEscapementWheel(ctx, x, y, radius, angle, color, teeth) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < teeth; i++) {
            const a = (i / teeth) * Math.PI * 2;
            // Club-tooth shape
            ctx.lineTo(Math.cos(a - 0.1) * (radius * 0.7), Math.sin(a - 0.1) * (radius * 0.7));
            ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
            ctx.lineTo(Math.cos(a + 0.1) * radius, Math.sin(a + 0.1) * radius);
            ctx.lineTo(Math.cos(a + 0.15) * (radius * 0.9), Math.sin(a + 0.15) * (radius * 0.9));
        }
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = '#5c4d1f'; ctx.stroke();

        // Inner cutout
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        
        // Spokes
        ctx.beginPath();
        for(let i = 0; i < 4; i++) {
            const sa = (i / 4) * Math.PI * 2;
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(sa) * radius * 0.7, Math.sin(sa) * radius * 0.7);
        }
        ctx.lineWidth = 4; ctx.stroke();
        
        ctx.restore();
    }

    function drawBridge(ctx) {
        ctx.save();
        // A decorative holding plate
        const g = ctx.createLinearGradient(-100, -100, 200, 200);
        g.addColorStop(0, '#757575');
        g.addColorStop(0.5, '#bdbdbd');
        g.addColorStop(1, '#424242');
        ctx.fillStyle = g;

        ctx.beginPath();
        ctx.moveTo(80, -140);
        ctx.bezierCurveTo(200, -120, 220, 40, 160, 140);
        ctx.lineTo(40, 180);
        ctx.bezierCurveTo(20, 60, -20, 60, -60, -60);
        ctx.closePath();
        
        // Drop shadow for the bridge
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = -5;
        ctx.shadowOffsetY = 10;
        ctx.fill();

        ctx.shadowColor = 'transparent'; // reset
        
        // Engraving line on bridge
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        drawTinyScrew(ctx, 120, -100, 6);
        drawTinyScrew(ctx, 160, 60, 6);
        drawTinyScrew(ctx, 80, 140, 6);
        
        // Ruby housing on bridge
        ctx.save();
        ctx.translate(110, 80);
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath(); ctx.arc(0,0, 15, 0, Math.PI*2); ctx.fill();
        drawRubyPin(ctx, 0, 0);
        drawTinyScrew(ctx, -10, -10, 3);
        drawTinyScrew(ctx, 10, 10, 3);
        ctx.restore();

        ctx.restore();
    }

    function drawGear(ctx, x, y, radius, angle, color, teeth, skeletize) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        const g = ctx.createRadialGradient(-radius*0.3, -radius*0.3, 0, 0, 0, radius);
        g.addColorStop(0, '#ffffffaa');
        g.addColorStop(0.3, color);
        g.addColorStop(1, '#000000dd');
        
        ctx.fillStyle = g;
        
        ctx.beginPath();
        const innerR = radius * 0.85;
        for (let i = 0; i < teeth; i++) {
            const a = (i / teeth) * Math.PI * 2;
            ctx.lineTo(Math.cos(a - 0.05) * innerR, Math.sin(a - 0.05) * innerR);
            ctx.lineTo(Math.cos(a - 0.02) * radius, Math.sin(a - 0.02) * radius);
            ctx.lineTo(Math.cos(a + 0.02) * radius, Math.sin(a + 0.02) * radius);
            ctx.lineTo(Math.cos(a + 0.05) * innerR, Math.sin(a + 0.05) * innerR);
        }
        ctx.closePath();
        
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        ctx.fill();
        ctx.shadowColor = 'transparent'; // reset

        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Skeletonization
        if (skeletize) {
            ctx.globalCompositeOperation = 'destination-out';
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * radius * 0.5, Math.sin(a) * radius * 0.5, radius * 0.25, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalCompositeOperation = 'source-over';
            
            // Inner rim details
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * radius * 0.5, Math.sin(a) * radius * 0.5, radius * 0.25, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }

    function drawDialRing(ctx) {
        ctx.save();
        
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 20;
        
        ctx.beginPath();
        ctx.arc(0, 0, 340, 0, Math.PI * 2);
        ctx.arc(0, 0, 220, 0, Math.PI * 2, true);
        
        const g = ctx.createRadialGradient(0, 0, 220, -50, -50, 340);
        g.addColorStop(0, '#fdfaf6');
        g.addColorStop(0.8, '#e6e0d4');
        g.addColorStop(1, '#c7bea9');
        ctx.fillStyle = g;
        ctx.fill();
        
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = '#b87333';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, 340, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 220, 0, Math.PI * 2); ctx.stroke();

        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 325, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 315, 0, Math.PI * 2); ctx.stroke();
        
        for (let i = 0; i < 60; i++) {
            const a = (i / 60) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 315, Math.sin(a) * 315);
            ctx.lineTo(Math.cos(a) * 325, Math.sin(a) * 325);
            ctx.stroke();
            
            if (i % 5 === 0) {
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * 308, Math.sin(a) * 308);
                ctx.lineTo(Math.cos(a) * 325, Math.sin(a) * 325);
                ctx.stroke();
                ctx.lineWidth = 2;
            }
        }

        const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
        ctx.fillStyle = '#212121';
        ctx.font = 'bold 38px "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i < 12; i++) {
            const a = (i * 30 - 90) * (Math.PI / 180);
            const x = Math.cos(a) * 275;
            const y = Math.sin(a) * 275;
            
            ctx.save();
            ctx.translate(x, y);
            
            let alignAngle = a + Math.PI / 2;
            if (i > 3 && i < 9) alignAngle += Math.PI;
            ctx.rotate(alignAngle);
            
            ctx.shadowColor = 'rgba(255,255,255,0.8)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            ctx.fillText(numerals[i], 0, 0);
            ctx.restore();
        }

        drawTinyScrew(ctx, -200, 0, 6);
        drawTinyScrew(ctx, 200, 0, 6);
        drawTinyScrew(ctx, 0, 200, 6);

        ctx.restore();
    }

    function drawHands(ctx, elapsed, totalTicks) {
        const time = new Date();
        const s = time.getSeconds() + time.getMilliseconds() / 1000;
        const m = time.getMinutes() + s / 60;
        const h = (time.getHours() % 12) + m / 60;

        const hourRot = h * (Math.PI * 2 / 12);
        const minRot = m * (Math.PI * 2 / 60);
        // Second hand strictly adheres to the engine's discrete ticks
        const secRot = (totalTicks / (60 * TICK_HZ)) * Math.PI * 2; 

        drawOrnateHand(ctx, hourRot, 140, 16, 'rgba(0,0,0,0.6)', true);
        drawOrnateHand(ctx, minRot, 210, 10, 'rgba(0,0,0,0.6)', true);
        drawSecondHand(ctx, secRot, 240, 'rgba(0,0,0,0.6)', true);

        const blueSteel = '#1a237e'; 
        
        drawOrnateHand(ctx, hourRot, 140, 16, blueSteel, false);
        drawOrnateHand(ctx, minRot, 210, 10, blueSteel, false);
        drawSecondHand(ctx, secRot, 240, '#bf360c', false);

        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#ffca28';
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#212121';
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = 'transparent';
    }

    function drawOrnateHand(ctx, angle, length, width, color, isShadow) {
        ctx.save();
        ctx.rotate(angle);
        if (isShadow) {
            ctx.shadowColor = "transparent";
            ctx.translate(6, 6);
        } else {
            ctx.shadowColor = 'transparent';
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        
        ctx.arc(0, 15, width * 0.8, Math.PI, 0);
        
        ctx.lineTo(width * 0.6, -length * 0.4);
        ctx.bezierCurveTo(width * 1.5, -length * 0.5, width * 2, -length * 0.7, 0, -length);
        ctx.bezierCurveTo(-width * 2, -length * 0.7, -width * 1.5, -length * 0.5, -width * 0.6, -length * 0.4);
        ctx.closePath();
        ctx.fill();
        
        if (!isShadow) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.moveTo(0, -length * 0.85);
            ctx.bezierCurveTo(width * 0.8, -length * 0.7, width * 0.4, -length * 0.45, 0, -length * 0.45);
            ctx.bezierCurveTo(-width * 0.4, -length * 0.45, -width * 0.8, -length * 0.7, 0, -length * 0.85);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawSecondHand(ctx, angle, length, color, isShadow) {
        ctx.save();
        ctx.rotate(angle);
        if (isShadow) ctx.translate(8, 8);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 40, 6, Math.PI, 0);
        ctx.lineTo(2, -length * 0.8);
        
        ctx.arc(0, -length * 0.85, 8, 0, Math.PI * 2);
        
        ctx.lineTo(-2, -length * 0.8);
        ctx.fill();
        
        if (!isShadow) {
            ctx.fillStyle = '#0a0a0a';
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath(); ctx.arc(0, -length * 0.85, 4, 0, Math.PI * 2); ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawScrewsOnRing(ctx, radius, count, screwRadius) {
        for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2;
            const x = Math.cos(a) * radius;
            const y = Math.sin(a) * radius;
            drawTinyScrew(ctx, x, y, screwRadius);
        }
    }

    function drawTinyScrew(ctx, x, y, r) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((x + y) * 0.05);

        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2); ctx.fill();

        const g = ctx.createLinearGradient(-r, -r, r, r);
        g.addColorStop(0, '#e0e0e0');
        g.addColorStop(1, '#616161');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#212121';
        ctx.fillRect(-r * 0.8, -r * 0.15, r * 1.6, r * 0.3);

        ctx.restore();
    }

    function drawRubyPin(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = '#ffca28';
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = '#c62828'; ctx.stroke();

        const rG = ctx.createRadialGradient(-2, -2, 0, 0, 0, 6);
        rG.addColorStop(0, '#ff8a80');
        rG.addColorStop(0.3, '#d50000');
        rG.addColorStop(1, '#3e2723');
        ctx.fillStyle = rG;
        ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath(); ctx.arc(-2, -2, 1.5, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }

    function drawGlass(ctx) {
        ctx.save();
        
        const g1 = ctx.createLinearGradient(-300, -300, 300, 300);
        g1.addColorStop(0, 'rgba(255,255,255,0.4)');
        g1.addColorStop(0.3, 'rgba(255,255,255,0)');
        g1.addColorStop(0.7, 'rgba(255,255,255,0)');
        g1.addColorStop(1, 'rgba(255,255,255,0.1)');
        
        ctx.beginPath(); ctx.arc(0, 0, 340, 0, Math.PI * 2);
        ctx.fillStyle = g1; ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 320, Math.PI, Math.PI * 1.5);
        ctx.lineTo(-200, -200);
        ctx.bezierCurveTo(-200, -300, -300, -200, -320, 0);
        
        const g2 = ctx.createRadialGradient(-150, -150, 0, -150, -150, 200);
        g2.addColorStop(0, 'rgba(200, 220, 255, 0.15)');
        g2.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g2;
        ctx.fill();

        ctx.restore();
    }

    draw();
}
