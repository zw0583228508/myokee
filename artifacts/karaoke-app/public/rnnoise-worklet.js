/**
 * RNNoise AudioWorklet Processor  (Mozilla/Xiph neural noise suppressor)
 * Runs in an isolated audio-thread at 48 kHz with no main-thread blocking.
 *
 * WASM export map (jitsi/@jitsi/rnnoise-wasm build):
 *   c → memory          d → __wasm_call_ctors
 *   e → malloc          f → free
 *   g → rnnoise_init    h → rnnoise_create
 *   i → rnnoise_destroy j → rnnoise_process_frame(state, out_ptr, in_ptr)
 *
 * WASM import map:
 *   a.a → _emscripten_resize_heap  (simple growable-memory stub)
 *   a.b → _emscripten_memcpy_big   (memmove for large copies)
 *
 * Protocol (main ↔ worklet postMessage):
 *   main→worklet  { type:'wasm',   buffer: ArrayBuffer }  transfer WASM binary
 *   main→worklet  { type:'bypass', value: boolean }        bypass toggle
 *   worklet→main  { type:'ready' }                         init complete
 *   worklet→main  { type:'error', message: string }        init failed
 *
 * Latency added: 480 samples (1 rnnoise frame) ≈ 10 ms @ 48 kHz
 */

const FRAME  = 480;    // rnnoise native frame size at 48 kHz
const SCALE  = 32768;  // rnnoise expects int16 range as float32

class RNNoiseProcessor extends AudioWorkletProcessor {
  constructor () {
    super();
    this._ready  = false;
    this._bypass = false;

    // Ring buffers: 128-sample WebAudio blocks ↔ 480-sample rnnoise frames
    this._inBuf  = new Float32Array(FRAME * 2);
    this._inLen  = 0;
    this._outBuf = new Float32Array(FRAME * 4);
    this._outLen = 0;

    // WASM handles (populated after _initWasm)
    this._ex     = null;   // WASM exports object
    this._mem    = null;   // WebAssembly.Memory
    this._state  = 0;      // rnnoise DenoiseState*
    this._inPtr  = 0;      // malloc'd input  frame (float32 × 480)
    this._outPtr = 0;      // malloc'd output frame (float32 × 480)

    this.port.onmessage = ({ data }) => {
      if (data.type === 'wasm')   this._initWasm(data.buffer);
      if (data.type === 'bypass') this._bypass = !!data.value;
    };
  }

  _initWasm (wasmBuf) {
    try {
      // We supply the two emscripten imports that rnnoise actually calls:
      //   a.a  _emscripten_resize_heap — grow the WebAssembly.Memory
      //   a.b  _emscripten_memcpy_big  — memmove for large regions
      //
      // We do NOT supply a pre-created memory; the WASM exports its own (c).

      const resizeHeap = (reqBytes) => {
        // Called when malloc needs more pages. Grow by the requested amount.
        const mem   = this._mem;
        if (!mem) return 0;
        const curBytes  = mem.buffer.byteLength;
        const needPages = Math.ceil((reqBytes - curBytes) / 65536);
        if (needPages <= 0) return 1;
        try { mem.grow(needPages); return 1; } catch { return 0; }
      };

      const memcpyBig = (dst, src, n) => {
        const view = new Uint8Array(this._mem.buffer);
        view.copyWithin(dst, src, src + n);
      };

      const mod  = new WebAssembly.Module(wasmBuf);
      const inst = new WebAssembly.Instance(mod, {
        a: { a: resizeHeap, b: memcpyBig },
      });

      const ex       = inst.exports;
      this._ex       = ex;
      this._mem      = ex.c;               // exported memory

      // Run emscripten ctors (sets up global C++ state)
      if (ex.d) ex.d();

      // rnnoise_create(NULL) — uses built-in RNNoise model weights
      this._state = ex.h(0);
      if (!this._state) throw new Error('rnnoise_create() returned null');

      // Allocate WASM-side I/O buffers (float32 × 480 = 1920 bytes each)
      this._inPtr  = ex.e(FRAME * 4);
      this._outPtr = ex.e(FRAME * 4);
      if (!this._inPtr || !this._outPtr) throw new Error('malloc failed');

      this._ready = true;
      this.port.postMessage({ type: 'ready' });
    } catch (err) {
      this.port.postMessage({ type: 'error', message: String(err) });
    }
  }

  /** Run one 480-sample frame through rnnoise. Returns denoised Float32Array. */
  _denoise (inputSlice) {
    const ex      = this._ex;
    const memBuf  = this._mem.buffer;

    // Write input (scaled to int16 range) into WASM memory
    const inView  = new Float32Array(memBuf, this._inPtr,  FRAME);
    for (let i = 0; i < FRAME; i++) inView[i] = inputSlice[i] * SCALE;

    // ex.j = rnnoise_process_frame(state, out_ptr, in_ptr)
    ex.j(this._state, this._outPtr, this._inPtr);

    // Read denoised output (scale back to [-1, +1])
    const outView = new Float32Array(memBuf, this._outPtr, FRAME);
    const result  = new Float32Array(FRAME);
    for (let i = 0; i < FRAME; i++) result[i] = outView[i] / SCALE;
    return result;
  }

  process (inputs, outputs) {
    const input  = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    if (!this._ready || this._bypass || !input) {
      if (input) output.set(input);
      return true;
    }

    // ── Push 128-sample WebAudio block into input ring ────────────────────
    this._inBuf.set(input, this._inLen);
    this._inLen += input.length;

    // ── Process complete 480-sample rnnoise frames ────────────────────────
    while (this._inLen >= FRAME) {
      const denoised = this._denoise(this._inBuf.subarray(0, FRAME));

      this._outBuf.set(denoised, this._outLen);
      this._outLen += FRAME;

      // Consume the processed 480 samples from the input ring
      this._inBuf.copyWithin(0, FRAME, this._inLen);
      this._inLen -= FRAME;
    }

    // ── Drain output ring into the current 128-sample WebAudio block ──────
    const available = Math.min(output.length, this._outLen);
    output.set(this._outBuf.subarray(0, available));
    if (available < output.length) output.fill(0, available);

    if (available > 0) {
      this._outBuf.copyWithin(0, available, this._outLen);
      this._outLen -= available;
    }

    return true;
  }
}

registerProcessor('rnnoise-processor', RNNoiseProcessor);
