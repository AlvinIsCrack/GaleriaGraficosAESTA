/**
 * Clase que gestiona un temporizador con soporte para pausa, reanudación y tick de actualización.
 * Permite ejecutar un callback al finalizar el tiempo y opcionalmente notificar el tiempo restante.
 */
export class Timer {
    private timerId: number | null = null;
    private startTime: number | null = null;
    private remaining: number;
    private animationFrameId: number | null = null;

    private callback: () => void;
    private duration: number;
    private onTick?: (remaining: number) => void;

    constructor(
        callback: () => void,
        duration: number,
        onTick?: (remaining: number) => void
    ) {
        this.callback = callback;
        this.duration = duration;
        this.onTick = onTick;
        this.remaining = duration;

        document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }

    /** Para manejar cuando no se esté en focus a la pestaña del navegador */
    private handleVisibilityChange = () => {
        if (document.hidden) {
            this.pause();
        } else {
            if (this.remaining > 0 && this.remaining < this.duration) {
                this.start();
            }
        }
    };

    private tick = () => {
        if (this.startTime && this.onTick) {
            const elapsed = Date.now() - this.startTime;
            const currentRemaining = Math.max(0, this.remaining - elapsed);
            this.onTick(currentRemaining);
            this.animationFrameId = requestAnimationFrame(this.tick);
        }
    };

    start = () => {
        if (this.timerId) return;
        this.startTime = Date.now();
        this.timerId = setTimeout(() => {
            this.callback();
            this.reset();
            this.start();
        }, this.remaining);

        if (this.onTick) this.tick();
    };

    pause = () => {
        if (!this.timerId || !this.startTime) return;
        clearTimeout(this.timerId);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

        this.remaining -= Date.now() - this.startTime;
        this.timerId = null;
        this.startTime = null;
    };

    reset = (newDuration?: number) => {
        this.pause();
        if (newDuration) this.duration = newDuration;
        this.remaining = this.duration;
        // Notificamos el reset a la UI
        if (this.onTick) this.onTick(this.remaining);
    };

    destroy = () => {
        this.pause();
        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    };

    get progress() {
        return 1 - (this.remaining / this.duration);
    }
}