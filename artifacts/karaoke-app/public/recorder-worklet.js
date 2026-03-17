/**
 * Recorder AudioWorklet Processor — sample-accurate PCM capture.
 *
 * Captures raw Float32 mono audio from the mic chain with exact
 * AudioContext timestamps so the main thread can trim the recording
 * to align perfectly with the song's start time.
 *
 * Protocol:
 *   worklet←main  { type:'stop' }               → flush & send 'done'
 *   worklet→main  { type:'chunk', buf:Float32Array, time:number }
 *   worklet→main  { type:'done',  firstTime:number, sampleRate:number }
 */
const CHUNK = 8192; // samples per postMessage chunk (~170ms @ 48kHz)

class RecorderProcessor extends AudioWorkletProcessor {
  constructor () {
    super();
    this._firstTime = -1;
    this._acc    = new Float32Array(CHUNK);
    this._pos    = 0;
    this._active = true;

    this.port.onmessage = ({ data }) => {
      if (data.type === 'stop') {
        this._active = false;
        // Flush remaining samples
        if (this._pos > 0) {
          this.port.postMessage(
            { type: 'chunk', buf: this._acc.subarray(0, this._pos).slice(), time: this._firstTime },
            // No transfer — subarray.slice() is a new allocation, cheap to copy
          );
          this._pos = 0;
        }
        this.port.postMessage({ type: 'done', firstTime: this._firstTime, sampleRate });
      }
    };
  }

  process (inputs) {
    if (!this._active) return false;

    const input = inputs[0]?.[0];
    if (!input || input.length === 0) return true;

    // Record the AudioContext time of the FIRST captured sample
    if (this._firstTime < 0) this._firstTime = currentTime;

    let srcOff = 0;
    while (srcOff < input.length) {
      const space   = CHUNK - this._pos;
      const n       = Math.min(space, input.length - srcOff);
      this._acc.set(input.subarray(srcOff, srcOff + n), this._pos);
      this._pos  += n;
      srcOff     += n;

      if (this._pos >= CHUNK) {
        // Transfer the buffer to main thread (zero-copy via transfer)
        const buf = this._acc;
        this._acc = new Float32Array(CHUNK);
        this._pos = 0;
        this.port.postMessage({ type: 'chunk', buf, time: this._firstTime }, [buf.buffer]);
      }
    }
    return true;
  }
}

registerProcessor('recorder-processor', RecorderProcessor);
