type F32 = Float32Array;

function computeOnsetStrength(pcm: F32, sr: number, hopSamples: number): F32 {
  const fftSize = 2048;
  const nFrames = Math.floor((pcm.length - fftSize) / hopSamples);
  if (nFrames <= 1) return new Float32Array(0);

  const numBins = fftSize / 2;
  const hannWindow = new Float32Array(fftSize);
  for (let i = 0; i < fftSize; i++) {
    hannWindow[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }

  const prevMag = new Float32Array(numBins);
  const curMag = new Float32Array(numBins);
  const onset = new Float32Array(nFrames);
  const real = new Float32Array(fftSize);
  const imag = new Float32Array(fftSize);

  for (let f = 0; f < nFrames; f++) {
    const start = f * hopSamples;

    for (let i = 0; i < fftSize; i++) {
      real[i] = (start + i < pcm.length ? pcm[start + i] : 0) * hannWindow[i];
      imag[i] = 0;
    }

    fftInPlace(real, imag, fftSize);

    for (let b = 0; b < numBins; b++) {
      curMag[b] = Math.sqrt(real[b] * real[b] + imag[b] * imag[b]);
    }

    if (f > 0) {
      let flux = 0;
      for (let b = 0; b < numBins; b++) {
        const diff = curMag[b] - prevMag[b];
        if (diff > 0) flux += diff;
      }
      onset[f] = flux;
    }

    prevMag.set(curMag);
  }

  const max = onset.reduce((m, v) => Math.max(m, v), 1e-10);
  for (let i = 0; i < onset.length; i++) onset[i] /= max;

  return onset;
}

function fftInPlace(real: F32, imag: F32, n: number): void {
  const bits = Math.round(Math.log2(n));

  for (let i = 0; i < n; i++) {
    let j = 0;
    for (let b = 0; b < bits; b++) {
      j = (j << 1) | ((i >> b) & 1);
    }
    if (j > i) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }

  for (let size = 2; size <= n; size *= 2) {
    const half = size / 2;
    const angleStep = -2 * Math.PI / size;
    for (let i = 0; i < n; i += size) {
      for (let j = 0; j < half; j++) {
        const angle = angleStep * j;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const evenIdx = i + j;
        const oddIdx = i + j + half;
        const tReal = cos * real[oddIdx] - sin * imag[oddIdx];
        const tImag = sin * real[oddIdx] + cos * imag[oddIdx];
        real[oddIdx] = real[evenIdx] - tReal;
        imag[oddIdx] = imag[evenIdx] - tImag;
        real[evenIdx] += tReal;
        imag[evenIdx] += tImag;
      }
    }
  }
}

function computeEnergyEnvelope(pcm: F32, hopSamples: number): F32 {
  const nFrames = Math.floor(pcm.length / hopSamples);
  const env = new Float32Array(nFrames);
  for (let i = 0; i < nFrames; i++) {
    let sum = 0;
    const start = i * hopSamples;
    const end = Math.min(start + hopSamples, pcm.length);
    for (let j = start; j < end; j++) sum += pcm[j] * pcm[j];
    env[i] = Math.sqrt(sum / (end - start));
  }
  return env;
}

function normalizedCrossCorrelation(
  ref: F32, rec: F32, maxLagFrames: number,
): { bestLag: number; bestCorr: number; corrArray: Float32Array } {
  const len = Math.min(ref.length, rec.length);
  if (len === 0) return { bestLag: 0, bestCorr: 0, corrArray: new Float32Array(0) };

  const totalLags = 2 * maxLagFrames + 1;
  const corrArray = new Float32Array(totalLags);
  let bestLag = 0;
  let bestCorr = -Infinity;

  for (let lagIdx = 0; lagIdx < totalLags; lagIdx++) {
    const lag = lagIdx - maxLagFrames;
    let corr = 0;
    let refNormSq = 0;
    let recNormSq = 0;
    for (let i = 0; i < len; i++) {
      const j = i + lag;
      if (j >= 0 && j < rec.length) {
        corr += ref[i] * rec[j];
        refNormSq += ref[i] * ref[i];
        recNormSq += rec[j] * rec[j];
      }
    }
    const norm = Math.sqrt(refNormSq) * Math.sqrt(recNormSq);
    if (norm > 1e-10) {
      corr = corr / norm;
    } else {
      corr = 0;
    }
    corrArray[lagIdx] = corr;
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  return { bestLag, bestCorr, corrArray };
}

function parabolicInterpolation(
  corrArray: F32, bestIdx: number,
): number {
  if (bestIdx <= 0 || bestIdx >= corrArray.length - 1) return 0;
  const a = corrArray[bestIdx - 1];
  const b = corrArray[bestIdx];
  const c = corrArray[bestIdx + 1];
  const denom = 2 * (2 * b - a - c);
  if (Math.abs(denom) < 1e-10) return 0;
  return (a - c) / denom;
}

function detectOnsets(onset: F32, threshold: number): number[] {
  const indices: number[] = [];
  const adaptive_window = Math.max(5, Math.floor(onset.length / 50));

  for (let i = 1; i < onset.length - 1; i++) {
    if (onset[i] < threshold) continue;
    if (onset[i] <= onset[i - 1] || onset[i] <= onset[i + 1]) continue;

    let localMean = 0;
    let count = 0;
    for (let j = Math.max(0, i - adaptive_window); j < Math.min(onset.length, i + adaptive_window + 1); j++) {
      if (j !== i) { localMean += onset[j]; count++; }
    }
    localMean = count > 0 ? localMean / count : 0;
    if (onset[i] > localMean * 2.0 + 0.02) {
      indices.push(i);
    }
  }
  return indices;
}

function onsetBasedAlignment(
  refOnsets: number[],
  recOnsets: number[],
  hopMs: number,
  maxLagMs: number,
): { offsetMs: number; confidence: number } {
  if (refOnsets.length < 3 || recOnsets.length < 3) {
    return { offsetMs: 0, confidence: 0 };
  }

  const maxLagFrames = Math.round(maxLagMs / hopMs);
  const bucketWidth = 3;
  const bucketMap = new Map<number, number>();

  for (const ro of refOnsets) {
    for (const rco of recOnsets) {
      const lag = rco - ro;
      if (Math.abs(lag) <= maxLagFrames) {
        const bucket = Math.round(lag / bucketWidth) * bucketWidth;
        bucketMap.set(bucket, (bucketMap.get(bucket) || 0) + 1);
      }
    }
  }

  let bestBucket = 0;
  let bestVotes = 0;
  for (const [bucket, votes] of bucketMap) {
    if (votes > bestVotes) { bestVotes = votes; bestBucket = bucket; }
  }

  let weightedSum = 0;
  let weightedCount = 0;
  for (const ro of refOnsets) {
    for (const rco of recOnsets) {
      const lag = rco - ro;
      if (Math.abs(lag - bestBucket) <= bucketWidth) {
        weightedSum += lag;
        weightedCount++;
      }
    }
  }
  const refinedLag = weightedCount > 0 ? weightedSum / weightedCount : bestBucket;

  const totalPairs = refOnsets.length * recOnsets.length;
  const inlierRatio = weightedCount / Math.max(1, Math.min(refOnsets.length, recOnsets.length));
  const confidence = Math.min(1, inlierRatio / 2);

  return { offsetMs: refinedLag * hopMs, confidence };
}

export async function precisionAutoAlign(
  recordedPcm: F32,
  refVocalUrl: string,
  sr: number,
): Promise<number> {
  const resp = await fetch(refVocalUrl);
  if (!resp.ok) throw new Error(`Failed to fetch reference vocal: ${resp.status}`);
  const arrayBuf = await resp.arrayBuffer();
  const decCtx = new OfflineAudioContext(1, 1, sr);
  const refBuffer = await decCtx.decodeAudioData(arrayBuf);
  const refPcm = refBuffer.getChannelData(0);

  const coarseHopMs = 5;
  const coarseHopSamples = Math.round(sr * coarseHopMs / 1000);

  console.log('[PrecisionAlign] Stage 1: Onset strength spectral flux...');
  const refOnset = computeOnsetStrength(refPcm, sr, coarseHopSamples);
  const recOnset = computeOnsetStrength(recordedPcm, sr, coarseHopSamples);

  const refEnergy = computeEnergyEnvelope(refPcm, coarseHopSamples);
  const recEnergy = computeEnergyEnvelope(recordedPcm, coarseHopSamples);

  const maxLagMs = 1500;
  const maxLagFrames = Math.round(maxLagMs / coarseHopMs);

  console.log('[PrecisionAlign] Stage 2: Onset cross-correlation...');
  const onsetXCorr = normalizedCrossCorrelation(refOnset, recOnset, maxLagFrames);

  console.log('[PrecisionAlign] Stage 3: Energy cross-correlation...');
  const energyXCorr = normalizedCrossCorrelation(refEnergy, recEnergy, maxLagFrames);

  console.log('[PrecisionAlign] Stage 4: Onset pair voting...');
  const refOnsetPeaks = detectOnsets(refOnset, 0.08);
  const recOnsetPeaks = detectOnsets(recOnset, 0.08);
  const onsetVote = onsetBasedAlignment(refOnsetPeaks, recOnsetPeaks, coarseHopMs, maxLagMs);

  console.log(`[PrecisionAlign] Onset XCorr: lag=${onsetXCorr.bestLag} frames (${onsetXCorr.bestLag * coarseHopMs}ms), corr=${onsetXCorr.bestCorr.toFixed(4)}`);
  console.log(`[PrecisionAlign] Energy XCorr: lag=${energyXCorr.bestLag} frames (${energyXCorr.bestLag * coarseHopMs}ms), corr=${energyXCorr.bestCorr.toFixed(4)}`);
  console.log(`[PrecisionAlign] Onset Vote: offset=${onsetVote.offsetMs.toFixed(1)}ms, confidence=${onsetVote.confidence.toFixed(3)}`);

  const candidates: Array<{
    lagFrames: number; ms: number; weight: number; corr: number; name: string;
    corrArray: Float32Array; corrIdx: number;
  }> = [
    {
      lagFrames: onsetXCorr.bestLag,
      ms: onsetXCorr.bestLag * coarseHopMs,
      weight: 0.45,
      corr: onsetXCorr.bestCorr,
      name: 'onset-xcorr',
      corrArray: onsetXCorr.corrArray,
      corrIdx: onsetXCorr.bestLag + maxLagFrames,
    },
    {
      lagFrames: energyXCorr.bestLag,
      ms: energyXCorr.bestLag * coarseHopMs,
      weight: 0.30,
      corr: energyXCorr.bestCorr,
      name: 'energy-xcorr',
      corrArray: energyXCorr.corrArray,
      corrIdx: energyXCorr.bestLag + maxLagFrames,
    },
    {
      lagFrames: Math.round(onsetVote.offsetMs / coarseHopMs),
      ms: onsetVote.offsetMs,
      weight: 0.25 * onsetVote.confidence,
      corr: onsetVote.confidence,
      name: 'onset-vote',
      corrArray: onsetXCorr.corrArray,
      corrIdx: Math.round(onsetVote.offsetMs / coarseHopMs) + maxLagFrames,
    },
  ];

  const lagAgreement = Math.abs(onsetXCorr.bestLag - energyXCorr.bestLag) <= 3;

  let bestMs: number;
  let selectedCandidate: typeof candidates[0];
  if (lagAgreement) {
    const totalWeight = candidates.reduce((s, c) => s + c.weight, 0);
    bestMs = candidates.reduce((s, c) => s + c.ms * c.weight, 0) / totalWeight;
    selectedCandidate = candidates[0];
    console.log(`[PrecisionAlign] Methods agree — weighted average: ${bestMs.toFixed(1)}ms`);
  } else {
    selectedCandidate = candidates.reduce((a, b) => a.weight * a.corr > b.weight * b.corr ? a : b);
    bestMs = selectedCandidate.ms;
    console.log(`[PrecisionAlign] Methods disagree — using ${selectedCandidate.name}: ${bestMs}ms`);
  }

  console.log('[PrecisionAlign] Stage 5: Sub-frame parabolic refinement...');
  const subFrameCorrection = parabolicInterpolation(selectedCandidate.corrArray, selectedCandidate.corrIdx);
  const refinedMs = bestMs + subFrameCorrection * coarseHopMs;
  console.log(`[PrecisionAlign] Sub-frame correction: ${(subFrameCorrection * coarseHopMs).toFixed(2)}ms → refined: ${refinedMs.toFixed(1)}ms`);

  console.log('[PrecisionAlign] Stage 6: Fine-resolution verification...');
  const fineHopMs = 1;
  const fineHopSamples = Math.round(sr * fineHopMs / 1000);
  const fineSearchWindowMs = 30;
  const fineMaxLag = Math.round(fineSearchWindowMs / fineHopMs);

  const coarseLagSamples = Math.round(refinedMs * sr / 1000);
  const absLag = Math.abs(coarseLagSamples);

  const windowDuration = Math.min(refPcm.length - absLag, recordedPcm.length - absLag, sr * 10);
  if (windowDuration < sr) {
    console.log('[PrecisionAlign] Signal too short for fine stage — using coarse result');
    return clampResult(refinedMs);
  }

  let refWindow: F32;
  let recWindow: F32;
  if (coarseLagSamples >= 0) {
    refWindow = refPcm.subarray(0, windowDuration);
    recWindow = recordedPcm.subarray(coarseLagSamples, coarseLagSamples + windowDuration);
  } else {
    refWindow = refPcm.subarray(-coarseLagSamples, -coarseLagSamples + windowDuration);
    recWindow = recordedPcm.subarray(0, windowDuration);
  }

  const refFine = computeEnergyEnvelope(refWindow, fineHopSamples);
  const recFine = computeEnergyEnvelope(recWindow, fineHopSamples);

  const fineXCorr = normalizedCrossCorrelation(refFine, recFine, fineMaxLag);
  const fineSubFrame = parabolicInterpolation(fineXCorr.corrArray, fineXCorr.bestLag + fineMaxLag);
  const fineCorrection = (fineXCorr.bestLag + fineSubFrame) * fineHopMs;

  const finalMs = refinedMs + fineCorrection;
  console.log(`[PrecisionAlign] Fine correction: ${fineCorrection.toFixed(2)}ms (corr=${fineXCorr.bestCorr.toFixed(4)})`);
  console.log(`[PrecisionAlign] ★ Final offset: ${finalMs.toFixed(1)}ms`);

  const confidence = Math.max(onsetXCorr.bestCorr, energyXCorr.bestCorr);

  const baselineXCorr = normalizedCrossCorrelation(refOnset, recOnset, 0);
  const improvement = confidence / (baselineXCorr.bestCorr || 1e-10);

  if (improvement < 1.02 && Math.abs(finalMs) < 5) {
    console.log('[PrecisionAlign] Already well-aligned (improvement < 2%, offset < 5ms) — returning 0');
    return 0;
  }

  return clampResult(finalMs);
}

function clampResult(ms: number): number {
  if (Math.abs(ms) > 1500) {
    console.warn(`[PrecisionAlign] Offset ${ms.toFixed(1)}ms exceeds safety range — clamping`);
    return ms > 0 ? 1500 : -1500;
  }
  return Math.round(ms);
}
