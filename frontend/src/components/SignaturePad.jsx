import { useRef } from 'react';

// receiver signs with finger or mouse; onSave gets a PNG as base64 text
function SignaturePad({ onSave }) {
    const canvasRef = useRef(null);
    const drawing = useRef(false);

    // get the mouse/finger position relative to the canvas
    function getPoint(e) {
        const rect = canvasRef.current.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function start(e) {
        drawing.current = true;
        const ctx = canvasRef.current.getContext('2d');
        const p = getPoint(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    }

    function move(e) {
        if (!drawing.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const p = getPoint(e);
        ctx.lineWidth = 2;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    }

    function stop() {
        drawing.current = false;
    }

    function clear() {
        const c = canvasRef.current;
        c.getContext('2d').clearRect(0, 0, c.width, c.height);
    }

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={320}
                height={160}
                className="border rounded bg-white d-block mb-2"
                style={{ touchAction: 'none' }}
                onPointerDown={start}
                onPointerMove={move}
                onPointerUp={stop}
                onPointerLeave={stop}
            />
            <button type="button" className="btn btn-outline-secondary btn-sm me-2" onClick={clear}>
                Clear
            </button>
            <button type="button" className="btn btn-success btn-sm"
                onClick={() => onSave(canvasRef.current.toDataURL('image/png'))}>
                Save signature
            </button>
        </div>
    );
}

export default SignaturePad;