import { TASKS } from '../data';

export class HUD {
    private currentTaskIndex: number = 0;
    private taskTimer: number = 0;
    private taskProgress: number = 0;

    update(dt: number) {
        this.taskTimer += dt;
        if (this.taskTimer > 2.2) {
            this.taskTimer = 0;
            this.currentTaskIndex = (this.currentTaskIndex + 1) % TASKS.length;
        }
        this.taskProgress = this.taskTimer / 2.2;
    }

    draw(ctx: CanvasRenderingContext2D, cx: number, cy: number, width: number, height: number, scale: number, time: number) {
        this.drawTitle(ctx, cx, scale, time);
        this.drawTaskPanel(ctx, cx, width, height, scale);
        this.drawMetrics(ctx, width, scale, time);
    }

    private drawTitle(ctx: CanvasRenderingContext2D, cx: number, scale: number, time: number) {
        ctx.save();
        ctx.globalAlpha = 0.3 + (Math.sin(time * 0.8) + 1) / 2 * 0.2;
        ctx.fillStyle = '#00f2ff';
        ctx.font = `bold ${12 * scale}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.letterSpacing = `${8 * scale}px`;
        ctx.fillText('N E U R A L   C O R E', cx, 40 * scale);
        ctx.letterSpacing = '0px';

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#aaaaff';
        ctx.font = `${9 * scale}px "Courier New", monospace`;
        ctx.fillText(`ID: AETHER-UX  |  ITERATION: ${Math.floor(time * 10)}  |  STATE: SYNTHESIS`, cx, 60 * scale);
        ctx.restore();
    }

    private drawTaskPanel(ctx: CanvasRenderingContext2D, cx: number, width: number, height: number, scale: number) {
        const panelY = height - 100 * scale;
        const panelHeight = 65 * scale;
        const panelWidth = 400 * scale;
        const panelX = cx - panelWidth / 2;

        // Panel background
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = 'rgba(2, 6, 15, 0.6)';
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.4)';
        ctx.lineWidth = 1.5;

        const rr = 10 * scale;
        ctx.beginPath();
        ctx.moveTo(panelX + rr, panelY);
        ctx.lineTo(panelX + panelWidth - rr, panelY);
        ctx.arcTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + rr, rr);
        ctx.lineTo(panelX + panelWidth, panelY + panelHeight - rr);
        ctx.arcTo(panelX + panelWidth, panelY + panelHeight, panelX + panelWidth - rr, panelY + panelHeight, rr);
        ctx.lineTo(panelX + rr, panelY + panelHeight);
        ctx.arcTo(panelX, panelY + panelHeight, panelX, panelY + panelHeight - rr, rr);
        ctx.lineTo(panelX, panelY + rr);
        ctx.arcTo(panelX, panelY, panelX + rr, panelY, rr);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Accent lines
        ctx.beginPath();
        ctx.moveTo(panelX + 30 * scale, panelY);
        ctx.lineTo(panelX + 120 * scale, panelY);
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(panelX + panelWidth - 120 * scale, panelY + panelHeight);
        ctx.lineTo(panelX + panelWidth - 30 * scale, panelY + panelHeight);
        ctx.strokeStyle = '#b700ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Task text
        const task = TASKS[this.currentTaskIndex];
        const textY = panelY + 28 * scale;

        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#00f2ff';
        ctx.font = `${18 * scale}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(task.icon, panelX + 20 * scale, textY);

        ctx.fillStyle = '#eef8ff';
        ctx.font = `bold ${14 * scale}px "Courier New", monospace`;
        ctx.fillText(task.text, panelX + 48 * scale, textY - 2 * scale);

        // Progress bar
        const barY = panelY + 45 * scale;
        const barWidth = panelWidth - 40 * scale;
        const barHeight = 4 * scale;
        const barX = panelX + 20 * scale;

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#00f2ff';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const barGrad = ctx.createLinearGradient(barX, 0, barX + barWidth * this.taskProgress, 0);
        barGrad.addColorStop(0, '#00f2ff');
        barGrad.addColorStop(1, '#b700ff');
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = barGrad;
        ctx.fillRect(barX, barY, barWidth * this.taskProgress, barHeight);

        if (this.taskProgress > 0.01) {
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(barX + barWidth * this.taskProgress, barY + barHeight / 2, barHeight + 1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    private drawMetrics(ctx: CanvasRenderingContext2D, width: number, scale: number, time: number) {
        ctx.save();
        const metrics = [
            { label: 'QPS', value: (428 + Math.sin(time * 3) * 15).toFixed(0) },
            { label: 'LATENCY', value: (8.2 + Math.sin(time * 2) * 1.5).toFixed(1) + 'ms' },
            { label: 'VRAM', value: (14.3 + Math.sin(time) * 0.2).toFixed(1) + 'GB' }
        ];

        ctx.globalAlpha = 0.4;
        ctx.font = `${10 * scale}px "Courier New", monospace`;
        metrics.forEach((m, i) => {
            const y = 35 * scale + i * 20 * scale;
            ctx.textAlign = 'left';
            ctx.fillStyle = '#00f2ff';
            ctx.fillText(m.label, 20 * scale, y);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(m.value, 80 * scale, y);
        });

        ctx.textAlign = 'right';
        ctx.fillStyle = '#00ffaa';
        ctx.globalAlpha = 0.6 + (Math.sin(time * 5) + 1) / 2 * 0.4;
        ctx.fillText('● SYSTEM OPTIMAL', width - 20 * scale, 35 * scale);

        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#00f2ff';
        ctx.fillText(`THREADS: 128 / CLUSTER 4`, width - 20 * scale, 55 * scale);
        ctx.restore();
    }
}
